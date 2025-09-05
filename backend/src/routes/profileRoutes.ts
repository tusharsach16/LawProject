import express from 'express';
import { updateProfile } from '../controllers/updateProfile';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.patch('/edit/profile', authMiddleware, updateProfile);

export default router;