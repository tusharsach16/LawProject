import express, { Request, Response } from 'express';
import { signupUser, loginUser, getUser } from '../controllers/authController';
import authMiddleware from '../middleware/authMiddleware';
import { forgotPassword, resetPassword, verifyOtp } from '../controllers/forgotPassword';
import { loginLimiter, signupLimiter, forgotPasswordLimiter, otpVerifyLimiter, resetPasswordLimiter, userLimiter } from '../middleware/rateLimiter';
const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Auth
 *   description: User authentication and password management
 */

/**
 * @openapi
 * /api/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, username, email, phoneNumber, password, role]
 *             properties:
 *               name:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [general, lawstudent, lawyer]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post('/signup', signupLimiter, signupUser);

/**
 * @openapi
 * /api/login:
 *   post:
 *     tags: [Auth]
 *     summary: Sign in user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginLimiter, loginUser);

/**
 * @openapi
 * /api/get:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated user details
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/get', authMiddleware, userLimiter, getUser);

/**
 * @openapi
 * /api/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Send OTP for password recovery
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent
 */
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);

/**
 * @openapi
 * /api/verify-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify recovery OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified
 */
router.post('/verify-otp', otpVerifyLimiter, verifyOtp);

/**
 * @openapi
 * /api/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Set new password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.post('/reset-password', resetPasswordLimiter, resetPassword);
export default router;
