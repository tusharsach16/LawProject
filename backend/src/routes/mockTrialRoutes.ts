import express from 'express';
import {
    getMockTrialCategories,
    getSituationsCat,
    leaveMockTrial,
    endMockTrial,
    postMockJoin,
    postMockMessage,
    getMockTrialById,
    checkMatchStatus,
    analyzeTrialResult,
    getPastTrials,
    getMockTrialStatistics
} from '../controllers/MockTrails/MockTrailController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Mock Trials
 *   description: Real-time simulated legal proceedings and analysis
 */

/**
 * @openapi
 * /api/mock-trials/situationsCategory:
 *   get:
 *     tags: [Mock Trials]
 *     summary: Retrieve situations grouped by category
 *     responses:
 *       200:
 *         description: Categorized situations
 */
router.get('/mock-trials/situationsCategory', getSituationsCat);

/**
 * @openapi
 * /api/mock-trials/categories:
 *   get:
 *     tags: [Mock Trials]
 *     summary: Get available mock trial categories
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/mock-trials/categories', getMockTrialCategories);

/**
 * @openapi
 * /api/mock-trials/past-trials:
 *   get:
 *     tags: [Mock Trials]
 *     summary: Get user's mock trial history
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: History of trials
 */
router.get('/mock-trials/past-trials', authMiddleware, getPastTrials);

/**
 * @openapi
 * /api/mock-trials/statistics:
 *   get:
 *     tags: [Mock Trials]
 *     summary: Get mock trial experience/performance stats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary stats
 */
router.get('/mock-trials/statistics', authMiddleware, getMockTrialStatistics);

/**
 * @openapi
 * /api/mock-trials/check-match/{situationId}:
 *   get:
 *     tags: [Mock Trials]
 *     summary: Check if user is currently matched in a trial for a situation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: situationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Match status
 */
router.get('/mock-trials/check-match/:situationId', authMiddleware, checkMatchStatus);

/**
 * @openapi
 * /api/mock-trials/{trialId}:
 *   get:
 *     tags: [Mock Trials]
 *     summary: Get full details of a specific trial
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trialId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Trial data
 */
router.get('/mock-trials/:trialId', authMiddleware, getMockTrialById);

/**
 * @openapi
 * /api/mock-trials/join:
 *   post:
 *     tags: [Mock Trials]
 *     summary: Join a mock trial queue or session
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Joined session
 */
router.post('/mock-trials/join', authMiddleware, postMockJoin);

/**
 * @openapi
 * /api/mock-trials/end:
 *   post:
 *     tags: [Mock Trials]
 *     summary: Formally end a mock trial
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trial ended
 */
router.post('/mock-trials/end', authMiddleware, endMockTrial);

/**
 * @openapi
 * /api/mock-trials/leave:
 *   post:
 *     tags: [Mock Trials]
 *     summary: Leave an ongoing trial session
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Left session
 */
router.post('/mock-trials/leave', authMiddleware, leaveMockTrial);

/**
 * @openapi
 * /api/mock-trials/message:
 *   post:
 *     tags: [Mock Trials]
 *     summary: Send a message within a trial session
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Message sent
 */
router.post('/mock-trials/message', authMiddleware, postMockMessage);

/**
 * @openapi
 * /api/mock-trials/{trialId}/analyse:
 *   post:
 *     tags: [Mock Trials]
 *     summary: Trigger AI analysis of a completed trial
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trialId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Analysis report
 */
router.post('/mock-trials/:trialId/analyse', authMiddleware, analyzeTrialResult);

export default router;