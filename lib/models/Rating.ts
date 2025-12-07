import mongoose, { Schema, Document } from 'mongoose';

export interface IRating extends Document {
  courseId: mongoose.Types.ObjectId;
  userId: string;
  userName: string;
  userEmail?: string;
  rating: number; // 1-5 stars
  review: string;
  isFakeRating?: boolean; // Admin-added fake ratings
  isVerified?: boolean; // Only students who completed course can rate
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema = new Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  review: {
    type: String,
    required: true,
  },
  isFakeRating: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Rating || mongoose.model<IRating>('Rating', RatingSchema);
