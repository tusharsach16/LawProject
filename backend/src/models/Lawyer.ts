import mongoose, {Schema, Document} from "mongoose";

interface Ilawyer extends Document {
  userId: mongoose.Types.ObjectId;
  licenseNumber: string;
  experience: number;
  specialization: string[];
  bio?: string;
  verified: boolean;
  ratings?: number;
  reviews?: string[];
  location?: string;
}

const lawyerSchema = new Schema<Ilawyer>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    licenseNumber: {
      type: String,
      unique: true,
    },
    experience: {
      type: Number,
      min: 0,
    },
    specialization: {
      type: [String],
    },
    bio: {
      type: String,
      default: "",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      default: "",
    },
  },
  {timestamps: true}
)

const Lawyer = mongoose.model<Ilawyer>("Lawyer", lawyerSchema);

export {Lawyer, Ilawyer};