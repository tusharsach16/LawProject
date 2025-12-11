import mongoose, { Schema, Document } from "mongoose";

interface IMessage {
  sender: 'user' | 'bot';
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChatHistory extends Document {
  userId: mongoose.Types.ObjectId;
  messages: IMessage[];
  createdAt?: Date;
  updatedAt?: Date;
}

const messageSchema = new Schema({
  sender: { 
    type: String, 
    enum: ['user', 'bot'], 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  }
}, { 
  timestamps: true,  // This automatically adds createdAt and updatedAt
  _id: false 
});

const chatHistorySchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  messages: [messageSchema]
}, { 
  timestamps: true  // This adds createdAt and updatedAt to the ChatHistory document
});

export const ChatHistory = mongoose.model<IChatHistory>('ChatHistory', chatHistorySchema);