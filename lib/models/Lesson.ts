import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// TypeScript interfaces for content blocks
export interface IContentBlock {
  type: 'text' | 'image' | 'audio' | 'video' | 'interactive' | 'quiz';
  content: string;
  metadata?: {
    audioUrl?: string;
    imageUrl?: string;
    videoUrl?: string;
    alt?: string;
    caption?: string;
  };
}

export interface ILessonObjective {
  id: string;
  description: string;
  completed: boolean;
}

// TypeScript interface for Lesson document
export interface ILesson extends Document {
  courseId: Types.ObjectId;
  title: string;
  description: string;
  slug: string;

  // Content
  content: IContentBlock[];
  objectives: ILessonObjective[];

  // Structure
  order: number;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';

  // Japanese content specifics
  vocabularyIntroduced: Types.ObjectId[]; // References to Vocabulary documents
  grammarPoints: string[];
  culturalNotes?: string;

  // Access and requirements
  isPublished: boolean;
  isPremium: boolean;
  prerequisites: Types.ObjectId[]; // Other lesson IDs that must be completed first

  // Engagement
  xpReward: number;
  completionCount: number;
  averageCompletionTime: number; // in minutes
  rating: number;
  reviewCount: number;

  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

// Content Block Schema
const ContentBlockSchema = new Schema<IContentBlock>({
  type: {
    type: String,
    enum: ['text', 'image', 'audio', 'video', 'interactive', 'quiz'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  metadata: {
    audioUrl: String,
    imageUrl: String,
    videoUrl: String,
    alt: String,
    caption: String,
  },
}, { _id: false });

// Lesson Objective Schema
const LessonObjectiveSchema = new Schema<ILessonObjective>({
  id: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
    maxlength: 200,
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

// Main Lesson Schema
const LessonSchema = new Schema<ILesson>({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300,
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9-]+$/,
  },

  // Content
  content: [ContentBlockSchema],
  objectives: [LessonObjectiveSchema],

  // Structure
  order: {
    type: Number,
    required: true,
    min: 0,
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
  },

  // Japanese content specifics
  vocabularyIntroduced: [{
    type: Schema.Types.ObjectId,
    ref: 'Vocabulary',
  }],
  grammarPoints: [{
    type: String,
    trim: true,
  }],
  culturalNotes: {
    type: String,
    trim: true,
  },

  // Access and requirements
  isPublished: {
    type: Boolean,
    default: false,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  prerequisites: [{
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
  }],

  // Engagement
  xpReward: {
    type: Number,
    default: 10,
    min: 0,
  },
  completionCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  averageCompletionTime: {
    type: Number,
    default: 0,
    min: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0,
  },

  // Metadata
  createdBy: {
    type: String,
    required: true,
  },
  publishedAt: {
    type: Date,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Compound indexes for performance
LessonSchema.index({ courseId: 1, order: 1 });
LessonSchema.index({ courseId: 1, isPublished: 1 });
LessonSchema.index({ slug: 1 }, { unique: true });
LessonSchema.index({ difficulty: 1 });
LessonSchema.index({ isPublished: 1, isPremium: 1 });

// Virtual for lesson URL
LessonSchema.virtual('url').get(function(this: ILesson) {
  return `/lessons/${this.slug}`;
});

// Pre-save middleware
LessonSchema.pre('save', function(this: ILesson) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

// Static method to find lessons by course
LessonSchema.statics.findByCourse = function(courseId: string | Types.ObjectId, published = true) {
  const filter: any = { courseId };
  if (published) filter.isPublished = true;
  return this.find(filter).sort({ order: 1 });
};

// Static method to find next lesson
LessonSchema.statics.findNextLesson = function(courseId: string | Types.ObjectId, currentOrder: number) {
  return this.findOne({
    courseId,
    order: { $gt: currentOrder },
    isPublished: true,
  }).sort({ order: 1 });
};

// Static method to find previous lesson
LessonSchema.statics.findPreviousLesson = function(courseId: string | Types.ObjectId, currentOrder: number) {
  return this.findOne({
    courseId,
    order: { $lt: currentOrder },
    isPublished: true,
  }).sort({ order: -1 });
};

// Instance method to mark as completed
LessonSchema.methods.markCompleted = function(completionTime: number) {
  this.completionCount += 1;

  // Calculate new average completion time
  const totalTime = this.averageCompletionTime * (this.completionCount - 1) + completionTime;
  this.averageCompletionTime = totalTime / this.completionCount;

  return this.save();
};

// Instance method to update rating
LessonSchema.methods.updateRating = function(newRating: number) {
  const totalRating = this.rating * this.reviewCount + newRating;
  this.reviewCount += 1;
  this.rating = totalRating / this.reviewCount;
  return this.save();
};

// Create and export the model
const Lesson: Model<ILesson> = mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);

export default Lesson;