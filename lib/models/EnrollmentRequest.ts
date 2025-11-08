import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollmentRequest extends Document {
  userId: string; // Clerk user ID
  userEmail: string;
  userName: string;
  courseId: mongoose.Types.ObjectId;
  courseName: string;
  coursePrice: number;
  
  // Payment Information
  paymentMethod: 'bkash' | 'nagad' | 'upay' | 'rocket';
  transactionId: string;
  senderNumber: string;
  paymentScreenshot?: string;
  
  // Status
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string; // Admin clerk user ID
  approvedAt?: Date;
  rejectionReason?: string;
  
  // Timestamps
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentRequestSchema = new Schema<IEnrollmentRequest>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  coursePrice: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['bkash', 'nagad', 'upay', 'rocket'],
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    trim: true
  },
  senderNumber: {
    type: String,
    required: true,
    trim: true
  },
  paymentScreenshot: {
    type: String,
    trim: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: String
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Timestamps
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
EnrollmentRequestSchema.index({ userId: 1, courseId: 1 });
EnrollmentRequestSchema.index({ status: 1 });
EnrollmentRequestSchema.index({ submittedAt: -1 });

export default mongoose.models.EnrollmentRequest || mongoose.model<IEnrollmentRequest>('EnrollmentRequest', EnrollmentRequestSchema);
