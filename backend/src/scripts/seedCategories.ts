import mongoose from "mongoose";
import { Category } from "../models/quiz/Category";
import dotenv from "dotenv";

dotenv.config();

const categories = [
  { slug: "criminal", title: "Criminal Law" },
  { slug: "civil", title: "Civil Law" },
  { slug: "constitutional", title: "Constitutional Law" },
  { slug: "ipc", title: "Indian Penal Code" }
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL as string);
    await Category.deleteMany({});
    await Category.insertMany(categories);
    console.log("✅ Categories seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding categories:", err);
    process.exit(1);
  }
};

seedCategories();
