"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Category_1 = require("../models/quiz/Category");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const categories = [
    { slug: "criminal", title: "Criminal Law" },
    { slug: "civil", title: "Civil Law" },
    { slug: "constitutional", title: "Constitutional Law" },
    { slug: "ipc", title: "Indian Penal Code" }
];
const seedCategories = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URL);
        await Category_1.Category.deleteMany({});
        await Category_1.Category.insertMany(categories);
        console.log("✅ Categories seeded successfully!");
        process.exit(0);
    }
    catch (err) {
        console.error("❌ Error seeding categories:", err);
        process.exit(1);
    }
};
seedCategories();
