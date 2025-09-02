import { Request, Response } from "express";
import { Category } from "../models/quiz/Category";
import { Questions } from "../models/quiz/Question";
import { Attempts } from "../models/quiz/userQuizAttempt";
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
    const userId = req.user?.id as string; // ← assume auth middleware sets req.user
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
