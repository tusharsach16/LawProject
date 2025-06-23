import mongoose, { Schema, Document } from "mongoose";

interface MockTrialSituation extends Document {
  title: string;
  description: string;
  slug: string; // should match existing categories
  categoryId: mongoose.Types.ObjectId;

}

const mockTrialSituationSchema = new Schema<MockTrialSituation>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  slug: { type: String, required: true }, // slug must relate to category
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true }
});

const MockTrialSituation = mongoose.model<MockTrialSituation>("MockTrialSituation", mockTrialSituationSchema);

export { MockTrialSituation };
