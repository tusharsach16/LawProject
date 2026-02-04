import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

interface Iuser extends Document {
  name: string;
  lastname?: string;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: 'general' | 'lawstudent' | 'lawyer';
  bio?: string;
  location?: string;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  friends: mongoose.Types.ObjectId[];
  _id: mongoose.Types.ObjectId;
  comparePassword: (userPassword: string) => Promise<boolean>;
}

const userSchema = new Schema<Iuser>({
  name: { type: String, required: true },
  lastname: { type: String },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    required: true,
    enum: ['general', 'lawstudent', 'lawyer']
  },
  bio: {
    type: String,
    default: 'Welcome to my profile!',
    maxlength: 160
  },
  location: {
    type: String,
    default: '',
    maxlength: 50
  },
  profileImageUrl: {
    type: String,
    default: 'https://placehold.co/150x150/7c3aed/ffffff?text=User'
  },
  bannerImageUrl: {
    type: String,
    default: 'https://placehold.co/600x200/1e293b/ffffff?text=Profile'
  },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }]
}, { timestamps: true });

userSchema.methods.comparePassword = async function (
  userPassword: string
): Promise<boolean> {
  return await bcrypt.compare(userPassword, this.password);
};

const User = mongoose.model<Iuser>("User", userSchema);

export { User, Iuser };
