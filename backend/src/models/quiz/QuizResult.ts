import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizResult extends Document {
  userId: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: {
    questionId: mongoose.Types.ObjectId;
    selectedAnswer: string;
    isCorrect: boolean;
  }[];
}

const answerSchema = new Schema({
  questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  selectedAnswer: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
}, { _id: false });

const quizResultSchema = new Schema<IQuizResult>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true // We will search by user so an index is good
  },
  quizId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Quiz', 
    required: true 
  },
  categoryId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true 
  },
  score: { 
    type: Number, 
    required: true 
  },
  totalQuestions: { 
    type: Number, 
    required: true 
  },
  percentage: { 
    type: Number, 
    required: true 
  },
  answers: [answerSchema],
}, { timestamps: true });

export const QuizResult = mongoose.model<IQuizResult>('QuizResult', quizResultSchema);
