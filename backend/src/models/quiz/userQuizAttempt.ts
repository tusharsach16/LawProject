import mongoose, { Schema, Document } from "mongoose";

interface Answer {
  questionId: mongoose.Types.ObjectId;
  selectedIndex: number;
  isCorrect: boolean;
}

interface IAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  answers: Answer[];
  totalQuestions: number;
  correctCount: number;
  inCorrectCount: number;
  percentage: number;
  createdAt: Date;
  updatedAt: Date;
}

const attemptSchema = new Schema<IAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    answers: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: "Questions", required: true },
        selectedIndex: { type: Number, required: true },
        isCorrect: { type: Boolean, required: true },
      },
    ],
    totalQuestions: { type: Number, required: true },
    correctCount: { type: Number, required: true },
    inCorrectCount: { type: Number, required: true },
    percentage: { type: Number, required: true },
  },
  { timestamps: true }
);

const Attempts = mongoose.model<IAttempt>("Attempts", attemptSchema);

export { Attempts, IAttempt };
