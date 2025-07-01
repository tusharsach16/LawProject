import express from "express";
import { getMockSituation, getSituations, getSituationsCat } from "../controllers/MockTrailController";
import authMiddleware from "../middleware/authMiddleware";
const router = express.Router();

router.get('/situation/', authMiddleware, getMockSituation);

router.get('/situations', authMiddleware, getSituations);
router.get('/situationsCategory', authMiddleware, getSituationsCat);
export default router;