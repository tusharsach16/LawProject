import mongoose, { Schema, Document } from "mongoose";

const specializationOptions = [
  "Civil Law",
  "Criminal Law",
  "Corporate Law",
  "Family Law",
  "Intellectual Property",
  "Real Estate Law",
  "Tax Law",
  "Immigration Law",
  "Labor Law",
  "Environmental Law"
];

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
      enum: specializationOptions
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
  { timestamps: true }
)

lawyerSchema.index({ specialization: 1 });
lawyerSchema.index({ ratings: -1 });

const Lawyer = mongoose.model<Ilawyer>("Lawyer", lawyerSchema);

export { Lawyer, Ilawyer, specializationOptions }; 
