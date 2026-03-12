import express from 'express';
import { chatbot, getChatHistory } from '../controllers/chatbotcontroller';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Chatbot
 *   description: AI-powered legal assistant and chat history
 */

/**
 * @openapi
 * /api/chat:
 *   post:
 *     tags: [Chatbot]
 *     summary: Send a message to the AI chatbot
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string }
 *     responses:
 *       200:
 *         description: AI response
 *   get:
 *     tags: [Chatbot]
 *     summary: Retrieve chat history for the user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of previous messages
 */
router.post('/chat', authMiddleware, chatbot);
router.get('/chat', authMiddleware, getChatHistory);

export default router;