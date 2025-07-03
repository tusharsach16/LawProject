import express from "express";
import { acceptRequest, sendfriendRequest } from "../controllers/FriendReq/FriendsController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.post('/sendfriendRequest', authMiddleware, sendfriendRequest);

router.post('/accept', authMiddleware, acceptRequest);

export default router;