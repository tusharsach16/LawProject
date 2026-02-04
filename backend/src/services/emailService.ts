import nodemailer from 'nodemailer';
import {
  UserEmailDTO,
  LawyerEmailDTO,
  AppointmentEmailDTO
} from '../types/email';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});

export async function verifySMTP(): Promise<void> {
  await transporter.verify();
}

export async function sendAppointmentConfirmation(
  user: UserEmailDTO,
  lawyer: LawyerEmailDTO,
  appointment: AppointmentEmailDTO
): Promise<void> {
  const appointmentDate = new Date(appointment.appointmentTime).toLocaleString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });

  const callLink = `${process.env.CLIENT_URL}/dashboard/call/${appointment.callRoomId}`;

  const cancellationDeadline = new Date(appointment.appointmentTime);
  cancellationDeadline.setHours(cancellationDeadline.getHours() - 12);

  const deadlineStr = cancellationDeadline.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });

  await transporter.sendMail({
    from: `"NyaySetu" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: `Appointment Confirmed with Adv. ${lawyer.name}`,
    html: `
      <p>Dear ${user.name},</p>
      <p>Your appointment with Adv. ${lawyer.name} is confirmed.</p>
      <p>Date & Time: ${appointmentDate}</p>
      <p>Duration: ${appointment.duration} minutes</p>
      <p>Amount Paid: ₹${appointment.price}</p>
      <p>Appointment ID: ${appointment._id}</p>
      <p><a href="${callLink}">Join Video Call</a></p>
      <p>Free cancellation until ${deadlineStr}</p>
    `
  });

  await transporter.sendMail({
    from: `"NyaySetu" <${process.env.SMTP_USER}>`,
    to: lawyer.email,
    subject: `New Appointment: ${user.name}`,
    html: `
      <p>Client: ${user.name}</p>
      <p>Email: ${user.email}</p>
      <p>Date & Time: ${appointmentDate}</p>
      <p>Duration: ${appointment.duration} minutes</p>
      <p>Fee: ₹${appointment.price}</p>
      <p><a href="${callLink}">Join Video Call</a></p>
    `
  });
}

export async function sendCancellationEmail(
  user: UserEmailDTO,
  lawyer: LawyerEmailDTO,
  appointment: AppointmentEmailDTO,
  refundProcessed: boolean
): Promise<void> {
  const appointmentDate = new Date(appointment.appointmentTime).toLocaleString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });

  const cancelledBy = appointment.cancelledBy === 'user' ? 'User' : 'Lawyer';

  await transporter.sendMail({
    from: `"NyaySetu" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: `Appointment Cancelled`,
    html: `
      <p>Your appointment with Adv. ${lawyer.name} has been cancelled.</p>
      <p>Date & Time: ${appointmentDate}</p>
      <p>Amount: ₹${appointment.price}</p>
      <p>Cancelled By: ${cancelledBy}</p>
      <p>${refundProcessed ? `Refund initiated` : `No refund applicable`}</p>
    `
  });

  await transporter.sendMail({
    from: `"NyaySetu" <${process.env.SMTP_USER}>`,
    to: lawyer.email,
    subject: `Appointment Cancelled: ${user.name}`,
    html: `
      <p>The appointment with ${user.name} has been cancelled.</p>
      <p>Date & Time: ${appointmentDate}</p>
    `
  });
}
