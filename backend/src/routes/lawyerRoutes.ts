import express from "express";
import { getAllLawyers } from "../controllers/lawyerController";
const router = express.Router();

router.get('/getLawyers', getAllLawyers);

export default router;