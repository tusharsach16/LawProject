import express from 'express';
import { updateProfile } from '../controllers/updateProfile';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Profile
 *   description: User profile management
 */

/**
 * @openapi
 * /api/edit/profile:
 *   patch:
 *     tags: [Profile]
 *     summary: Update current user profile details
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.patch('/edit/profile', authMiddleware, updateProfile);

export default router;