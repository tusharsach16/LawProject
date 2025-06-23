import mongoose, { Schema, Document } from "mongoose";

interface Message {
  senderId: mongoose.Types.ObjectId;
  text: string;
  timestamp: Date;
}

interface MockTrial extends Document {
  plaintiffId: mongoose.Types.ObjectId;
  defendantId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;  // 🟢 NEW
  messages: Message[];
  startedAt: Date;
  endedAt?: Date;
  winnerId?: mongoose.Types.ObjectId;
  status: "active" | "ended" | "left";
}

const messageSchema = new Schema<Message>({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const mockTrialSchema = new Schema<MockTrial>(
  {
    plaintiffId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    defendantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true }, // 🟢 NEW
    messages: { type: [messageSchema], default: [] },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    winnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["active", "ended", "left"],
      default: "active"
    }
  },
  { timestamps: true }
);

const MockTrial = mongoose.model<MockTrial>("MockTrial", mockTrialSchema);
export { MockTrial };
