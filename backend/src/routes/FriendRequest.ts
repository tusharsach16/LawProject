import express from "express";
import { acceptRequest, getFriendRequest, getFriends, removeFriend, sendfriendRequest } from "../controllers/FriendReq/FriendsController";
import { getUserProfileByUsername } from "../controllers/FriendReq/getUserProfileByUsername";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.post('/sendfriendRequest', authMiddleware, sendfriendRequest);

router.post('/accept', authMiddleware, acceptRequest);

router.get('/getRequest', authMiddleware, getFriendRequest);

router.get('/getFriends', authMiddleware, getFriends);

router.post('/removeFriend',  authMiddleware, removeFriend);

router.get('/profile/:username', authMiddleware, getUserProfileByUsername);
export default router;