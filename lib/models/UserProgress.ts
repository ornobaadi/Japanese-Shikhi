import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// TypeScript interface for UserProgress document
export interface IUserProgress extends Document {
  userId: Types.ObjectId;
  lessonId: Types.ObjectId;
  courseId: Types.ObjectId;

  // Progress tracking
  status: 'not_started' | 'in_progress' | 'completed' | 'mastered';
  progressPercentage: number; // 0-100
  timeSpent: number; // in minutes
  attempts: number;

  // Completion details
  startedAt?: Date;
  completedAt?: Date;
  lastAccessedAt: Date;

  // Performance metrics
  score?: number; // 0-100
  accuracy?: number; // 0-100 for exercises
  xpEarned: number;

  // Learning data
  objectivesCompleted: string[]; // Array of objective IDs
  mistakesMade: {
    type: string;
    description: string;
    count: number;
    lastOccurrence: Date;
  }[];

  // Spaced repetition data
  reviewCount: number;
  nextReviewDate?: Date;
  easeFactor: number; // For spaced repetition algorithm
  interval: number; // Days until next review

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Mistake tracking schema
const MistakeSchema = new Schema({
  type: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  count: {
    type: Number,
    default: 1,
    min: 1,
  },
  lastOccurrence: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

// Main UserProgress Schema
const UserProgressSchema = new Schema<IUserProgress>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lessonId: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true,
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },

  // Progress tracking
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'mastered'],
    default: 'not_started',
  },
  progressPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  timeSpent: {
    type: Number,
    default: 0,
    min: 0,
  },
  attempts: {
    type: Number,
    default: 0,
    min: 0,
  },

  // Completion details
  startedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now,
  },

  // Performance metrics
  score: {
    type: Number,
    min: 0,
    max: 100,
  },
  accuracy: {
    type: Number,
    min: 0,
    max: 100,
  },
  xpEarned: {
    type: Number,
    default: 0,
    min: 0,
  },

  // Learning data
  objectivesCompleted: [{
    type: String,
  }],
  mistakesMade: [MistakeSchema],

  // Spaced repetition data
  reviewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  nextReviewDate: {
    type: Date,
  },
  easeFactor: {
    type: Number,
    default: 2.5, // Standard SM-2 algorithm starting value
    min: 1.3,
  },
  interval: {
    type: Number,
    default: 1, // Days
    min: 1,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Compound indexes for performance
UserProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
UserProgressSchema.index({ userId: 1, courseId: 1 });
UserProgressSchema.index({ userId: 1, status: 1 });
UserProgressSchema.index({ userId: 1, completedAt: 1 });
UserProgressSchema.index({ lessonId: 1, status: 1 });
UserProgressSchema.index({ nextReviewDate: 1 });

// Virtual for completion rate
UserProgressSchema.virtual('isCompleted').get(function(this: IUserProgress) {
  return this.status === 'completed' || this.status === 'mastered';
});

// Virtual for days since last access
UserProgressSchema.virtual('daysSinceLastAccess').get(function(this: IUserProgress) {
  const now = new Date();
  const lastAccess = new Date(this.lastAccessedAt);
  return Math.floor((now.getTime() - lastAccess.getTime()) / (1000 * 60 * 60 * 24));
});

// Virtual for is due for review
UserProgressSchema.virtual('isDueForReview').get(function(this: IUserProgress) {
  if (!this.nextReviewDate) return false;
  return new Date() >= this.nextReviewDate;
});

// Pre-save middleware to set completion timestamps
UserProgressSchema.pre('save', function(this: IUserProgress) {
  // Set startedAt when progress begins
  if (this.isModified('status') && this.status !== 'not_started' && !this.startedAt) {
    this.startedAt = new Date();
  }

  // Set completedAt when lesson is completed
  if (this.isModified('status') && (this.status === 'completed' || this.status === 'mastered') && !this.completedAt) {
    this.completedAt = new Date();
  }

  // Update lastAccessedAt
  if (this.isModified('progressPercentage') || this.isModified('timeSpent')) {
    this.lastAccessedAt = new Date();
  }
});

// Static method to find user's progress for a course
UserProgressSchema.statics.findUserCourseProgress = function(userId: string | Types.ObjectId, courseId: string | Types.ObjectId) {
  return this.find({ userId, courseId }).populate('lessonId');
};

// Static method to find completed lessons for a user
UserProgressSchema.statics.findCompletedLessons = function(userId: string | Types.ObjectId) {
  return this.find({
    userId,
    status: { $in: ['completed', 'mastered'] },
  }).populate('lessonId courseId');
};

// Static method to find lessons due for review
UserProgressSchema.statics.findDueForReview = function(userId: string | Types.ObjectId) {
  return this.find({
    userId,
    nextReviewDate: { $lte: new Date() },
    status: { $in: ['completed', 'mastered'] },
  }).populate('lessonId');
};

// Static method to get user's overall progress statistics
UserProgressSchema.statics.getUserStats = function(userId: string | Types.ObjectId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId.toString()) } },
    {
      $group: {
        _id: '$userId',
        totalLessons: { $sum: 1 },
        completedLessons: {
          $sum: { $cond: [{ $in: ['$status', ['completed', 'mastered']] }, 1, 0] }
        },
        totalTimeSpent: { $sum: '$timeSpent' },
        totalXPEarned: { $sum: '$xpEarned' },
        averageScore: { $avg: '$score' },
        averageAccuracy: { $avg: '$accuracy' },
      }
    }
  ]);
};

// Instance method to calculate next review date using spaced repetition
UserProgressSchema.methods.calculateNextReview = function(quality: number) {
  // SM-2 algorithm implementation
  // quality: 0-5 (0 = complete blackout, 5 = perfect response)

  if (quality >= 3) {
    if (this.reviewCount === 0) {
      this.interval = 1;
    } else if (this.reviewCount === 1) {
      this.interval = 6;
    } else {
      this.interval = Math.round(this.interval * this.easeFactor);
    }
    this.reviewCount += 1;
  } else {
    this.reviewCount = 0;
    this.interval = 1;
  }

  this.easeFactor = this.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  if (this.easeFactor < 1.3) {
    this.easeFactor = 1.3;
  }

  this.nextReviewDate = new Date(Date.now() + this.interval * 24 * 60 * 60 * 1000);

  return this.save();
};

// Instance method to add a mistake
UserProgressSchema.methods.addMistake = function(type: string, description: string) {
  const existingMistake = this.mistakesMade.find(m => m.type === type && m.description === description);

  if (existingMistake) {
    existingMistake.count += 1;
    existingMistake.lastOccurrence = new Date();
  } else {
    this.mistakesMade.push({
      type,
      description,
      count: 1,
      lastOccurrence: new Date(),
    });
  }

  return this.save();
};

// Instance method to update progress
UserProgressSchema.methods.updateProgress = function(data: {
  progressPercentage?: number;
  timeSpent?: number;
  score?: number;
  accuracy?: number;
  xpEarned?: number;
  objectivesCompleted?: string[];
}) {
  Object.assign(this, data);

  // Auto-update status based on progress
  if (this.progressPercentage === 100 && this.status !== 'completed' && this.status !== 'mastered') {
    this.status = 'completed';
  } else if (this.progressPercentage > 0 && this.status === 'not_started') {
    this.status = 'in_progress';
  }

  this.attempts += 1;

  return this.save();
};

// Create and export the model
const UserProgress: Model<IUserProgress> = mongoose.models.UserProgress || mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);

export default UserProgress;