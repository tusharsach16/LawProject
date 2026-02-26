import mongoose, { Schema, Document } from "mongoose";

interface IAppointment extends Document {
  _id: mongoose.Types.ObjectId;
  lawyerId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  appointmentTime: Date;
  duration: number;
  price: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  appointmentStatus: 'scheduled' | 'cancelled' | 'completed';
  callRoomId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  cancellationReason?: string;
  cancelledBy?: 'user' | 'lawyer';
  cancelledAt?: Date;
  allottedTime?: string;
  actualCallDuration?: number;
  participants?: mongoose.Types.ObjectId[];
  maxParticipants?: number;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    lawyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    appointmentTime: { type: Date, required: true },
    duration: { type: Number, required: true, default: 30 },
    price: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    appointmentStatus: { type: String, enum: ['scheduled', 'cancelled', 'completed'], default: 'scheduled' },
    callRoomId: { type: String, required: true, unique: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    cancellationReason: String,
    cancelledBy: { type: String, enum: ['user', 'lawyer'] },
    cancelledAt: Date,
    allottedTime: { type: String },
    actualCallDuration: { type: Number },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    maxParticipants: { type: Number, default: 2 }
  },
  { timestamps: true }
);

// Compound indexes for efficient querying
// Compound indexes for efficient querying
appointmentSchema.index(
  { lawyerId: 1, appointmentTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      appointmentStatus: 'scheduled',
      paymentStatus: { $in: ['paid', 'pending'] }
    },
    name: 'unique_lawyer_scheduled_slot'
  }
);
appointmentSchema.index({ userId: 1, appointmentTime: 1 });
appointmentSchema.index({ lawyerId: 1, appointmentStatus: 1 });
appointmentSchema.index({ appointmentTime: 1, appointmentStatus: 1 });
appointmentSchema.index({ paymentStatus: 1, createdAt: 1 });

interface ILawyerAvailability extends Document {
  _id: mongoose.Types.ObjectId;
  lawyerId: mongoose.Types.ObjectId;
  dayOfWeek?: number;
  date?: string;
  slots: { startTime: string; endTime: string; }[];
  isActive: boolean;
}

const lawyerAvailabilitySchema = new Schema<ILawyerAvailability>(
  {
    lawyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6
    },
    date: {
      type: String,
      validate: {
        validator: function (value: string) {
          if (!value) return true; // Optional if dayOfWeek is provided
          // Validate date format YYYY-MM-DD
          return /^\d{4}-\d{2}-\d{2}$/.test(value);
        },
        message: 'Date must be in format YYYY-MM-DD'
      }
    },
    slots: [{
      startTime: {
        type: String,
        required: true,
        validate: {
          validator: function (v: string) {
            return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(v);
          },
          message: 'Start time must be in format HH:MM'
        }
      },
      endTime: {
        type: String,
        required: true,
        validate: {
          validator: function (v: string) {
            return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(v);
          },
          message: 'End time must be in format HH:MM'
        }
      },
    }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Compound indexes for efficient querying
// Unique index for date-based availability (one per lawyer per date)
lawyerAvailabilitySchema.index({ lawyerId: 1, date: 1 }, { unique: true, sparse: true });
// Unique index for dayOfWeek-based availability (one per lawyer per day of week)
lawyerAvailabilitySchema.index({ lawyerId: 1, dayOfWeek: 1 }, { unique: true, sparse: true });
// Index for active availability queries
lawyerAvailabilitySchema.index({ lawyerId: 1, isActive: 1 });

// Note: Pre-save hooks don't always run with findOneAndUpdate
// Validation is handled in the controller instead

const Appointment = mongoose.model<IAppointment>("Appointment", appointmentSchema);
const LawyerAvailability = mongoose.model<ILawyerAvailability>("LawyerAvailability", lawyerAvailabilitySchema);

export { Appointment, LawyerAvailability, IAppointment, ILawyerAvailability };