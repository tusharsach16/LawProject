import mongoose, {Schema, Document} from "mongoose";

interface Ilawyer extends Document {
  userId: mongoose.Types.ObjectId;
  licenseNumber?: string;
  experience?: number;
  specialization?: string[];
  ratings?: number;
  reviews?: string[];
  price?: number;
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
      sparse: true,
    },
    experience: {
      type: Number,
      min: 0,
      default: 0,
    },
    specialization: {
      type: [String],
      default: [], 
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
    price: {
      type: Number,
      default: 500
    }
  },
  {timestamps: true}
)

const Lawyer = mongoose.model<Ilawyer>("Lawyer", lawyerSchema);

export {Lawyer, Ilawyer};