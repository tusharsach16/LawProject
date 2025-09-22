import mongoose, { Schema, Document } from "mongoose";
import { specializationOptions } from "./Lawyer"; 

interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  collegeName?: string;
  year?: number;
  enrollmentNumber?: string;
  areaOfInterest?: string[];
}

const studentSchema = new Schema<IStudent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    collegeName: {
      type: String,
      trim: true,
    },
    year: {
      type: Number,
      min: 1,
      max: 5, 
    },
    enrollmentNumber: {
      type: String,
      unique: true,
      sparse: true, 
      trim: true,
    },
    areaOfInterest: {
      type: [String], 
      default: [], 
      enum: specializationOptions
    },
  },
  { timestamps: true }
);

const LawStudent = mongoose.model<IStudent>("LawStudent", studentSchema);

export { LawStudent, IStudent };
