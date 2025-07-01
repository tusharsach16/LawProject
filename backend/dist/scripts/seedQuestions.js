"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Question_1 = require("../models/quiz/Question");
const Category_1 = require("../models/quiz/Category");
const questions_json_1 = __importDefault(require("../../data/questions.json"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const seedQuestions = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URL);
        const categories = await Category_1.Category.find();
        const categoryMap = {};
        categories.forEach((cat) => {
            categoryMap[cat.slug] = cat._id;
        });
        const formattedQuestions = questions_json_1.default
            .map((q) => {
            const categoryId = categoryMap[q.category];
            if (!categoryId) {
                console.warn(`⚠️ Category not found for slug: ${q.category}`);
                return null; // skip if category doesn't exist
            }
            return {
                ques: q.ques,
                options: q.options,
                correctIndex: q.correctIndex,
                categoryId,
            };
        })
            .filter(Boolean); // remove nulls
        await Question_1.Questions.deleteMany({});
        console.log(" Old questions removed");
        await Question_1.Questions.insertMany(formattedQuestions);
        console.log(` ${formattedQuestions.length} questions inserted successfully!`);
        process.exit(0);
    }
    catch (error) {
        console.error(" Seeding error:", error);
        process.exit(1);
    }
};
seedQuestions();
