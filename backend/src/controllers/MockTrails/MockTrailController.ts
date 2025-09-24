import {Request, Response} from "express";
import { Category } from "../../models/quiz/Category";
import { MockTrialSituation } from "../../models/Mocktrial/MockSituation";
import { MockTrial } from "../../models/Mocktrial/Mock";
import mongoose from "mongoose";
import { redis } from "../../utils/redisClient";
import { User } from "../../models/User";


export const getMockSituation = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.query.id as string;
    const mockSituation = await MockTrialSituation.find({_id: id}).select('title description');
    if(mockSituation.length === 0) {
      res.status(400).json({msg: "Mock situation doesnot exists."});
      return;
    }
    res.status(200).json({mockSituation});
  } catch(e) {
    res.status(500).json({msg: "Something went wrong", e});
  }
}

export const getSituations = async (req: Request, res:Response): Promise<void> => {
  try {
    const situations = await MockTrialSituation.find().select('title description');
    if(situations.length === 0) {
      res.status(400).json({msg: "Mock situation doesnot exists."});
      return;
    }
    res.status(200).json({situations});
  } catch(e) {
    res.status(500).json({msg: "Something went wrong", e});
  }
}

export const getSituationsCat = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = req.query.slug as string;

    let filter = {};
    if (slug) {
      const categoryDoc = await Category.findOne({ slug: slug });
      if (!categoryDoc) {
        res.status(404).json({ message: "Category not found" });
        return;
      }
      filter = { categoryId: categoryDoc._id };
    }

    const situations = await MockTrialSituation.find(filter).lean();
    res.status(200).json({ situations });

  } catch (e) {
     res.status(500).json({ message: "Something went wrong", e });
  }
};

export const getMockTrialCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find({}).select('title slug');
    res.status(200).json(categories);
  } catch (e) {
    console.error("Error fetching mock trial categories:", e);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

export const postMockJoin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { situationId, side } = req.body;         
    const userId = req.user?.id;
    const role = req.user?.role; 

    if (!situationId || !side || !["plaintiff", "defendant"].includes(side)) {
      res.status(400).json({ msg: "Fields are required" });
      return;
    }
    if (!userId) {
      res.status(401).json({ msg: "Unauthenticated" });   
      return;
    }
    if (role !== "lawstudent") {
      res.status(403).json({ msg: "Only law students can participate" });
      return;
    }
    const situation = await MockTrialSituation.findById(situationId);
    if (!situation) {
      res.status(404).json({ msg: "Mock trial situation not found" });
      return;
    }
    // Check user already in active trial
    const active = await MockTrial.findOne({
      status: "active",
      $or: [
        { plaintiffId: userId },
        { defendantId: userId }
      ]
    });
    if (active) {
      res.status(403).json({ msg: "You are already in an active trial" });
      return;
    }

    //  Try to find waiting opponent
    const opposite = side === "plaintiff" ? "defendant" : "plaintiff";
    const waitKey   = `waiting:${situationId}:${side}`;
    const oppKey    = `waiting:${situationId}:${opposite}`;

    // Pop one user from opposite list (returns null if empty)
    const opponentId = await redis.lPop(oppKey);

    if (opponentId) {
      const trial = await MockTrial.create({
        plaintiffId: side === "plaintiff" ? userId : opponentId,
        defendantId: side === "defendant" ? userId : opponentId,
        categoryId: situation.categoryId,
        situationId: new mongoose.Types.ObjectId(situationId),
        messages: [],
        status: "active", 
        startedAt: new Date()
      });

      res.status(200).json({ paired: true, trialId: trial._id });
      return;
    }

    // no opponent → push current user into waiting queue 
    // TTL 120s ensures auto‑cleanup
    await redis.rPush(waitKey, userId);
    await redis.expire(waitKey, 120);

    res.status(202).json({ waiting: true, msg: "Waiting for opponent" });
  } catch (e) {
    console.error("join error", e);
    res.status(500).json({ msg: "Something went wrong", error: e });
  }
};


export const postMockMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { trialId, text } = req.body;
    const userId = req.user?.id;


    if (!trialId || !text) {
      res.status(400).json({ msg: "Fields are required" });
      return;
    }

    const trial = await MockTrial.findById(trialId);
    if (!trial) {
      res.status(404).json({ msg: "Trial not found" });
      return;
    }
    if(req.user?.role !== "lawstudent") {
      res.status(403).json({msg: "Only Law student can participate"});
      return;
    }
    if (
      userId !== trial.plaintiffId.toString() &&
      userId !== trial.defendantId?.toString()
    ) {
      res.status(403).json({ msg: "Not a participant" });
      return;
    }
    const message = {
      senderId: new mongoose.Types.ObjectId(userId),
      text,
      timestamp: new Date(),
    };
    if (trial.messages.length >= 200) {
      res.status(403).json({ msg: "Trial has reached the maximum number of messages (200)" });
      return;
    }   

    trial.messages.push(message);
    await trial.save();

    res.status(200).json({ msg: "Message sent", message });
  } catch (e) {
    res.status(500).json({ msg: "Something went wrong", error: e });
  }
};


export const getMockTrialById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { trialId } = req.params;

    if (!trialId) {
      res.status(400).json({ msg: "Trial ID is required" });
      return;
    }

    const trial = await MockTrial.findById(trialId)
      .populate({
        path: "plaintiffId",
        model: User,
        select: "username name profileImageUrl" 
      })
      .populate({
        path: "defendantId",
        model: User,
        select: "username name profileImageUrl"
      })
      .lean(); 

    if (!trial) {
      res.status(404).json({ msg: "Trial not found" });
      return;
    }

    res.status(200).json({ trial });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong", error });
  }
};


export const endMockTrial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { trialId } = req.body;
    const userId = req.user?.id;

    const trial = await MockTrial.findById(trialId);
    if (!trial) {
      res.status(404).json({ msg: "Trial not found" });
      return;
    }
    // Sirf participants hi trial end kr sakte h
    if (trial.plaintiffId.toString() !== userId && trial.defendantId.toString() !== userId) {
      res.status(403).json({ msg: "Not a participant of this trial" });
      return;
    }

    trial.status = "ended";
    trial.endedAt = new Date();
    await trial.save();

    res.status(200).json({ msg: "Trial has ended successfully." });

  } catch (e) {
    console.error("endMockTrial error:", e);
    res.status(500).json({ msg: "Something went wrong", error: e });
  }
};


//  jb user trial beech mein chod dega tb
export const leaveMockTrial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { trialId } = req.body;
    const leavingUserId = req.user?.id;

    const trial = await MockTrial.findById(trialId);
    if (!trial) {
      res.status(404).json({ msg: "Trial not found" });
      return;
    }

    // kon chod raha h aur doosra user kon h
    let winnerId;
    if (trial.plaintiffId.toString() === leavingUserId) {
      winnerId = trial.defendantId;
    } else if (trial.defendantId.toString() === leavingUserId) {
      winnerId = trial.plaintiffId;
    } else {
      res.status(403).json({ msg: "Not a participant of this trial" });
      return;
    }

    trial.status = "left";
    trial.endedAt = new Date();
    trial.winnerId = winnerId; // bacha hua user winner hai
    await trial.save();

    res.status(200).json({ msg: "You have left the trial. The other participant has won." });

  } catch (e) {
    console.error("leaveMockTrial error:", e);
    res.status(500).json({ msg: "Something went wrong", error: e });
  }
};

// Check if user has been matched with an opponent
export const checkMatchStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { situationId } = req.params;
    const { side } = req.query;

    if (!situationId || !mongoose.Types.ObjectId.isValid(situationId)) {
      res.status(400).json({ msg: "Invalid Situation ID format." });
      return;
    }

    if (!side) {
      res.status(400).json({ msg: "Missing required parameters" });
      return;
    }
    if (!userId) {
      res.status(401).json({ msg: "Unauthenticated." });
      return;
    }

    // Check if user is in any active trial for this situation
    const activeTrial = await MockTrial.findOne({
      status: "active",
      situationId: situationId,
      $or: [
        { plaintiffId: userId },
        { defendantId: userId }
      ]
    }).populate("plaintiffId", "username").populate("defendantId", "username");

    if (activeTrial) {
      res.status(200).json({ 
        matched: true, 
        trialId: activeTrial._id,
        trial: activeTrial
      });
      return;
    }

    // Check if user is still in waiting queue
    const waitKey = `waiting:${situationId}:${side}`;
    const isWaiting = await redis.lRange(waitKey, 0, -1);
    const userInQueue = isWaiting.includes(userId);

    if (userInQueue) {
      res.status(200).json({ matched: false, waiting: true });
    } else {
      res.status(200).json({ matched: false, waiting: false });
    }

  } catch (e) {
    console.error("checkMatchStatus error:", e);
    res.status(500).json({ msg: "Something went wrong", error: e });
  }
};