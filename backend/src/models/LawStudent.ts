import mongoose, { Schema, Document } from "mongoose";

interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  collegeName: string;
  year: number;
  enrollmentNumber?: string;
  areaOfInterest: string;
  isVerified: boolean;
  documents: string[];
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
      
    },
    year: {
      type: Number,
      
    },
    enrollmentNumber: {
      type: String,
    },
    areaOfInterest: {
      type: String,
      
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    documents: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const LawStudent = mongoose.model<IStudent>("LawStudent", studentSchema);

export { LawStudent, IStudent };
