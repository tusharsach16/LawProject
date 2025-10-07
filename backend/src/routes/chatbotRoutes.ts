import express from 'express';
import { chatbot, getChatHistory } from '../controllers/chatbotcontroller';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.post('/chat', authMiddleware, chatbot);
router.get('/chat', authMiddleware, getChatHistory);

export default router;