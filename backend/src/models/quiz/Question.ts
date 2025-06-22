import mongoose, { Schema, Document, Types} from 'mongoose';

interface IQuiz extends Document {
  ques: string;
  options: string[];
  correctIndex: number;
  categoryId: mongoose.Types.ObjectId;
  explanation?: string;
}

const questionSchema = new Schema<IQuiz>(
  {
    ques: { type: String, required: true },
    options: { type: [String], required: true }, // array of options
    correctIndex: { type: Number, required: true }, // 0-based index
    categoryId: {type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true},
    explanation: { type: String }, // optional
  },
  { timestamps: true }
);

const Questions = mongoose.model<IQuiz>('Questions', questionSchema);

export { Questions, IQuiz };
