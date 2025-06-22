import express, { Request, Response } from 'express';
import { signupUser, loginUser, getUser } from '../controllers/authController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);

router.get('/get', authMiddleware, getUser);
export default router;
