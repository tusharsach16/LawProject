import mongoose from "mongoose";
import { Questions } from "../models/quiz/Question";
import { Category } from "../models/quiz/Category";
import questions from "../../data/questions.json";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const seedQuestions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL as string);
    const categories = await Category.find();
    
    const categoryMap: Record<string, any> = {};
    categories.forEach((cat) => {
      categoryMap[cat.slug] = cat._id;
    });

    const formattedQuestions = questions
      .map((q: any) => {
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

    await Questions.deleteMany({});
    console.log("🗑️ Old questions removed");

    await Questions.insertMany(formattedQuestions);
    console.log(`✅ ${formattedQuestions.length} questions inserted successfully!`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedQuestions();
