import express from "express";
import { respondRequest, getFriendRequest, getFriends, removeFriend, sendfriendRequest } from "../controllers/FriendReq/FriendsController";
import { getUserProfileByUsername, searchUsers } from "../controllers/FriendReq/getUserProfileByUsername";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Friends
 *   description: Social features, friend requests, and user discovery
 */

/**
 * @openapi
 * /apiFriend/sendfriendRequest:
 *   post:
 *     tags: [Friends]
 *     summary: Send a friend request to another user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recipientId]
 *     responses:
 *       200:
 *         description: Request sent
 */
router.post('/sendfriendRequest', authMiddleware, sendfriendRequest);

/**
 * @openapi
 * /apiFriend/respondRequest:
 *   post:
 *     tags: [Friends]
 *     summary: Accept or reject a friend request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [requestId, status]
 *             properties:
 *               status: { type: string, enum: [accepted, rejected] }
 *     responses:
 *       200:
 *         description: Response recorded
 */
router.post('/respondRequest', authMiddleware, respondRequest);

/**
 * @openapi
 * /apiFriend/getRequest:
 *   get:
 *     tags: [Friends]
 *     summary: Get all pending friend requests for the user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of requests
 */
router.get('/getRequest', authMiddleware, getFriendRequest);

/**
 * @openapi
 * /apiFriend/getFriends:
 *   get:
 *     tags: [Friends]
 *     summary: Get user's friend list
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of friends
 */
router.get('/getFriends', authMiddleware, getFriends);

/**
 * @openapi
 * /apiFriend/removeFriend:
 *   post:
 *     tags: [Friends]
 *     summary: Remove a friend from the user's friend list
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Friend removed
 */
router.post('/removeFriend', authMiddleware, removeFriend);

/**
 * @openapi
 * /apiFriend/profile/{username}:
 *   get:
 *     tags: [Friends]
 *     summary: View another user's public profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Public profile data
 */
router.get('/profile/:username', authMiddleware, getUserProfileByUsername);

/**
 * @openapi
 * /apiFriend/search:
 *   get:
 *     tags: [Friends]
 *     summary: Search for users by name or username
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', authMiddleware, searchUsers);

export default router;