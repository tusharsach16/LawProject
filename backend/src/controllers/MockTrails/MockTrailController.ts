import { redisLRem, redisLPop, redisRPush, redisLRange, redisExpire } from "../../utils/redisClient";
import {Request, Response} from "express";
import { Category } from "../../models/quiz/Category";
import { MockTrialSituation } from "../../models/Mocktrial/MockSituation";
import { MockTrial } from "../../models/Mocktrial/Mock";
import mongoose from "mongoose";
import { User } from "../../models/User";
import {geminiModel} from '../../config/gemini';
import { broadcastToTrialRoom, closeTrialRoomConnections } from "../../webSockets";
import { redisGet, redisSet } from "../../utils/redisClient";

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
    const cacheKey = `mock:situations:${slug || 'all'}`;

    const cached = await redisGet(cacheKey);
    if (cached) {
      res.json({ situations: JSON.parse(cached), cached: true });
      return;
    }

    let filter = {};
    if (slug) {
      const categoryDoc = await Category.findOne({ slug });
      if (!categoryDoc) {
        res.status(404).json({ message: "Category not found" });
        return;
      }
      filter = { categoryId: categoryDoc._id };
    }

    const situations = await MockTrialSituation.find(filter).lean();

    redisSet(cacheKey, JSON.stringify(situations), 300).catch(err =>
      console.error('Redis set error:', err)
    );

    res.json({ situations, cached: false });
  } catch (e) {
    console.error('getSituationsCat error:', e);
    res.status(500).json({ msg: "Something went wrong", error: e });
  }
};

export const getMockTrialCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = "mock:categories";

    const cached = await redisGet(cacheKey);
    if (cached) {
      res.json({ categories: JSON.parse(cached), cached: true });
      return;
    }

    const categories = await Category.find({}).select('title slug').lean();

    redisSet(cacheKey, JSON.stringify(categories), 600).catch(err =>
      console.error('Redis set error:', err)
    );

    res.json({ categories, cached: false });
  } catch (e) {
    console.error('getMockTrialCategories error:', e);
    res.status(500).json({ msg: "Something went wrong", error: e });
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

    const waitKeyPlaintiff = `waiting:${situationId}:plaintiff`;
    const waitKeyDefendant = `waiting:${situationId}:defendant`;
    await redisLRem(waitKeyPlaintiff, 0, userId);
    await redisLRem(waitKeyDefendant, 0, userId);

    const active = await MockTrial.findOne({
      status: "active",
      $or: [
        { plaintiffId: userId },
        { defendantId: userId }
      ]
    });
    
    if (active) {
      res.status(403).json({ 
        msg: "You are already in an active trial", 
        trialId: active._id,
        alreadyInTrial: true 
      });
      return;
    }

    const opposite = side === "plaintiff" ? "defendant" : "plaintiff";
    const waitKey = `waiting:${situationId}:${side}`;
    const oppKey = `waiting:${situationId}:${opposite}`;

    const opponentId = await redisLPop(oppKey);

    if (opponentId) {
      if (opponentId === userId) {
        console.error("Self-matching detected, adding back to queue");
        await redisRPush(waitKey, userId);
        await redisExpire(waitKey, 120);
        res.status(202).json({ waiting: true, msg: "Waiting for opponent" });
        return;
      }

      const trial = await MockTrial.create({
        plaintiffId: side === "plaintiff" ? userId : opponentId,
        defendantId: side === "defendant" ? userId : opponentId,
        categoryId: situation.categoryId,
        situationId: new mongoose.Types.ObjectId(situationId),
        messages: [],
        status: "active", 
        startedAt: new Date()
      });

      await redisLRem(waitKeyPlaintiff, 0, userId);
      await redisLRem(waitKeyDefendant, 0, userId);
      await redisLRem(waitKeyPlaintiff, 0, opponentId);
      await redisLRem(waitKeyDefendant, 0, opponentId);

      res.status(200).json({ paired: true, trialId: trial._id });
      return;
    }

    await redisRPush(waitKey, userId);
    await redisExpire(waitKey, 120);

    res.status(202).json({ waiting: true, msg: "Waiting for opponent" });
  } catch (e) {
    console.error("join error", e);
    res.status(500).json({ msg: "Something went wrong", error: e });
  }
};

export const cancelWaiting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { situationId, side } = req.body;
    const userId = req.user?.id;

    if (!situationId || !side) {
      res.status(400).json({ msg: "situationId and side are required" });
      return;
    }

    if (!userId) {
      res.status(401).json({ msg: "Unauthenticated" });
      return;
    }

    const waitKeyPlaintiff = `waiting:${situationId}:plaintiff`;
    const waitKeyDefendant = `waiting:${situationId}:defendant`;
    
    await redisLRem(waitKeyPlaintiff, 0, userId);
    await redisLRem(waitKeyDefendant, 0, userId);

    res.status(200).json({ msg: "Removed from waiting queue" });
  } catch (e) {
    console.error("cancelWaiting error:", e);
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

    if (trial.status !== "active") {
      res.status(403).json({ msg: "Trial is no longer active" });
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
    console.error("postMockMessage error:", e);
    res.status(500).json({ msg: "Something went wrong", error: e });
  }
};

export const getMockTrialById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { trialId } = req.params;
    const cacheKey = `mock:trial:${trialId}`;

    const cached = await redisGet(cacheKey);
    if (cached) {
      res.json({ trial: JSON.parse(cached), cached: true });
      return;
    }

    const trial = await MockTrial.findById(trialId)
      .populate("plaintiffId", "username name profileImageUrl")
      .populate("defendantId", "username name profileImageUrl")
      .lean();

    if (!trial) {
      res.status(404).json({ msg: "Trial not found" });
      return;
    }

    redisSet(cacheKey, JSON.stringify(trial), 60).catch(err =>
      console.error('Redis set error:', err)
    );

    res.json({ trial, cached: false });
  } catch (e) {
    console.error('getMockTrialById error:', e);
    res.status(500).json({ msg: "Something went wrong", error: e });
  }
};

export const endMockTrial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { trialId } = req.body;
    const userId = req.user?.id;

    if (!trialId) {
      res.status(400).json({ msg: "Trial ID is required" });
      return;
    }

    const trial = await MockTrial.findById(trialId);
    if (!trial) {
      res.status(404).json({ msg: "Trial not found" });
      return;
    }
    
    if (trial.plaintiffId.toString() !== userId && trial.defendantId.toString() !== userId) {
      res.status(403).json({ msg: "Not a participant of this trial" });
      return;
    }

    if (trial.status === "ended" || trial.status === "left") {
      res.status(400).json({ msg: "Trial has already ended" });
      return;
    }

    trial.status = "ended";
    trial.endedAt = new Date();
    await trial.save();

    closeTrialRoomConnections(trialId, "Trial ended");

    res.status(200).json({ msg: "Trial has ended successfully." });

  } catch (e) {
    console.error("endMockTrial error:", e);
    res.status(500).json({ msg: "Something went wrong", error: e });
  }
};

export const leaveMockTrial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { trialId } = req.body;
    const leavingUserId = req.user?.id;

    if (!trialId) {
      res.status(400).json({ msg: "Trial ID is required" });
      return;
    }

    if (!leavingUserId) {
      res.status(401).json({ msg: "User not authenticated" });
      return;
    }

    const trial = await MockTrial.findById(trialId);
    if (!trial) {
      res.status(404).json({ msg: "Trial not found" });
      return;
    }

    if (trial.status === "ended" || trial.status === "left") {
      res.status(400).json({ msg: "Trial has already ended" });
      return;
    }

    let winnerId;
    const isPlaintiff = trial.plaintiffId.toString() === leavingUserId;
    const isDefendant = trial.defendantId.toString() === leavingUserId;

    if (isPlaintiff) {
      winnerId = trial.defendantId;
    } else if (isDefendant) {
      winnerId = trial.plaintiffId;
    } else {
      res.status(403).json({ msg: "Not a participant of this trial" });
      return;
    }

    trial.status = "left";
    trial.endedAt = new Date();
    trial.winnerId = winnerId;
    await trial.save();

    broadcastToTrialRoom(trialId, {
      type: 'system',
      message: 'The other participant has left the trial.',
      data: { 
        senderId: 'system', 
        text: 'The other participant has left the trial.',
        timestamp: new Date().toISOString()
      }
    });

    setTimeout(() => {
      closeTrialRoomConnections(trialId, "Trial left");
    }, 1000);

    res.status(200).json({ 
      msg: "You have left the trial. The other participant has won.",
      success: true 
    });

  } catch (e: any) {
    console.error("CRITICAL ERROR in leaveMockTrial:", e);
    res.status(500).json({ msg: "Something went wrong", error: e.message });
  }
};

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

    const activeTrial = await MockTrial.findOne({
      status: "active",
      situationId: situationId,
      $or: [
        { plaintiffId: userId },
        { defendantId: userId }
      ]
    })
    .populate("plaintiffId", "username name profileImageUrl")
    .populate("defendantId", "username name profileImageUrl");

    if (activeTrial) {
      const waitKeyPlaintiff = `waiting:${situationId}:plaintiff`;
      const waitKeyDefendant = `waiting:${situationId}:defendant`;
      await redisLRem(waitKeyPlaintiff, 0, userId);
      await redisLRem(waitKeyDefendant, 0, userId);
      
      res.status(200).json({ 
        matched: true, 
        trialId: activeTrial._id,
        trial: activeTrial
      });
      return;
    }

    const waitKey = `waiting:${situationId}:${side}`;
    const isWaiting = await redisLRange(waitKey, 0, -1);
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

const formatChatLog = (trial: any): string => {
  return trial.messages
  .map((msg: any) => {
    const senderRole = msg.senderId.equals(trial.plaintiffId._id) ? 'Plaintiff' : 'Defendant';
    return `${senderRole}: "${msg.text}"`;
  })
  .join('\n');
};

export const analyzeTrialResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const trial = await MockTrial.findById(req.params.trialId)
    .populate('plaintiffId', 'name')
    .populate('defendantId', 'name')
    .populate('situationId', 'title description');

    if(!trial) {
      res.status(404).json({msg: "Trial not found."});
      return;
    }

    if(trial.status === 'ended' && trial.judgementText) {
      res.status(400).json({msg: "Trial has already been analysed."});
      return;
    }

    const chatTranscript = formatChatLog(trial);

    const prompt = `
      **Role:** You are an impartial judge analyzing a mock trial.

      **Context:** The case is about "${(trial.situationId as any).title}: ${(trial.situationId as any).description}".
      - Plaintiff ID: ${trial.plaintiffId._id}
      - Defendant ID: ${trial.defendantId._id}

      **Task:**
      1. Read the following chat transcript.
      2. Analyze the arguments of the Plaintiff and the Defendant.
      3. Determine a winner based on who was more persuasive.
      4. Provide a brief justification for your decision.

      **Output Format:** Respond ONLY with a valid JSON object like this: { "winnerId": "...", "justification": "..." }

      **Transcript:**
      ${chatTranscript}
    `;

    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text();

    let analysisResult;
    try {
      const match = responseText.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = match ? match[1] : responseText;
      
      analysisResult = JSON.parse(jsonString);
    } catch(e) {
      console.error("Gemini did not return valid JSON:", responseText);
      res.status(500).json({ message: "Failed to parse analysis result." });
      return;
    }

    trial.status = 'ended';
    trial.winnerId = analysisResult.winnerId;
    trial.judgementText = analysisResult.justification;
    await trial.save();

    res.json({
      message: 'Analysis complete!',
      trial,
    });

  } catch(e) {
    console.error('Error analyzing trial:', e);
    res.status(500).json({ message: 'Server error during analysis.' });
  }
}

export const getPastTrials = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const cacheKey = `user:${userId}:past-trials`;

    const cached = await redisGet(cacheKey);
    if (cached) {
      res.json({ trials: JSON.parse(cached), cached: true });
      return;
    }

    const trials = await MockTrial.find({
      $or: [{ plaintiffId: userId }, { defendantId: userId }],
      status: { $in: ['ended', 'left'] }
    })
    .populate('plaintiffId', 'name profileImageUrl')
    .populate('defendantId', 'name profileImageUrl')
    .populate('situationId', 'title')
    .sort({ createdAt: -1 })
    .lean();

    redisSet(cacheKey, JSON.stringify(trials), 60).catch(err =>
      console.error('Redis set error:', err)
    );

    res.json({ trials, cached: false });
  } catch (e) {
    console.error('getPastTrials error:', e);
    res.status(500).json({ msg: "Something went wrong", error: e });
  }
};

export const getMockTrialStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const allTrials = await MockTrial.find({
      $or: [{ plaintiffId: userObjectId }, { defendantId: userObjectId }]
    })
    .populate('situationId', 'title')
    .sort({ createdAt: -1 })
    .lean();

    if (allTrials.length === 0) {
      res.status(200).json({
        totalTrials: 0,
        completedTrials: 0,
        asPlaintiff: 0,
        asDefendant: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        recentTrials: []
      });
      return;
    }

    const totalTrials = allTrials.length;
    const completedTrials = allTrials.filter(trial => 
      trial.status === 'ended' || trial.status === 'left'
    ).length;
    
    const asPlaintiff = allTrials.filter(trial => 
      trial.plaintiffId.toString() === userId
    ).length;
    const asDefendant = totalTrials - asPlaintiff;

    const wins = allTrials.filter(trial => 
      trial.winnerId && trial.winnerId.toString() === userId
    ).length;
    const losses = completedTrials - wins;
    const winRate = completedTrials > 0 ? Math.round((wins / completedTrials) * 100) : 0;

    const recentTrials = allTrials.slice(0, 5).map(trial => ({
      title: typeof trial.situationId === 'object' && trial.situationId !== null && 'title' in trial.situationId
        ? (trial.situationId as any).title || 'Mock Trial'
        : 'Mock Trial',
      role: trial.plaintiffId?.toString() === userId ? 'plaintiff' : 'defendant',
      status: trial.status,
      date: (trial as any).createdAt || null,
      won: trial.winnerId ? trial.winnerId.toString() === userId : null,
      _id: trial._id
    }));

    res.status(200).json({
      totalTrials,
      completedTrials,
      asPlaintiff,
      asDefendant,
      wins,
      losses,
      winRate,
      recentTrials
    });

  } catch (err: any) {
    console.error("Mock trial statistics fetch error:", err.message);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};