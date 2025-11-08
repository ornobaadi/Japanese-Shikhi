import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  clerkUserId: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  nativeLanguage: string;
  learningGoals: string[];
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  subscriptionStatus: 'free' | 'premium' | 'lifetime';
  subscriptionExpiry?: Date;
  learningStreak: number;
  lastActiveDate: Date;
  totalStudyTime: number; // in minutes
  enrolledCourses: {
    courseId: mongoose.Types.ObjectId;
    enrolledAt: Date;
    progress: {
      completedLessons: number;
      totalLessons: number;
      progressPercentage: number;
      lastAccessedAt: Date;
    };
    completedAt?: Date;
    certificateId?: string;
  }[];
  preferences: {
    dailyGoal: number; // minutes per day
    notifications: boolean;
    preferredScript: 'hiragana' | 'katakana' | 'kanji' | 'romaji';
    difficultyPreference: 'gradual' | 'challenging';
  };
  statistics: {
    wordsLearned: number;
    lessonsCompleted: number;
    quizzesCompleted: number;
    accuracyRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  clerkUserId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  profileImageUrl: String,
  nativeLanguage: {
    type: String,
    default: 'English'
  },
  learningGoals: {
    type: [String],
    default: []
  },
  currentLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  subscriptionStatus: {
    type: String,
    enum: ['free', 'premium', 'lifetime'],
    default: 'free'
  },
  subscriptionExpiry: Date,
  learningStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  lastActiveDate: {
    type: Date,
    default: Date.now
  },
  totalStudyTime: {
    type: Number,
    default: 0,
    min: 0
  },
  // Courses user is enrolled in
  enrolledCourses: {
    type: [
      {
        courseId: {
          type: Schema.Types.ObjectId,
          ref: 'Course',
          required: true
        },
        enrolledAt: {
          type: Date,
          default: Date.now
        },
        progress: {
          completedLessons: { type: Number, default: 0, min: 0 },
          totalLessons: { type: Number, default: 0, min: 0 },
          progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
          lastAccessedAt: { type: Date, default: Date.now }
        },
        completedAt: {
          type: Date
        },
        certificateId: {
          type: String
        }
      }
    ],
    default: []
  },
  preferences: {
    dailyGoal: {
      type: Number,
      default: 15,
      min: 5,
      max: 120
    },
    notifications: {
      type: Boolean,
      default: true
    },
    preferredScript: {
      type: String,
      enum: ['hiragana', 'katakana', 'kanji', 'romaji'],
      default: 'hiragana'
    },
    difficultyPreference: {
      type: String,
      enum: ['gradual', 'challenging'],
      default: 'gradual'
    }
  },
  statistics: {
    wordsLearned: {
      type: Number,
      default: 0,
      min: 0
    },
    lessonsCompleted: {
      type: Number,
      default: 0,
      min: 0
    },
    quizzesCompleted: {
      type: Number,
      default: 0,
      min: 0
    },
    accuracyRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
// `email` and `clerkUserId` already have `unique: true` on their field definitions.
// Keep other performance indexes here.
UserSchema.index({ currentLevel: 1 });
UserSchema.index({ subscriptionStatus: 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

// Method to check if subscription is active
UserSchema.methods.hasActiveSubscription = function() {
  if (this.subscriptionStatus === 'lifetime') return true;
  if (this.subscriptionStatus === 'premium' && this.subscriptionExpiry) {
    return new Date() < this.subscriptionExpiry;
  }
  return false;
};

// Method to update learning streak
UserSchema.methods.updateStreak = function() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastActive = new Date(this.lastActiveDate);

  if (lastActive.toDateString() === yesterday.toDateString()) {
    this.learningStreak += 1;
  } else if (lastActive.toDateString() !== today.toDateString()) {
    this.learningStreak = 1;
  }

  this.lastActiveDate = today;
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);