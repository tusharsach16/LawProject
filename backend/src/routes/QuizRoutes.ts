import express, { Request, Response } from 'express';
import  {getQuizQues, result, submitAttempt, getQuizCount, getDetailedQuizResults, getRecentActivities, getQuizStatistics}  from '../controllers/quizController';
import authMiddleware from '../middleware/authMiddleware';
const router = express.Router();

router.get('/quiz/getQuiz', authMiddleware, getQuizQues);
router.post('/quiz/submit', authMiddleware, submitAttempt);
router.get('/quiz/getResult', authMiddleware, result);
router.get('/quiz/count', authMiddleware, getQuizCount);
router.get('/quiz/detailed-results', authMiddleware, getDetailedQuizResults);
router.get('/quiz/statistics', authMiddleware, getQuizStatistics);
router.get('/quiz/recent-activities', authMiddleware, getRecentActivities);
export default router;