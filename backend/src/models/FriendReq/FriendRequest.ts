import mongoose, { Schema, Document } from "mongoose";

interface IFriends extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected' | 'unfriended';
}

const friendsSchema = new Schema<IFriends>({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'unfriended'],
    default: 'pending'
  }
}, { timestamps: true });

const Friends = mongoose.model<IFriends>("Friends", friendsSchema);
export { Friends, IFriends };
