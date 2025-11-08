import mongoose, { Schema, Document } from 'mongoose';

interface MCQAnswer {
  questionIndex: number;
  selectedOptionIndex: number;
  isCorrect: boolean;
  pointsEarned: number;
}

interface OpenEndedAnswer {
  textAnswer?: string;
  fileUrl?: string;
  gradedScore?: number;
  feedback?: string;
  gradedAt?: Date;
  gradedBy?: string;
}

export interface IQuizSubmission extends Document {
  courseId: mongoose.Types.ObjectId;
  moduleIndex: number;
  itemIndex: number; // Index of quiz in module items
  studentId: string; // Clerk user ID
  studentName: string;
  studentEmail: string;
  quizType: 'mcq' | 'open-ended';

  // MCQ specific
  mcqAnswers?: MCQAnswer[];

  // Open-ended specific
  openEndedAnswer?: OpenEndedAnswer;

  // Common fields
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  attemptNumber: number;
  startedAt: Date;
  submittedAt: Date;
  timeSpent: number; // in seconds

  // Security
  ipAddress?: string;
  userAgent?: string;
}

const QuizSubmissionSchema = new Schema<IQuizSubmission>({
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
  quizType: {
    type: String,
    enum: ['mcq', 'open-ended'],
    required: true
  },
  mcqAnswers: [{
    questionIndex: {
      type: Number,
      required: true
    },
    selectedOptionIndex: {
      type: Number,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    pointsEarned: {
      type: Number,
      required: true
    }
  }],
  openEndedAnswer: {
    textAnswer: String,
    fileUrl: String,
    gradedScore: Number,
    feedback: String,
    gradedAt: Date,
    gradedBy: String
  },
  score: {
    type: Number,
    required: true,
    default: 0
  },
  totalPoints: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  passed: {
    type: Boolean,
    required: true
  },
  attemptNumber: {
    type: Number,
    required: true,
    default: 1
  },
  startedAt: {
    type: Date,
    required: true
  },
  submittedAt: {
    type: Date,
    required: true
  },
  timeSpent: {
    type: Number,
    required: true
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Compound indexes for efficient queries
QuizSubmissionSchema.index({ courseId: 1, moduleIndex: 1, itemIndex: 1 });
QuizSubmissionSchema.index({ studentId: 1, courseId: 1 });
QuizSubmissionSchema.index({ studentId: 1, courseId: 1, moduleIndex: 1, itemIndex: 1, attemptNumber: 1 });

// Prevent duplicate submissions for quizzes that don't allow multiple attempts
QuizSubmissionSchema.pre('save', async function(next) {
  if (this.isNew && this.attemptNumber === 1) {
    // Check will be done in the API endpoint
    next();
  } else {
    next();
  }
});

export default mongoose.models.QuizSubmission || mongoose.model<IQuizSubmission>('QuizSubmission', QuizSubmissionSchema);
