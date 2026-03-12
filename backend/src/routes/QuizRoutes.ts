import express, { Request, Response } from 'express';
import { getQuizQues, result, submitAttempt, getQuizCount, getDetailedQuizResults, getRecentActivities, getQuizStatistics } from '../controllers/quizController';
import authMiddleware from '../middleware/authMiddleware';
const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Quiz
 *   description: Legal knowledge assessment and progress tracking
 */

/**
 * @openapi
 * /api/quiz/getQuiz:
 *   get:
 *     tags: [Quiz]
 *     summary: Get quiz questions for a category
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of questions
 */
router.get('/quiz/getQuiz', authMiddleware, getQuizQues);

/**
 * @openapi
 * /api/quiz/submit:
 *   post:
 *     tags: [Quiz]
 *     summary: Submit quiz answers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Submission successful
 */
router.post('/quiz/submit', authMiddleware, submitAttempt);

/**
 * @openapi
 * /api/quiz/getResult:
 *   get:
 *     tags: [Quiz]
 *     summary: Get result of a specific quiz attempt
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Result details
 */
router.get('/quiz/getResult', authMiddleware, result);

/**
 * @openapi
 * /api/quiz/count:
 *   get:
 *     tags: [Quiz]
 *     summary: Get total number of quizzes completed
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Count value
 */
router.get('/quiz/count', authMiddleware, getQuizCount);

/**
 * @openapi
 * /api/quiz/detailed-results:
 *   get:
 *     tags: [Quiz]
 *     summary: Get comprehensive history of quiz performance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of detailed results
 */
router.get('/quiz/detailed-results', authMiddleware, getDetailedQuizResults);

/**
 * @openapi
 * /api/quiz/statistics:
 *   get:
 *     tags: [Quiz]
 *     summary: Get aggregated quiz statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats data
 */
router.get('/quiz/statistics', authMiddleware, getQuizStatistics);

/**
 * @openapi
 * /api/quiz/recent-activities:
 *   get:
 *     tags: [Quiz]
 *     summary: Get user's recent quiz activity feed
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Activity log
 */
router.get('/quiz/recent-activities', authMiddleware, getRecentActivities);
export default router;