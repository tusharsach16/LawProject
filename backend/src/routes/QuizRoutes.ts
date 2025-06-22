import express, { Request, Response } from 'express';
import  {getQuizQues, result, submitAttempt}  from '../controllers/quizController';
import authMiddleware from '../middleware/authMiddleware';
const router = express.Router();

router.get('/getQuiz', authMiddleware, getQuizQues);
router.post('/submit', authMiddleware, submitAttempt);
router.get('/getResult', authMiddleware, result);
export default router;