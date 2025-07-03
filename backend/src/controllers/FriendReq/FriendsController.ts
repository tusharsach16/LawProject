// controllers/friendRequestController.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../../models/User";
import { Friends } from "../../models/FriendReq/FriendRequest";
import { send } from "process";

export const sendfriendRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const senderId = req.user?.id;
    const { username } = req.body as { username: string };

    /* 1. Basic validations */
    if (!username) {
      res.status(400).json({ msg: "Receiver username is required" });
      return;
    }
    if (!senderId) {
      res.status(401).json({ msg: "Unauthenticated" });
      return;
    }

    /* 2. Fetch users */
    const sender   = await User.findById(senderId);
    const receiver = await User.findOne({ username: username.toLowerCase() });

    if (!sender) {
      res.status(404).json({ msg: "Receiver not found" });
      return;
    }
    if (!receiver) {
      res.status(404).json({ msg: "Receiver not found" });
      return;
    }
    if (sender?._id.equals(receiver._id)) {
      res.status(400).json({ msg: "Cannot send request to yourself" });
      return;
    }

    /* 3. Already friends? */
    if (sender?.friends.includes(receiver._id)) {
      res.status(400).json({ msg: "Already friends" });
      return;
    }

    /* 4. Pending request already exists? */
    const duplicate = await Friends.findOne({
      $or: [
        { senderId: sender._id,   receiverId: receiver._id },
        { senderId: receiver._id, receiverId: sender._id }
      ],
      status: "pending"
    });

    if (duplicate) {
      res.status(400).json({ msg: "Friend request already pending" });
      return;
    }

    /* 5. Create new friend request */
    const request = await Friends.create({
      senderId:   sender._id,
      receiverId: receiver._id,
      status:     "pending"
    });

    res.status(201).json({ msg: "Friend request sent", requestId: request._id });
  } catch (e) {
    console.error("sendFriendRequest error:", e);
    res.status(500).json({ msg: "Something went wrong", error: e });
  }
};


export const acceptRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { action, requestId } = req.body as { action: string; requestId: string };
    const receiverId = req.user?.id;

    if (!receiverId) {
      res.status(401).json({ msg: "Unauthenticated" });
      return;
    }
    if (!action) {
      res.status(400).json({ msg: "Action is required" });
      return;
    }

    const friendRequest = await Friends.findById(requestId);
    if (!friendRequest) {
      res.status(404).json({ msg: "Request not found" });
      return;
    }

    const senderId = friendRequest.senderId;

    if (receiverId !== friendRequest.receiverId.toString()) {
      res.status(403).json({ msg: "Unauthorized action" });
      return;
    }

    // Update status
    friendRequest.status = action === "accept" ? "accepted" : "rejected";
    await friendRequest.save();

    if (action === "accept") {
      await User.updateOne({ _id: senderId }, { $addToSet: { friends: receiverId } });
      await User.updateOne({ _id: receiverId }, { $addToSet: { friends: senderId } });
    }

    const msg = action === "accept"
      ? "Friend Request Accepted"
      : "Friend Request Rejected";

    res.status(200).json({ msg });
  } catch (e) {
    console.error("acceptRequest error:", e);
    res.status(500).json({ msg: "Something went wrong", error: e });
  }
};

