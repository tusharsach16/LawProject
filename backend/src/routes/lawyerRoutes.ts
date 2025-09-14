import express from "express";
import { getAllLawyers, getSpecializations } from "../controllers/lawyerController";
const router = express.Router();

router.get('/getLawyers', getAllLawyers);
router.get('/lawyers/specializations', getSpecializations);

export default router;