import express from 'express';
import authMiddleware from '../middleware/authMiddleware';
import {
  createPaymentOrder,
  verifyPayment,
  cancelAppointment,
  getAvailableSlots,
  setLawyerAvailability,
  getLawyerAvailability,
  getLawyerAppointments,
  getUserAppointments,
  getLawyerAppointmentStats,
  getPendingAppointments
} from '../controllers/appointmentController';

const router = express.Router();

// Payment routes
router.post('/create-order', authMiddleware, createPaymentOrder);
router.post('/verify-payment', authMiddleware, verifyPayment);

// Appointment management
router.post('/cancel', authMiddleware, cancelAppointment);
router.get('/available-slots', getAvailableSlots);

// Lawyer availability
router.post('/lawyer/availability', authMiddleware, setLawyerAvailability);
router.get('/lawyer/availability', authMiddleware, getLawyerAvailability);

// Appointment retrieval
router.get('/lawyer/appointments', authMiddleware, getLawyerAppointments);
router.get('/lawyer/stats', authMiddleware, getLawyerAppointmentStats);
router.get('/user/appointments', authMiddleware, getUserAppointments);

router.get('/pending', authMiddleware, getPendingAppointments);

export default router;