import mongoose from "mongoose";
import dotenv from "dotenv";
import { MockTrialSituation } from "../../src/models/Mocktrial/MockSituation";
import { Category } from "../../src/models/quiz/Category";
import mockTrailCases from "../../data/mockTrailCases.json";

dotenv.config();

const seedMockTrial = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL as string);
    console.log("✅ Connected to MongoDB");

    const categories = await Category.find();
    const categoryMap: Record<string, any> = {};
    categories.forEach((cat) => {
      categoryMap[cat.slug] = cat._id;
    });

    const formattedTrials = mockTrailCases
      .map((t: any) => {
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

    await MockTrialSituation.deleteMany({});
    console.log("🗑️ Old mock trial situations removed");

    await MockTrialSituation.insertMany(formattedTrials);
    console.log(`✅ ${formattedTrials.length} mock trial situations inserted successfully!`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error while seeding mock trials:", error);
    process.exit(1);
  }
};

seedMockTrial();
