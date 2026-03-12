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
import {
  generateCallToken,
  verifyCallAccess,
  markCallCompleted,
  addParticipant,
  removeParticipant
} from '../controllers/callController';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Appointments
 *     description: Appointment booking and management
 *   - name: Payments
 *     description: Razorpay integration and payment verification
 *   - name: Lawyer Availability
 *     description: Manage lawyer working hours and slots
 *   - name: Video Calls
 *     description: WebRTC signaling and call management
 */

// Payment routes
/**
 * @openapi
 * /api/appointments/create-order:
 *   post:
 *     tags: [Payments]
 *     summary: Create a Razorpay payment order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lawyerId, appointmentTime, duration, price]
 *             properties:
 *               lawyerId: { type: string }
 *               appointmentTime: { type: string, format: date-time }
 *               duration: { type: number, example: 30 }
 *               price: { type: number }
 *     responses:
 *       201:
 *         description: Order created
 */
router.post('/create-order', authMiddleware, createPaymentOrder);

/**
 * @openapi
 * /api/appointments/verify-payment:
 *   post:
 *     tags: [Payments]
 *     summary: Verify Razorpay payment signature
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId]
 *     responses:
 *       200:
 *         description: Payment verified
 */
router.post('/verify-payment', authMiddleware, verifyPayment);

// Appointment management
/**
 * @openapi
 * /api/appointments/cancel:
 *   post:
 *     tags: [Appointments]
 *     summary: Cancel a scheduled appointment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [appointmentId, reason]
 *     responses:
 *       200:
 *         description: Appointment cancelled
 */
router.post('/cancel', authMiddleware, cancelAppointment);

/**
 * @openapi
 * /api/appointments/available-slots:
 *   get:
 *     tags: [Lawyer Availability]
 *     summary: Get available slots for a lawyer on a specific date
 *     parameters:
 *       - in: query
 *         name: lawyerId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: date
 *         required: true
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: List of time slots
 */
router.get('/available-slots', getAvailableSlots);

// Lawyer availability
/**
 * @openapi
 * /api/appointments/lawyer/availability:
 *   post:
 *     tags: [Lawyer Availability]
 *     summary: Set or update lawyer availability slots
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Availability updated
 *   get:
 *     tags: [Lawyer Availability]
 *     summary: Get lawyer schedule
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Availability data
 */
router.post('/lawyer/availability', authMiddleware, setLawyerAvailability);
router.get('/lawyer/availability', authMiddleware, getLawyerAvailability);

// Appointment retrieval
/**
 * @openapi
 * /api/appointments/lawyer/appointments:
 *   get:
 *     tags: [Appointments]
 *     summary: Get all appointments for the logged-in lawyer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of appointments
 */
router.get('/lawyer/appointments', authMiddleware, getLawyerAppointments);

/**
 * @openapi
 * /api/appointments/lawyer/stats:
 *   get:
 *     tags: [Appointments]
 *     summary: Get summary statistics for lawyer appointments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats data
 */
router.get('/lawyer/stats', authMiddleware, getLawyerAppointmentStats);

/**
 * @openapi
 * /api/appointments/user/appointments:
 *   get:
 *     tags: [Appointments]
 *     summary: Get all appointments for the logged-in user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of appointments
 */
router.get('/user/appointments', authMiddleware, getUserAppointments);

/**
 * @openapi
 * /api/appointments/pending:
 *   get:
 *     tags: [Appointments]
 *     summary: Get pending/unpaid appointments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending appointments
 */
router.get('/pending', authMiddleware, getPendingAppointments);

// Video call routes
/**
 * @openapi
 * /api/appointments/generate-call-token:
 *   post:
 *     tags: [Video Calls]
 *     summary: Generate authentication token for a video callroom
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [appointmentId]
 *     responses:
 *       200:
 *         description: Call token and room details
 */
router.post('/generate-call-token', authMiddleware, generateCallToken);

/**
 * @openapi
 * /api/appointments/verify-call-access/{callRoomId}:
 *   get:
 *     tags: [Video Calls]
 *     summary: Verify if user has access to a specific call room
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: callRoomId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Access granted
 */
router.get('/verify-call-access/:callRoomId', authMiddleware, verifyCallAccess);

/**
 * @openapi
 * /api/appointments/mark-call-completed:
 *   post:
 *     tags: [Video Calls]
 *     summary: Mark a call as finished and update session duration
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Call updated
 */
router.post('/mark-call-completed', authMiddleware, markCallCompleted);

/**
 * @openapi
 * /api/appointments/add-participant:
 *   post:
 *     tags: [Video Calls]
 *     summary: Log participant joining call
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Participant added
 */
router.post('/add-participant', authMiddleware, addParticipant);

/**
 * @openapi
 * /api/appointments/remove-participant:
 *   post:
 *     tags: [Video Calls]
 *     summary: Log participant leaving call
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Participant removed
 */
router.post('/remove-participant', authMiddleware, removeParticipant);

export default router;