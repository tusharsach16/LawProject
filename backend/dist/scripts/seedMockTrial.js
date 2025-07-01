"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const MockSituation_1 = require("../../src/models/Mocktrial/MockSituation");
const Category_1 = require("../../src/models/quiz/Category");
const mockTrailCases_json_1 = __importDefault(require("../../data/mockTrailCases.json"));
dotenv_1.default.config();
const seedMockTrial = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URL);
        console.log("✅ Connected to MongoDB");
        const categories = await Category_1.Category.find();
        const categoryMap = {};
        categories.forEach((cat) => {
            categoryMap[cat.slug] = cat._id;
        });
        const formattedTrials = mockTrailCases_json_1.default
            .map((t) => {
            const categoryId = categoryMap[t.slug];
            if (!categoryId) {
                console.warn(`⚠️ Category not found for slug: ${t.slug}`);
                return null;
            }
            return {
                title: t.title,
                description: t.description,
                slug: t.slug,
                categoryId,
            };
        })
            .filter(Boolean); // remove nulls
        await MockSituation_1.MockTrialSituation.deleteMany({});
        console.log("🗑️ Old mock trial situations removed");
        await MockSituation_1.MockTrialSituation.insertMany(formattedTrials);
        console.log(`✅ ${formattedTrials.length} mock trial situations inserted successfully!`);
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Error while seeding mock trials:", error);
        process.exit(1);
    }
};
seedMockTrial();
