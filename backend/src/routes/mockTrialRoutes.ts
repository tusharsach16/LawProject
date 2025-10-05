import express from 'express';
import { getMockTrialCategories, getSituationsCat, leaveMockTrial, endMockTrial, postMockJoin, postMockMessage, getMockTrialById, checkMatchStatus, analyzeTrialResult } from '../controllers/MockTrails/MockTrailController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.get('/mock-trials/situationsCategory', authMiddleware, getSituationsCat);
router.get('/mock-trials/categories', authMiddleware, getMockTrialCategories);
router.get('/mock-trials/:trialId', authMiddleware, getMockTrialById);
router.get('/mock-trials/check-match/:situationId', authMiddleware, checkMatchStatus);

router.post('/mock-trials/join', authMiddleware, postMockJoin);
router.post('/mock-trials/end', authMiddleware, endMockTrial);
router.post('/mock-trials/leave', authMiddleware, leaveMockTrial);

router.post('/mock-trials/message', authMiddleware, postMockMessage);

router.post('/mock-trials/:trialId/analyse', authMiddleware, analyzeTrialResult);

export default router;