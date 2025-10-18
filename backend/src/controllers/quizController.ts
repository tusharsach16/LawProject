import { Request, Response } from "express";
import { Category } from "../models/quiz/Category";
import { Questions, IQuiz } from "../models/quiz/Question";
import { Attempts } from "../models/quiz/userQuizAttempt";
import { MockTrial } from "../models/Mocktrial/Mock";
import { ChatHistory } from "../models/ChatHistory";
import mongoose from "mongoose";


export const getQuizQues = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = req.query.category as string;
    const limit = parseInt(req.query.limit as string) || 10;

    let filter: any = {};
    if (slug) {
      const categoryDoc = await Category.findOne({ slug: slug });
      if (!categoryDoc) {
        res.status(404).json({ message: "Category not found" });
        return;
      }
      filter = { categoryId: categoryDoc._id };
    }


    const quiz = await Questions.aggregate([
      { $match: filter },           
      { $sample: { size: limit } }   
    ]);

    res.status(200).json({ quiz });

  } catch (e) {
     res.status(500).json({ message: "Something went wrong", e });
  }
};




export const submitAttempt = async (req: Request, res: Response):Promise<void> => {
  try {
  const userId = (req.user as any)?.id as string; // ← assume auth middleware sets req.user
    const { category, answers } = req.body as {
      category: string;
      answers: { questionId: string; selectedIndex: number }[];
    };

    if (!Array.isArray(answers) || answers.length === 0) {
      res.status(400).json({ message: "answers array required" });
      return;
    }

    /* 1️⃣  Resolve categoryId (slug → ObjectId) */
    let categoryId: mongoose.Types.ObjectId | undefined;
    if (mongoose.isValidObjectId(category)) {
      categoryId = new mongoose.Types.ObjectId(category) as mongoose.Types.ObjectId;
    } else {
      const catDoc = await Category.findOne({ slug: category });
      if (!catDoc) {
        res.status(404).json({ message: "Category not found" });
        return;
      }
      //@ts-ignore
      categoryId = catDoc._id;
    }


    /* 2️⃣  Bulk-fetch all referenced questions once */
    const qIds = answers.map((a) => a.questionId);
    const questionDocs = await Questions.find({ _id: { $in: qIds } })
      .select("correctIndex")
      .lean();

    // Map questionId → correctIndex for O(1) lookup
    const correctMap: Record<string, number> = {};
    questionDocs.forEach((q) => {
      correctMap[q._id.toString()] = q.correctIndex;
    });

    /* 3️⃣  Evaluate each answer */
    let correctCount = 0;
    const processed = answers.map((a) => {
      const isCorrect = a.selectedIndex === correctMap[a.questionId];
      if (isCorrect) correctCount++;
      return {
        questionId: a.questionId,
        selectedIndex: a.selectedIndex,
        isCorrect,
      };
    });

    const totalQuestions = answers.length;
    const incorrectCount = totalQuestions - correctCount;
    const percentage = Number(((correctCount / totalQuestions) * 100).toFixed(1));

    /* 4️⃣  Store the attempt */
    await Attempts.create({
      userId,
      categoryId,
      answers: processed,
      totalQuestions,
      correctCount,
      inCorrectCount: incorrectCount,
      percentage,
    });

    /* 5️⃣  Respond with result */
    res.status(200).json({
      correct: correctCount,
      incorrect: incorrectCount,
      percentage,
    });
    return;
  } catch (e) {
    console.error("submitAttempt error:", e);
    res.status(500).json({ message: "Something went wrong", e });
    return;
  }
};

export const result = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.query.id as string;
    const attempts = await Attempts.find({ userId }).lean();  // array milega
    
    // find hamesha array deta h 
    if (attempts.length === 0) {
      res.status(404).json({ msg: "Result not found" });
      return;
    }

    res.status(200).json({ attempts });       // saare attempts
  } catch (err) {
    console.error("Result fetch error ➜", err);
    res.status(500).json({ msg: "Something went wrong", err });
  }
};

// Count number of quizzes completed by user
export const getQuizCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.id as string;
    
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const quizCount = await Attempts.countDocuments({ userId });
    
    res.status(200).json({ 
      quizCount,
      message: `User has completed ${quizCount} quiz${quizCount !== 1 ? 'es' : ''}` 
    });
  } catch (err) {
    console.error("Quiz count fetch error ➜", err);
    res.status(500).json({ message: "Something went wrong", err });
  }
};

// Get detailed quiz results with questions and answers
export const getDetailedQuizResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.id as string;
    
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Get all attempts with populated category and question details
    const attempts = await Attempts.find({ userId })
      .populate({
        path: 'categoryId',
        select: 'name slug'
      })
      .populate({
        path: 'answers.questionId',
        select: 'ques options correctIndex explanation'
      })
      .sort({ createdAt: -1 }) // Most recent first
      .lean();

    if (attempts.length === 0) {
      res.status(404).json({ message: "No quiz attempts found" });
      return;
    }

    // Format the response to include detailed question and answer information
    const formattedAttempts = attempts.map(attempt => ({
      _id: attempt._id,
      category: attempt.categoryId,
      totalQuestions: attempt.totalQuestions,
      correctCount: attempt.correctCount,
      incorrectCount: attempt.inCorrectCount,
      percentage: attempt.percentage,
      createdAt: attempt.createdAt,
      answers: attempt.answers.map(answer => ({
        question: answer.questionId,
        selectedIndex: answer.selectedIndex,
        isCorrect: answer.isCorrect,
        correctAnswer: (answer.questionId as unknown as IQuiz).correctIndex
      }))
    }));

    res.status(200).json({ 
      attempts: formattedAttempts,
      totalAttempts: attempts.length 
    });
  } catch (err) {
    console.error("Detailed quiz results fetch error ➜", err);
    res.status(500).json({ message: "Something went wrong", err });
  }
};

// get quixz statistics
export const getQuizStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.id as string;
    
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get all quiz attempts for this user
    const allAttempts = await Attempts.find({ userId: userObjectId })
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    if (allAttempts.length === 0) {
      res.status(200).json({
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0,
        worstScore: 0,
        recentScores: [],
        passRate: 0
      });
      return;
    }

    // Calculate statistics
    const scores = allAttempts.map(attempt => attempt.percentage);
    const totalAttempts = allAttempts.length;
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalAttempts);
    const bestScore = Math.max(...scores);
    const worstScore = Math.min(...scores);
    
    // Get last 10 attempts for trend
    const recentScores = allAttempts.slice(0, 10).map(attempt => ({
      score: attempt.percentage,
      category: (typeof attempt.categoryId === "object" && attempt.categoryId && "name" in attempt.categoryId)
        ? (attempt.categoryId as { name?: string }).name || 'Quiz'
        : 'Quiz',
      date: attempt.createdAt,
      _id: attempt._id
    })).reverse(); // Reverse to show oldest to newest in chart

    // Calculate pass rate (assuming 60% is passing)
    const passedAttempts = scores.filter(score => score >= 60).length;
    const passRate = Math.round((passedAttempts / totalAttempts) * 100);

    res.status(200).json({
      totalAttempts,
      averageScore,
      bestScore,
      worstScore,
      recentScores,
      passRate
    });

  } catch (err: any) {
    console.error("Quiz statistics fetch error ➜", err.message);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};

// Get recent activities from all sources
export const getRecentActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.id as string;
    const limit = parseInt(req.query.limit as string) || 3; // Default to 3, allow override
    
    console.log(`[RecentActivities] Fetching activities for UserID: ${userId}, limit: ${limit}`);
    
    if (!userId) {
      console.log("[RecentActivities] Error: User not authenticated");
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const activities: any[] = [];
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Fetch more items if limit is higher
    const fetchLimit = Math.ceil(limit / 3); // Distribute limit across types

    // 1. Get recent quiz attempts
    const recentQuizzes = await Attempts.find({ userId: userObjectId })
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 })
      .limit(fetchLimit * 3) // Fetch more if needed
      .lean();

    console.log(`[RecentActivities] Found ${recentQuizzes.length} recent quizzes.`);
    recentQuizzes.forEach((quiz: any) => {
      activities.push({
        type: 'quiz',
        title: `Quiz Completed`,
        description: `Scored ${quiz.percentage}% in ${quiz.categoryId?.name || 'Quiz'}`,
        timestamp: quiz.createdAt,
        _id: quiz._id
      });
    });

    // 2. Get recent mock trials
    const recentTrials = await MockTrial.find({
      $or: [{ plaintiffId: userObjectId }, { defendantId: userObjectId }]
    })
    .populate('situationId', 'title')
    .sort({ createdAt: -1 })
    .limit(fetchLimit * 3)
    .lean();
    
    console.log(`[RecentActivities] Found ${recentTrials.length} recent trials.`);
    recentTrials.forEach((trial: any) => {
      const role = trial.plaintiffId.toString() === userId ? 'plaintiff' : 'defendant';
      activities.push({
        type: 'trial',
        title: `Mock Trial ${trial.status === 'ended' ? 'Completed' : 'Joined'}`,
        description: `${trial.situationId?.title || 'Mock Trial'} - ${role}`,
        timestamp: trial.createdAt,
        _id: trial._id
      });
    });

    // 3. Get recent chat messages
    const chatHistory = await ChatHistory.findOne({ userId: userObjectId });

    console.log(`[RecentActivities] Chat history document found: ${chatHistory ? 'Yes' : 'No'}`);

    if (chatHistory && chatHistory.messages && chatHistory.messages.length > 0) {
      const userMessages = chatHistory.messages
        .filter(msg => msg.sender === 'user');
        
      userMessages.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const topUserMessages = userMessages.slice(0, fetchLimit * 3);
      
      console.log(`[RecentActivities] Found ${topUserMessages.length} user chat messages.`);
      
      topUserMessages.forEach((msg: any) => {
        activities.push({
          type: 'chat',
          title: 'AI Consultation',
          description: msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : ''),
          timestamp: msg.createdAt,
          _id: msg._id || new mongoose.Types.ObjectId()
        });
      });
    }

    // Sort ALL activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Return top activities based on limit
    const topActivities = activities.slice(0, limit);

    console.log("[RecentActivities] Data being sent to frontend:", topActivities);

    res.status(200).json({ activities: topActivities });

  } catch (err: any) { 
    console.error("Recent activities fetch error ➜", err.message);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};