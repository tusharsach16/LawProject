import express from "express";
import { respondRequest, getFriendRequest, getFriends, removeFriend, sendfriendRequest } from "../controllers/FriendReq/FriendsController";
import { getUserProfileByUsername, searchUsers } from "../controllers/FriendReq/getUserProfileByUsername";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.post('/sendfriendRequest', authMiddleware, sendfriendRequest);

router.post('/respondRequest', authMiddleware, respondRequest);

router.get('/getRequest', authMiddleware, getFriendRequest);

router.get('/getFriends', authMiddleware, getFriends);

router.post('/removeFriend',  authMiddleware, removeFriend);

router.get('/profile/:username', authMiddleware, getUserProfileByUsername);

router.get('/search', authMiddleware, searchUsers);

export default router;