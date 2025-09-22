import express from 'express';
import { getMockTrialCategories, getSituationsCat, postMockJoin } from '../controllers/MockTrails/MockTrailController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.get('/mock-trials/situationsCategory', authMiddleware, getSituationsCat);
router.get('/mock-trials/categories', authMiddleware, getMockTrialCategories);

router.post('/mock-trials/join', authMiddleware, postMockJoin);

export default router;