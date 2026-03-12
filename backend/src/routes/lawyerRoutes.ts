import express from "express";
import { getAllLawyers, getSpecializations } from "../controllers/lawyerController";
const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Lawyers
 *   description: Lawyer profile discovery and filtering
 */

/**
 * @openapi
 * /api/getLawyers:
 *   get:
 *     tags: [Lawyers]
 *     summary: Retrieve all lawyers with optional filtering
 *     responses:
 *       200:
 *         description: List of lawyers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/getLawyers', getAllLawyers);

/**
 * @openapi
 * /api/lawyers/specializations:
 *   get:
 *     tags: [Lawyers]
 *     summary: Get unique list of lawyer specializations
 *     responses:
 *       200:
 *         description: Array of specialization strings
 */
router.get('/lawyers/specializations', getSpecializations);

export default router;