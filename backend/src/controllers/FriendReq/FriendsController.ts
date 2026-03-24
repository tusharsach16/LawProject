import { Request, Response } from "express";
import mongoose from "mongoose";
import { User, Iuser } from "../../models/User";
import { Friends } from "../../models/FriendReq/FriendRequest";
import { AuthenticatedRequest } from "../../types/express";

// SEND FRIEND REQUEST
export const sendfriendRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const senderId = req.user?.id;
    const { username } = req.body as { username: string };

    if (!username) {
      res.status(400).json({ msg: "Receiver username is required" });
      return;
    }

    if (!senderId) {
      res.status(401).json({ msg: "Unauthenticated" });
      return;
    }

    const sender: Iuser | null = await User.findById(senderId);
    const receiver: Iuser | null = await User.findOne({ username: username.toLowerCase() });

    if (!sender) {
      res.status(404).json({ msg: "Sender not found" });
      return;
    }

    if (!receiver) {
      res.status(404).json({ msg: "Receiver not found" });
      return;
    }

    const senderObjectId = sender._id as mongoose.Types.ObjectId;
    const receiverObjectId = receiver._id as mongoose.Types.ObjectId;

    // Can't send request to yourself
    if (senderObjectId.equals(receiverObjectId)) {
      res.status(400).json({ msg: "Cannot send request to yourself" });
      return;
    }

    // Already friends?
    if (sender.friends.some((friendId) => friendId.equals(receiverObjectId))) {
      res.status(400).json({ msg: "Already friends" });
      return;
    }

    // Check if a pending request already exists between the same users
    const duplicate = await Friends.findOne({
      $or: [
        { senderId: senderObjectId, receiverId: receiverObjectId },
        { senderId: receiverObjectId, receiverId: senderObjectId },
      ],
      status: "pending",
    });

    if (duplicate) {
      res.status(400).json({ msg: "Friend request already pending" });
      return;
    }

    // Create new friend request
    const request = await Friends.create({
      senderId: senderObjectId,
      receiverId: receiverObjectId,
      status: "pending",
    });

    res.status(201).json({
      msg: "Friend request sent successfully",
      requestId: request._id,
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("sendfriendRequest error:", error.message);
    res.status(500).json({ msg: "Something went wrong", error: error.message });
  }
};



export const respondRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("acceptRequest error:", error.message);
    res.status(500).json({ msg: "Something went wrong", error: error.message });
  }
};


export const getFriendRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      res.status(401).json({ msg: "Unauthenticated" });
      return;
    }
    const receiverObjId = new mongoose.Types.ObjectId(currentUserId); // bcz in mongo reciever if ek object h not string.
    const pending = await Friends.find({
      receiverId: receiverObjId,
      status: 'pending'
    }).populate('senderId', 'name username profileImageUrl');
    res.status(200).json(pending)
    return;
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Get friend request error:", error.message);
    res.status(500).json({ msg: "Something went wrong", error: error.message });
  }
}


export const getFriends = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      res.status(401).json({ msg: "Unauthenticated" });
      return;
    }
    const user = await User.findById(currentUserId).populate({
      path: "friends",
      select: "username name role profileImageUrl bio"
    });
    const totalFriends = user?.friends.length;
    if (!user) {
      res.status(401).json({ msg: "User not found" });
      return;
    }

    res.status(200).json({
      total: totalFriends,
      friends: user.friends
    })
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("acceptRequest error:", error.message);
    res.status(500).json({ msg: "Something went wrong", error: error.message });
  }
}


export const removeFriend = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { friendIdToRemove } = req.body;
    if (!friendIdToRemove) {
      res.status(400).json({ msg: "Id iss required" });
      return;
    }
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ msg: "Unauthenticated" });
      return;
    }

    const user = await User.findById(userId);
    const friend = await User.findById(friendIdToRemove);
    if (!user || !friend) {
      res.status(401).json({ msg: "User or Friend not found" });
      return;
    }

    // await User.updateOne(
    //   { _id: userId },
    //   { $pull: { friends: friendIdToRemove } }
    // );

    // await User.updateOne(
    //   { _id: friendIdToRemove },
    //   { $pull: { friends: userId } }
    // );
    await user.updateOne(
      { $pull: { friends: friendIdToRemove } }
    )
    await friend.updateOne(
      { $pull: { friends: userId } }
    )
    await Friends.updateOne(
      {
        $or: [
          { senderId: userId, receiverId: friendIdToRemove },
          { senderId: friendIdToRemove, receiverId: userId }
        ]
      },
      { $set: { status: "unfriended" } }
    );
    res.status(200).json({ msg: "Friend Removed" });
    return;
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("acceptRequest error:", error.message);
    res.status(500).json({ msg: "Something went wrong", error: error.message });
  }
}