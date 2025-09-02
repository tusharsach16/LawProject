"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.result = exports.submitAttempt = exports.getQuizQues = void 0;
const Category_1 = require("../models/quiz/Category");
const Question_1 = require("../models/quiz/Question");
const userQuizAttempt_1 = require("../models/quiz/userQuizAttempt");
const mongoose_1 = __importDefault(require("mongoose"));
const getQuizQues = async (req, res) => {
    try {
        const slug = req.query.category;
        const limit = parseInt(req.query.limit) || 10;
        let filter = {};
        if (slug) {
            const categoryDoc = await Category_1.Category.findOne({ slug: slug });
            if (!categoryDoc) {
                res.status(404).json({ message: "Category not found" });
                return;
            }
            filter = { categoryId: categoryDoc._id };
        }
        const quiz = await Question_1.Questions.aggregate([
            { $match: filter },
            { $sample: { size: limit } }
        ]);
        res.status(200).json({ quiz });
    }
    catch (e) {
        res.status(500).json({ message: "Something went wrong", e });
    }
};
exports.getQuizQues = getQuizQues;
const submitAttempt = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // ← assume auth middleware sets req.user
        const { category, answers } = req.body;
        if (!Array.isArray(answers) || answers.length === 0) {
            res.status(400).json({ message: "answers array required" });
            return;
        }
        /* 1️⃣  Resolve categoryId (slug → ObjectId) */
        let categoryId;
        if (mongoose_1.default.isValidObjectId(category)) {
            categoryId = new mongoose_1.default.Types.ObjectId(category);
        }
        else {
            const catDoc = await Category_1.Category.findOne({ slug: category });
            if (!catDoc) {
                res.status(404).json({ message: "Category not found" });
                return;
            }
            //@ts-ignore
            categoryId = catDoc._id;
        }
        /* 2️⃣  Bulk-fetch all referenced questions once */
        const qIds = answers.map((a) => a.questionId);
        const questionDocs = await Question_1.Questions.find({ _id: { $in: qIds } })
            .select("correctIndex")
            .lean();
        // Map questionId → correctIndex for O(1) lookup
        const correctMap = {};
        questionDocs.forEach((q) => {
            correctMap[q._id.toString()] = q.correctIndex;
        });
        /* 3️⃣  Evaluate each answer */
        let correctCount = 0;
        const processed = answers.map((a) => {
            const isCorrect = a.selectedIndex === correctMap[a.questionId];
            if (isCorrect)
                correctCount++;
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
        await userQuizAttempt_1.Attempts.create({
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
    }
    catch (e) {
        console.error("submitAttempt error:", e);
        res.status(500).json({ message: "Something went wrong", e });
        return;
    }
};
exports.submitAttempt = submitAttempt;
const result = async (req, res) => {
    try {
        const userId = req.query.id;
        const attempts = await userQuizAttempt_1.Attempts.find({ userId }).lean(); // array milega
        // find hamesha array deta h 
        if (attempts.length === 0) {
            res.status(404).json({ msg: "Result not found" });
            return;
        }
        res.status(200).json({ attempts }); // saare attempts
    }
    catch (err) {
        console.error("Result fetch error ➜", err);
        res.status(500).json({ msg: "Something went wrong", err });
    }
};
exports.result = result;
