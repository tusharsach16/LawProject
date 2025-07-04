import express from "express";
import { getMockSituation, getMockTrialById, getSituations, getSituationsCat, postMockJoin, postMockMessage } from "../controllers/MockTrails/MockTrailController";
import authMiddleware from "../middleware/authMiddleware";
const router = express.Router();

router.get('/situation/', authMiddleware, getMockSituation);

router.get('/situations', authMiddleware, getSituations);
router.get('/situationsCategory', authMiddleware, getSituationsCat);


router.post('/mockJoin', authMiddleware, postMockJoin);
router.post('/messages', authMiddleware, postMockMessage);

// router.get(result ) is still pending now.

router.get('/:trailId', getMockTrialById );
export default router;