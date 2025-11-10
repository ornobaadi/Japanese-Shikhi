import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignmentSubmission extends Document {
  courseId: mongoose.Types.ObjectId;
  moduleIndex: number;
  itemIndex: number; // Index of assignment in module items
  studentId: string; // Clerk user ID
  studentName: string;
  studentEmail: string;
  
  // Submission content
  textAnswer?: string;
  attachments: {
    type: 'file' | 'link' | 'drive';
    url: string;
    name: string;
    uploadedAt: Date;
  }[];
  
  // Grading
  status: 'submitted' | 'graded' | 'returned' | 'late';
  grade?: number;
  maxGrade: number;
  percentage?: number;
  feedback?: string;
  gradedAt?: Date;
  gradedBy?: string; // Clerk user ID of grader
  
  // Timestamps
  submittedAt: Date;
  dueDate?: Date;
  isLate: boolean;
  
  // Metadata
  attemptNumber: number;
  ipAddress?: string;
  userAgent?: string;
}

const AssignmentSubmissionSchema = new Schema<IAssignmentSubmission>({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  moduleIndex: {
    type: Number,
    required: true
  },
  itemIndex: {
    type: Number,
    required: true
  },
  studentId: {
    type: String,
    required: true,
    index: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  textAnswer: {
    type: String,
    maxlength: 10000
  },
  attachments: [{
    type: {
      type: String,
      enum: ['file', 'link', 'drive'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['submitted', 'graded', 'returned', 'late'],
    default: 'submitted'
  },
  grade: {
    type: Number,
    min: 0
  },
  maxGrade: {
    type: Number,
    required: true,
    default: 100
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: {
    type: String,
    maxlength: 2000
  },
  gradedAt: Date,
  gradedBy: String,
  submittedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: Date,
  isLate: {
    type: Boolean,
    default: false
  },
  attemptNumber: {
    type: Number,
    required: true,
    default: 1
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Compound indexes for efficient queries
AssignmentSubmissionSchema.index({ courseId: 1, studentId: 1 });
AssignmentSubmissionSchema.index({ studentId: 1, submittedAt: -1 });
AssignmentSubmissionSchema.index({ courseId: 1, status: 1 });
AssignmentSubmissionSchema.index({ status: 1, gradedAt: -1 });

// Virtual for checking if submission needs grading
AssignmentSubmissionSchema.virtual('needsGrading').get(function() {
  return this.status === 'submitted' && !this.grade;
});

const AssignmentSubmission = mongoose.models.AssignmentSubmission || 
  mongoose.model<IAssignmentSubmission>('AssignmentSubmission', AssignmentSubmissionSchema);

export default AssignmentSubmission;
