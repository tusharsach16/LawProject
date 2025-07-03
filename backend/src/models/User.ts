import mongoose, {Schema, Document, mongo} from 'mongoose';
import bcrypt from 'bcryptjs';

interface Iuser extends Document {
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: 'general' | 'lawstudent' | 'lawyer';
  comparePassword: (userPassword: string) => Promise<boolean>; // Changed Boolean to boolean
  friends: mongoose.Types.ObjectId[],
  _id: mongoose.Types.ObjectId
}

const userSchema = new Schema<Iuser>({
  name: { type: String, required: true },
  username: {type: String, required: true, unique: true},
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['general', 'lawstudent', 'lawyer'] 
  },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }]
}, { timestamps: true });

// Add password comparison method
userSchema.methods.comparePassword = async function(
  userPassword: string
): Promise<boolean> {
  return await bcrypt.compare(userPassword, this.password);
};

const User = mongoose.model<Iuser>("User", userSchema);

export { User, Iuser };