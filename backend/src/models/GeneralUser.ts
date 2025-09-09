import mongoose, { Schema, Document } from "mongoose";

interface IGeneralUser extends Document {
  userId: mongoose.Types.ObjectId;
  interests?: string[];
  queries?: string[];
  bookmarkedLawyers?: mongoose.Types.ObjectId[];
  bookmarkedArticles?: mongoose.Types.ObjectId[];
}

const generalUserSchema = new Schema<IGeneralUser>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    interests: {
      type: [String],
      default: [],
    },
    queries: {
      type: [String],
      default: [],
    },
    bookmarkedLawyers: {
      type: [Schema.Types.ObjectId],
      ref: "Lawyer", 
      default: [],
    },
    bookmarkedArticles: {
      type: [Schema.Types.ObjectId],
      ref: "Article", 
      default: [],
    },
  },
  { timestamps: true }
);

const GeneralUser = mongoose.model<IGeneralUser>("GeneralUser", generalUserSchema);

export { GeneralUser, IGeneralUser };