import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { Appointment, LawyerAvailability } from '../models/Appointment';
import { User, Iuser } from '../models/User';
import { Lawyer } from '../models/Lawyer';
import { sendAppointmentConfirmation, sendCancellationEmail } from '../services/emailService';
import { UserEmailDTO, LawyerEmailDTO, AppointmentEmailDTO } from '../types/email';
import {
  acquireBookingLock,
  releaseBookingLock,
  getCachedSlots,
  cacheSlots,
  getCachedLawyerAppointments,
  cacheLawyerAppointments,
  getCachedUserAppointments,
  cacheUserAppointments,
  getCachedLawyerStats,
  cacheLawyerStats,
  invalidateAppointmentCaches
} from '../utils/AppointmentCache';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

const isPastDate = (date: Date): boolean => {
  const now = new Date();
  const checkDate = new Date(date);
  now.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate.getTime() < now.getTime();
};

const isTooSoon = (appointmentTime: Date): boolean => {
  const now = new Date();
  const hoursDiff = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursDiff < 1;
};

const resolveToUserId = async (id: string): Promise<string> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid ID format');
  }

  const user = await User.findById(id);
  if (user && user.role === 'lawyer') {
    return id;
  }

  const lawyerProfile = await Lawyer.findById(id);
  if (lawyerProfile && lawyerProfile.userId) {
    const userId = lawyerProfile.userId.toString();
    const lawyerUser = await User.findById(userId);
    if (lawyerUser && lawyerUser.role === 'lawyer') {
      return userId;
    }
  }

  throw new Error('Lawyer not found');
};

async function checkSlotAvailabilityWithTransaction(
  session: mongoose.ClientSession,
  lawyerId: string,
  appointmentTime: Date,
  duration: number
): Promise<{ isAvailable: boolean; conflictReason?: string }> {
  const newStart = appointmentTime.getTime();
  const newEnd = newStart + duration * 60000;

  console.log(`[Transaction] Checking availability for Lawyer: ${lawyerId}`);
  console.log(`[Transaction] New Slot: ${new Date(newStart).toISOString()} - ${new Date(newEnd).toISOString()}`);

  const searchStart = new Date(newStart - 24 * 60 * 60 * 1000);
  const searchEnd = new Date(newEnd + 24 * 60 * 60 * 1000);

  const existingAppointments = await Appointment.find({
    lawyerId,
    appointmentStatus: 'scheduled',
    paymentStatus: { $in: ['paid', 'pending'] },
    appointmentTime: {
      $gte: searchStart,
      $lte: searchEnd,
    },
  }).session(session);

  console.log(`[Transaction] Found ${existingAppointments.length} existing appointments (including pending).`);

  for (const apt of existingAppointments) {
    const aptDate = new Date(apt.appointmentTime);
    aptDate.setSeconds(0, 0);
    const existingStart = aptDate.getTime();
    const existingEnd = existingStart + apt.duration * 60000;

    if (newStart < existingEnd && newEnd > existingStart) {
      console.log(`[Transaction] Conflict found with Appointment ID: ${apt._id}`);

      const conflictTime = apt.allottedTime || new Date(apt.appointmentTime).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      });

      return {
        isAvailable: false,
        conflictReason: `Conflict with appointment at ${conflictTime}`
      };
    }
  }

  return { isAvailable: true };
}

export const createPaymentOrder = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  let lockAcquired = false;

  try {
    const userId = (req as any).user._id;
    const { lawyerId, appointmentTime, duration } = req.body;
    console.log(`[DEBUG] Received appointmentTime:`, appointmentTime);

    if (!lawyerId || !appointmentTime || !duration) {
      throw new Error('Missing booking details.');
    }

    const appointmentDate = new Date(appointmentTime);
    appointmentDate.setSeconds(0, 0);

    const allottedTime = appointmentDate.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });

    if (isPastDate(appointmentDate)) {
      throw new Error('Cannot book appointments for past dates.');
    }

    if (isTooSoon(appointmentDate)) {
      throw new Error('Appointments must be booked at least 1 hour in advance.');
    }

    let resolvedLawyerId: string;
    try {
      resolvedLawyerId = await resolveToUserId(lawyerId);
    } catch (error) {
      throw new Error('Lawyer not found.');
    }

    // REDIS LOCK: Acquire distributed lock BEFORE starting transaction
    lockAcquired = await acquireBookingLock(resolvedLawyerId, appointmentDate, 10);

    if (!lockAcquired) {
      console.log(`[Redis Lock] ✗ Lock acquisition failed - slot likely being booked by another user`);
      res.status(409).json({
        msg: 'This slot is currently being booked by another user. Please try again.',
        conflict: true,
        retry: true
      });
      return;
    }

    await session.withTransaction(async () => {
      const lawyerUser = await User.findById(resolvedLawyerId).session(session);
      if (!lawyerUser || lawyerUser.role !== 'lawyer') {
        throw new Error('Lawyer not found.');
      }

      const lawyerProfile = await Lawyer.findOne({ userId: resolvedLawyerId }).session(session);
      if (!lawyerProfile) {
        throw new Error('Lawyer profile not found.');
      }

      const price = lawyerProfile.price || 0;
      const totalPrice = price * duration;

      const availabilityCheck = await checkSlotAvailabilityWithTransaction(
        session,
        resolvedLawyerId,
        appointmentDate,
        duration
      );

      if (!availabilityCheck.isAvailable) {
        throw new Error(`This time slot is not available. ${availabilityCheck.conflictReason || ''}`);
      }

      const callRoomId = uuidv4();

      if (totalPrice === 0) {
        const newAppointment = await Appointment.create([{
          lawyerId: resolvedLawyerId,
          userId,
          appointmentTime: appointmentDate,
          duration,
          price: 0,
          paymentStatus: 'paid',
          appointmentStatus: 'scheduled',
          callRoomId,
          allottedTime,
        }], { session });

        setImmediate(async () => {
          try {
            const userDoc = await User.findById(userId).select('name email').lean<Iuser>();
            const lawyerDoc = await User.findById(resolvedLawyerId).select('name email').lean<Iuser>();

            if (userDoc && lawyerDoc) {
              const userDTO: UserEmailDTO = { name: userDoc.name, email: userDoc.email };
              const lawyerDTO: LawyerEmailDTO = { name: lawyerDoc.name, email: lawyerDoc.email };
              const appointmentDTO: AppointmentEmailDTO = {
                _id: newAppointment[0]._id.toString(),
                appointmentTime: newAppointment[0].appointmentTime,
                duration: newAppointment[0].duration,
                price: newAppointment[0].price,
                callRoomId: newAppointment[0].callRoomId,
              };
              await sendAppointmentConfirmation(userDTO, lawyerDTO, appointmentDTO);
            }
          } catch (emailError: any) {
            console.error('Email sending failed:', emailError.message);
          }

          // REDIS: Invalidate caches after free appointment
          await invalidateAppointmentCaches(userId, resolvedLawyerId, appointmentDate);
        });

        (req as any).transactionResult = {
          free: true,
          appointmentId: newAppointment[0]._id,
          msg: 'Appointment booked successfully'
        };
        return;
      }

      const razorpayOrder = await razorpay.orders.create({
        amount: totalPrice * 100,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
      });

      const newAppointment = await Appointment.create([{
        lawyerId: resolvedLawyerId,
        userId,
        appointmentTime: appointmentDate,
        duration,
        price: totalPrice,
        paymentStatus: 'pending',
        appointmentStatus: 'scheduled',
        callRoomId,
        razorpayOrderId: razorpayOrder.id,
        allottedTime,
      }], { session });

      (req as any).transactionResult = {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        appointmentId: newAppointment[0]._id,
      };

    }, {
      readPreference: 'primary',
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' },
      maxCommitTimeMS: 10000
    });

    // REDIS: Invalidate caches after successful booking
    await invalidateAppointmentCaches(userId, resolvedLawyerId, appointmentDate);

    const result = (req as any).transactionResult;
    if (result) {
      res.status(200).json(result);
    } else {
      throw new Error('Transaction completed but no result available');
    }

  } catch (error: any) {
    console.error('[Transaction Error]:', error);

    if (error.code === 11000 ||
      error.errorResponse?.code === 11000 ||
      error.message?.includes('E11000') ||
      error.message?.includes('duplicate')) {
      console.warn(`[Duplicate Booking Prevented] User ${(req as any).user?._id || 'Unknown'} tried to book existing slot.`);
      res.status(400).json({
        msg: 'This slot was just booked by someone else. Please choose another time.',
        conflict: true
      });
      return;
    }

    if (error.hasErrorLabel && error.hasErrorLabel('TransientTransactionError')) {
      console.warn('[Transaction] Transient error, client should retry');
      res.status(409).json({
        msg: 'Booking conflict detected. Please try again.',
        conflict: true,
        retry: true
      });
      return;
    }

    if (error.message && !error.code) {
      res.status(400).json({ msg: error.message });
      return;
    }

    res.status(500).json({ msg: 'Server error creating payment order' });
  } finally {
    // REDIS: Always release the lock
    if (lockAcquired) {
      try {
        const { lawyerId, appointmentTime } = req.body;
        const resolvedLawyerId = await resolveToUserId(lawyerId).catch(() => lawyerId);
        const appointmentDate = new Date(appointmentTime);
        await releaseBookingLock(resolvedLawyerId, appointmentDate);
      } catch (err) {
        console.error('[Redis] Error releasing lock:', err);
      }
    }

    await session.endSession();
  }
};

export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !appointmentId) {
      res.status(400).json({ msg: 'Missing payment verification details' });
      return;
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        paymentStatus: 'failed',
        appointmentStatus: 'cancelled',
      });
      res.status(400).json({ msg: 'Payment verification failed' });
      return;
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        paymentStatus: 'paid',
        razorpayPaymentId: razorpay_payment_id,
      },
      { new: true }
    )
      .populate<{ userId: Iuser }>('userId', 'name email')
      .populate<{ lawyerId: Iuser }>('lawyerId', 'name email');

    if (!updatedAppointment) {
      res.status(404).json({ msg: 'Appointment not found' });
      return;
    }

    const userDTO: UserEmailDTO = {
      name: updatedAppointment.userId.name,
      email: updatedAppointment.userId.email,
    };

    const lawyerDTO: LawyerEmailDTO = {
      name: updatedAppointment.lawyerId.name,
      email: updatedAppointment.lawyerId.email,
    };

    const appointmentDTO: AppointmentEmailDTO = {
      _id: updatedAppointment._id.toString(),
      appointmentTime: updatedAppointment.appointmentTime,
      duration: updatedAppointment.duration,
      price: updatedAppointment.price,
      callRoomId: updatedAppointment.callRoomId,
    };

    sendAppointmentConfirmation(userDTO, lawyerDTO, appointmentDTO).catch((emailError) => {
      console.error('Email sending failed (non-blocking):', emailError.message);
    });

    // REDIS: Invalidate caches
    await invalidateAppointmentCaches(
      updatedAppointment.userId._id.toString(),
      updatedAppointment.lawyerId._id.toString(),
      new Date(updatedAppointment.appointmentTime)
    );

    res.status(200).json({
      success: true,
      msg: 'Payment verified successfully',
      appointment: updatedAppointment,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error verifying payment' });
  }
};

export const cancelAppointment = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const requesterId = (req as any).user._id;
      const { appointmentId, reason } = req.body;

      const appointment = await Appointment.findById(appointmentId)
        .populate<{ userId: Iuser }>('userId', 'name email')
        .populate<{ lawyerId: Iuser }>('lawyerId', 'name email')
        .session(session);

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      const isUser = appointment.userId._id.toString() === requesterId.toString();
      const isLawyer = appointment.lawyerId._id.toString() === requesterId.toString();

      if (!isUser && !isLawyer) {
        console.warn(`[Unauthorized Cancel Attempt] User ${requesterId} tried to cancel apt ${appointmentId}`);
        throw new Error('Not authorized');
      }

      if (appointment.appointmentStatus === 'cancelled') {
        throw new Error('Already cancelled');
      }

      const now = new Date();
      const appointmentTime = new Date(appointment.appointmentTime);
      const hoursDifference = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      let refundProcessed = false;

      const updates: any = {
        cancelledAt: now,
        cancellationReason: reason || `Cancelled by ${isUser ? 'user' : 'lawyer'}`
      };

      const isPending = appointment.paymentStatus === 'pending';

      if (isLawyer) {
        if (appointment.paymentStatus === 'paid' && appointment.razorpayPaymentId) {
          try {
            await razorpay.payments.refund(appointment.razorpayPaymentId, {
              amount: appointment.price * 100,
            });
            updates.paymentStatus = 'refunded';
            refundProcessed = true;
          } catch (error: any) {
            console.error("Refund Error:", error);
            if (
              error.statusCode === 400 &&
              error.error?.code === 'BAD_REQUEST_ERROR' &&
              error.error?.description?.includes('fully refunded')
            ) {
              console.log("Payment already refunded on Razorpay. Marking as refunded in DB.");
              updates.paymentStatus = 'refunded';
              refundProcessed = true;
            }
          }
        }
        updates.appointmentStatus = 'cancelled';
        updates.cancelledBy = 'lawyer';
      } else if (isUser) {
        if (isPending) {
          updates.appointmentStatus = 'cancelled';
          updates.paymentStatus = 'failed';
          updates.cancelledBy = 'user';
        } else if (hoursDifference < 12) {
          updates.appointmentStatus = 'cancelled';
          updates.paymentStatus = 'paid';
          updates.cancelledBy = 'user';
        } else {
          if (appointment.paymentStatus === 'paid' && appointment.razorpayPaymentId) {
            try {
              await razorpay.payments.refund(appointment.razorpayPaymentId, {
                amount: appointment.price * 100,
              });
              updates.paymentStatus = 'refunded';
              refundProcessed = true;
            } catch (error: any) {
              console.error("Refund Error:", error);
              if (
                error.statusCode === 400 &&
                error.error?.code === 'BAD_REQUEST_ERROR' &&
                error.error?.description?.includes('fully refunded')
              ) {
                console.log("Payment already refunded on Razorpay. Marking as refunded in DB.");
                updates.paymentStatus = 'refunded';
                refundProcessed = true;
              }
            }
          }
          updates.appointmentStatus = 'cancelled';
          updates.cancelledBy = 'user';
        }
      }

      const updatedDoc = await Appointment.findByIdAndUpdate(
        appointmentId,
        { $set: updates },
        { new: true, session }
      );

      (req as any).transactionResult = {
        success: true,
        msg: isLawyer ? 'Appointment cancelled and user refunded.' : 'Appointment cancelled.',
        refund: refundProcessed,
        appointment: updatedDoc
      };

      (req as any).emailData = {
        userDTO: { name: appointment.userId.name, email: appointment.userId.email },
        lawyerDTO: { name: appointment.lawyerId.name, email: appointment.lawyerId.email },
        appointmentDTO: {
          _id: appointment._id.toString(),
          appointmentTime: appointment.appointmentTime,
          duration: appointment.duration,
          price: appointment.price,
          callRoomId: appointment.callRoomId,
          cancelledBy: updates.cancelledBy,
          cancellationReason: updates.cancellationReason,
        },
        refundProcessed
      };
    });

    const emailData = (req as any).emailData;
    if (emailData) {
      sendCancellationEmail(
        emailData.userDTO,
        emailData.lawyerDTO,
        emailData.appointmentDTO,
        emailData.refundProcessed
      ).catch(err => console.error("Failed to send cancellation email:", err));
    }

    // REDIS: Invalidate caches
    if (emailData) {
      const appointment = await Appointment.findById(req.body.appointmentId)
        .select('userId lawyerId appointmentTime');

      if (appointment) {
        await invalidateAppointmentCaches(
          appointment.userId.toString(),
          appointment.lawyerId.toString(),
          new Date(appointment.appointmentTime)
        );
      }
    }

    const result = (req as any).transactionResult;
    res.status(200).json(result);

  } catch (error: any) {
    console.error("Error cancelling appointment:", error);

    if (error.message && !error.code) {
      res.status(400).json({ msg: error.message });
      return;
    }

    res.status(500).json({ msg: 'Server error' });
  } finally {
    await session.endSession();
  }
};

export const getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lawyerId, date } = req.query;

    if (!lawyerId || !date) {
      res.status(400).json({ msg: 'lawyerId and date are required', slots: [], allSlots: [] });
      return;
    }

    let resolvedLawyerId: string;
    try {
      resolvedLawyerId = await resolveToUserId(lawyerId as string);
    } catch (error: any) {
      res.status(404).json({ msg: 'Lawyer not found', slots: [], allSlots: [] });
      return;
    }

    const selectedDate = new Date(date as string);

    if (isPastDate(selectedDate)) {
      res.status(400).json({ msg: 'Cannot view slots for past dates', slots: [], allSlots: [] });
      return;
    }

    const dateString = typeof date === 'string' ? date.split('T')[0] : "";

    // REDIS: Check cache first
    const cached = await getCachedSlots(resolvedLawyerId, dateString);
    if (cached) {
      console.log('[Redis Cache] ✓ HIT: Returning cached slots');
      res.status(200).json(cached);
      return;
    }

    const dayOfWeek = selectedDate.getDay();
    const lawyerObjectId = new mongoose.Types.ObjectId(resolvedLawyerId);

    await cleanupExpiredAvailability();

    let availability = await LawyerAvailability.findOne({ lawyerId: lawyerObjectId, date: dateString, isActive: true });

    if (!availability) {
      availability = await LawyerAvailability.findOne({
        lawyerId: lawyerObjectId,
        dayOfWeek,
        isActive: true,
        $or: [
          { date: { $exists: false } },
          { date: "" },
          { date: null }
        ]
      });
    }

    if (!availability) {
      console.log(`[getAvailableSlots] No availability found for lawyer ${resolvedLawyerId} on date ${dateString} / Day ${dayOfWeek}`);
      res.status(200).json({ slots: [], allSlots: [] });
      return;
    }

    console.log(`[getAvailableSlots] Availability found. Slots count: ${availability.slots.length}`);
    availability.slots.forEach(s => console.log(`[getAvailableSlots] Defined Slot: ${s.startTime}-${s.endTime}`));

    const startOfDay = new Date(selectedDate).setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate).setHours(23, 59, 59, 999);
    const searchStart = new Date(startOfDay - 24 * 60 * 60 * 1000);

    console.log(`[getAvailableSlots] Fetching booked slots for Lawyer: ${resolvedLawyerId}`);
    console.log(`[getAvailableSlots] Search window: ${searchStart.toISOString()} - ${new Date(endOfDay).toISOString()}`);

    const booked = await Appointment.find({
      lawyerId: lawyerObjectId,
      appointmentTime: { $gte: searchStart, $lte: endOfDay },
      appointmentStatus: 'scheduled',
      paymentStatus: 'paid'
    });

    console.log(`[getAvailableSlots] Found ${booked.length} booked appointments.`);
    booked.forEach(b => console.log(`[getAvailableSlots] Booked: ${b._id} at ${b.appointmentTime} (${b.duration}m)`));

    const availableSlots: string[] = [];
    const allSlots: Array<{ time: string; status: 'available' | 'booked' | 'past'; duration: number }> = [];
    const now = new Date();

    availability.slots.forEach((slot) => {
      const [sH, sM] = slot.startTime.split(':').map(Number);
      const [eH, eM] = slot.endTime.split(':').map(Number);

      const slotStart = new Date(selectedDate).setHours(sH, sM, 0, 0);
      const slotEnd = new Date(selectedDate).setHours(eH, eM, 0, 0);

      const isTooSoonSlot = isTooSoon(new Date(slotStart));

      const isTaken = booked.some(apt => {
        const bStart = new Date(apt.appointmentTime).getTime();
        const bEnd = bStart + apt.duration * 60000;

        const collision = slotStart < bEnd && slotEnd > bStart;
        return collision;
      });

      const timeString = new Date(slotStart).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const isPast = slotStart <= now.getTime() || isTooSoonSlot;
      const status: 'available' | 'booked' | 'past' = isPast ? 'past' : (isTaken ? 'booked' : 'available');

      const duration = Math.round((slotEnd - slotStart) / 60000);

      allSlots.push({ time: timeString, status, duration });
      if (!isTaken && !isPast) availableSlots.push(timeString);
    });

    const result = { slots: availableSlots, allSlots };

    // REDIS: Cache the result (5 minutes TTL)
    await cacheSlots(resolvedLawyerId, dateString, result, 300);

    res.status(200).json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error fetching slots' });
  }
};

export const setLawyerAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const lawyerId = (req as any).user?._id || (req as any).user?.id;

    if (!lawyerId) {
      res.status(401).json({ msg: 'Unauthorized - No user found' });
      return;
    }

    const { date, dayOfWeek, slots } = req.body;

    if (!mongoose.Types.ObjectId.isValid(lawyerId)) {
      res.status(400).json({ msg: 'Invalid lawyer ID' });
      return;
    }

    if (!Array.isArray(slots)) {
      res.status(400).json({ msg: 'Slots must be an array' });
      return;
    }

    if (date) {
      const selectedDate = new Date(date);
      if (isPastDate(selectedDate)) {
        res.status(400).json({ msg: 'Cannot set availability for past dates' });
        return;
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        res.status(400).json({ msg: 'Date must be in format YYYY-MM-DD' });
        return;
      }
    }

    if (dayOfWeek !== undefined && (dayOfWeek < 0 || dayOfWeek > 6)) {
      res.status(400).json({ msg: 'dayOfWeek must be between 0 and 6' });
      return;
    }

    if (!date && (dayOfWeek === undefined || dayOfWeek === null)) {
      res.status(400).json({ msg: 'Either date or dayOfWeek must be provided' });
      return;
    }

    if (date && dayOfWeek !== undefined && dayOfWeek !== null) {
      res.status(400).json({ msg: 'Cannot provide both date and dayOfWeek' });
      return;
    }

    for (const slot of slots) {
      if (!slot.startTime || !slot.endTime) {
        res.status(400).json({ msg: 'Each slot must have startTime and endTime' });
        return;
      }
      if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(slot.startTime) ||
        !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(slot.endTime)) {
        res.status(400).json({ msg: 'Time must be in format HH:MM (24-hour format)' });
        return;
      }
    }

    const lawyerObjectId = new mongoose.Types.ObjectId(lawyerId);

    const filter: any = { lawyerId: lawyerObjectId };
    const updateData: any = {
      lawyerId: lawyerObjectId,
      slots,
      isActive: slots.length > 0
    };

    if (date) {
      filter.date = date;
      updateData.date = date;
      updateData.dayOfWeek = null;
    } else if (dayOfWeek !== undefined) {
      filter.dayOfWeek = dayOfWeek;
      updateData.dayOfWeek = dayOfWeek;
      updateData.date = null;
    }

    try {
      const availability = await LawyerAvailability.findOneAndUpdate(
        filter,
        updateData,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
          runValidators: true
        }
      );

      if (!availability) {
        throw new Error('Failed to save availability');
      }

      res.status(200).json({
        msg: 'Availability saved successfully',
        availability: {
          _id: availability._id,
          lawyerId: availability.lawyerId,
          date: availability.date,
          dayOfWeek: availability.dayOfWeek,
          slots: availability.slots,
          isActive: availability.isActive
        }
      });
    } catch (dbError: any) {
      console.error('Database error saving availability:', dbError);

      if (dbError.code === 11000) {
        res.status(400).json({
          msg: 'Availability already exists for this date/day.',
          error: 'Duplicate entry'
        });
        return;
      }

      if (dbError.name === 'ValidationError') {
        res.status(400).json({
          msg: 'Validation error',
          error: dbError.message
        });
        return;
      }

      throw dbError;
    }
  } catch (error) {
    console.error('Error saving availability:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      msg: 'Error saving availability',
      error: errorMessage
    });
  }
};

export const getLawyerAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const lawyerId = (req as any).user._id;

    await cleanupExpiredAvailability();

    const availability = await LawyerAvailability.find({ lawyerId });
    res.status(200).json({ availability });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};

async function cleanupExpiredAvailability(): Promise<void> {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    const result = await LawyerAvailability.deleteMany({
      date: { $exists: true, $ne: null, $lt: yesterdayString }
    });

    if (result.deletedCount > 0) {
      console.log(`Cleaned up ${result.deletedCount} expired availability records`);
    }

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const pendingResult = await Appointment.updateMany(
      {
        paymentStatus: 'pending',
        appointmentStatus: 'scheduled',
        createdAt: { $lt: fifteenMinutesAgo }
      },
      {
        $set: {
          appointmentStatus: 'cancelled',
          paymentStatus: 'failed'
        }
      }
    );

    if (pendingResult.modifiedCount > 0) {
      console.log(`Cancelled ${pendingResult.modifiedCount} expired pending payments`);
    }
  } catch (error) {
    console.error('Error cleaning up expired availability:', error);
  }
}

export const getLawyerAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { status } = req.query;

    // REDIS: Check cache first
    const cached = await getCachedLawyerAppointments(userId, status as string);
    if (cached) {
      console.log('[Redis Cache] ✓ HIT: Returning cached lawyer appointments');
      res.status(200).json({ appointments: cached });
      return;
    }

    const filter: any = { lawyerId: userId };

    if (status && status !== 'all') {
      filter.appointmentStatus = status;
    }

    if (status === 'scheduled') {
      filter.paymentStatus = 'paid';
    } else if (status === 'all' || !status) {
      filter.paymentStatus = { $ne: 'pending' };
    }

    const appointments = await Appointment.find(filter)
      .populate('userId', 'name email profileImageUrl')
      .sort({ appointmentTime: -1 });

    // REDIS: Cache the result (1 minute TTL)
    await cacheLawyerAppointments(userId, appointments, status as string, 60);

    res.status(200).json({ appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const getUserAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { status } = req.query;

    // REDIS: Check cache first
    const cached = await getCachedUserAppointments(userId, status as string);
    if (cached) {
      console.log('[Redis Cache] ✓ HIT: Returning cached user appointments');
      res.status(200).json({ appointments: cached });
      return;
    }

    const filter: any = { userId };
    if (status && status !== 'all') filter.appointmentStatus = status;

    const appointments = await Appointment.find(filter)
      .populate('lawyerId', 'name email profileImageUrl experience specialization')
      .sort({ appointmentTime: -1 });

    // REDIS: Cache the result (1 minute TTL)
    await cacheUserAppointments(userId, appointments, status as string, 60);

    res.status(200).json({ appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const getLawyerAppointmentStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;

    // REDIS: Check cache first
    const cached = await getCachedLawyerStats(userId);
    if (cached) {
      console.log('[Redis Cache] ✓ HIT: Returning cached lawyer stats');
      res.status(200).json(cached);
      return;
    }

    const [total, scheduled, completed, cancelled] = await Promise.all([
      Appointment.countDocuments({ lawyerId: userId }),
      Appointment.countDocuments({ lawyerId: userId, appointmentStatus: 'scheduled' }),
      Appointment.countDocuments({ lawyerId: userId, appointmentStatus: 'completed' }),
      Appointment.countDocuments({ lawyerId: userId, appointmentStatus: 'cancelled' })
    ]);

    const totalRevenue = await Appointment.aggregate([
      {
        $match: {
          lawyerId: userId,
          paymentStatus: 'paid',
          appointmentStatus: { $in: ['scheduled', 'completed'] }
        }
      },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    const stats = {
      total,
      scheduled,
      completed,
      cancelled,
      revenue: totalRevenue[0]?.total || 0
    };

    // REDIS: Cache the result (5 minutes TTL)
    await cacheLawyerStats(userId, stats, 300);

    res.status(200).json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const getPendingAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const pendingAppointments = await Appointment.find({
      userId,
      paymentStatus: 'pending',
      appointmentStatus: 'scheduled',
      createdAt: { $gte: fifteenMinutesAgo }
    })
      .populate('lawyerId', 'name profileImageUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({ appointments: pendingAppointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};