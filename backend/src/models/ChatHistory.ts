import mongoose, { Schema, Document } from "mongoose";

export interface IMessage {
  sender: 'user' | 'bot';
  content: string;
  encryptionVersion?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChatHistory extends Document {
  userId: mongoose.Types.ObjectId;
  messages: IMessage[];
  historyVersion?: number;
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
  },
  encryptionVersion: {
    type: String,
    required: false
  }
}, { 
  timestamps: true,
  _id: false 
});

const chatHistorySchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  messages: [messageSchema],
  historyVersion: {
    type: Number,
    required: false,
    default: 1
  }
}, { 
  timestamps: true
});

export const ChatHistory = mongoose.model<IChatHistory>('ChatHistory', chatHistorySchema);
