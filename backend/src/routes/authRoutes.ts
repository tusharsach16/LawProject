import express, { Request, Response } from 'express';
import { signupUser, loginUser, getUser } from '../controllers/authController';
import authMiddleware from '../middleware/authMiddleware';
import { forgotPassword, resetPassword, verifyOtp} from '../controllers/forgotPassword';
import {loginLimiter, signupLimiter, forgotPasswordLimiter, otpVerifyLimiter, resetPasswordLimiter, userLimiter} from '../middleware/rateLimiter';
const router = express.Router();

router.post('/signup', signupLimiter, signupUser);
router.post('/login', loginLimiter, loginUser);

router.get('/get', authMiddleware, userLimiter, getUser);

router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/verify-otp', otpVerifyLimiter, verifyOtp);
router.post('/reset-password', resetPasswordLimiter, resetPassword);
export default router;
