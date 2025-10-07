import mongoose, { Schema, Document } from "mongoose";

interface IMessage extends Document {
  sender: 'user' | 'bot';
  content: string;
}

export interface IChatHistory extends Document {
  userId: mongoose.Types.ObjectId;
  messages: IMessage[];
}

const messageSchema = new Schema<IMessage>({
  sender: { type: String, enum: ['user', 'bot'], required: true },
  content: { type: String, required: true },
}, { timestamps: true, _id: false });

const chatHistorySchema = new Schema<IChatHistory>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  messages: [messageSchema],
}, { timestamps: true });

export const ChatHistory = mongoose.model<IChatHistory>('ChatHistory', chatHistorySchema);
