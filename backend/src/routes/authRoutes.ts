import express, { Request, Response } from 'express';
import { signupUser, loginUser, getUser } from '../controllers/authController';
import authMiddleware from '../middleware/authMiddleware';
import { forgotPassword, resetPassword, verifyOtp } from '../controllers/forgotPassword';

const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);

router.get('/get', authMiddleware, getUser);

router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

export default router;
