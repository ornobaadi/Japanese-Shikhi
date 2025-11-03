import mongoose, { Schema, Document } from 'mongoose';

interface MCQOption {
  text: string;
  isCorrect: boolean;
}

interface MCQQuestion {
  question: string;
  options: MCQOption[];
  points: number;
  explanation?: string; // Shown after submission
}

interface QuizData {
  quizType: 'mcq' | 'open-ended';
  timeLimit?: number; // in minutes
  totalPoints: number;
  passingScore: number; // percentage
  allowMultipleAttempts: boolean;
  showAnswersAfterSubmission: boolean;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  // MCQ specific
  mcqQuestions?: MCQQuestion[];
  // Open-ended specific
  openEndedQuestion?: string;
  openEndedQuestionFile?: string; // PDF file path
  acceptFileUpload: boolean; // For open-ended answers
  acceptTextAnswer: boolean; // For open-ended answers
}

interface CurriculumItem {
  type: 'live-class' | 'announcement' | 'resource' | 'assignment' | 'quiz';
  title: string;
  description?: string;
  scheduledDate: Date;
  meetingLink?: string;
  meetingPlatform?: 'zoom' | 'google-meet' | 'other';
  duration?: number;
  resourceType?: 'pdf' | 'video' | 'youtube' | 'recording' | 'other';
  resourceUrl?: string;
  resourceFile?: string; // File path for uploaded files
  announcementType?: 'important' | 'cancellation' | 'general';
  validUntil?: Date;
  isPinned?: boolean;
  dueDate?: Date;
  quizData?: QuizData; // Quiz specific data
  isPublished: boolean;
  createdAt: Date;
}

interface Module {
  name: string;
  description: string;
  items: CurriculumItem[];
  isPublished: boolean;
  order: number;
}

export interface ICourse extends Document {
  title: string;
  titleJp?: string;
  description: string;
  descriptionJp?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: 'vocabulary' | 'grammar' | 'conversation' | 'reading' | 'writing' | 'culture' | 'kanji' | 'language';
  tags: string[];
  estimatedDuration: number; // in minutes
  difficulty: number; // 1-10 scale
  isPremium: boolean;
  isPublished: boolean;
  thumbnailUrl?: string;
  actualPrice?: number;
  discountedPrice?: number;
  enrollmentDeadline?: Date;
  instructorNotes?: string;
  learningObjectives: string[];
  links: string[];
  whatYoullLearn?: string;
  courseLessonModule?: string;
  lessons: mongoose.Types.ObjectId[];
  totalLessons: number;
  averageRating: number;
  totalRatings: number;
  enrolledStudents: number;
  completionRate: number;
  courseLanguage: {
    primary: string; // 'japanese'
    secondary: string; // 'english', 'bengali', etc.
  };
  curriculum: {
    modules: Module[];
  };
  metadata: {
    version: string;
    lastUpdated: Date;
    createdBy: string;
    approvedBy?: string;
  };
  advanced?: any; // Advanced course management data (videos, documents, etc.)
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  titleJp: {
    type: String,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  descriptionJp: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  category: {
    type: String,
    enum: ['vocabulary', 'grammar', 'conversation', 'reading', 'writing', 'culture', 'kanji', 'language'],
    required: false,  // Temporarily make optional to fix existing data
    default: 'language'
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(tags: string[]) {
        return tags.length <= 10;
      },
      message: 'Course cannot have more than 10 tags'
    }
  },
  estimatedDuration: {
    type: Number,
    required: true,
    min: 5,
    max: 600 // 10 hours max
  },
  difficulty: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  isPremium: {
    type: Boolean,
    default: false,
    index: true
  },
  isPublished: {
    type: Boolean,
    default: false,
    index: true
  },
  thumbnailUrl: String,
  actualPrice: {
    type: Number,
    min: 0,
    validate: {
      validator: function(price: number) {
        return !this.isPremium || price > 0;
      },
      message: 'Premium courses must have a price'
    }
  },
  discountedPrice: {
    type: Number,
    min: 0,
    validate: {
      validator: function(discountPrice: number) {
        return !this.actualPrice || discountPrice <= this.actualPrice;
      },
      message: 'Discounted price cannot be higher than actual price'
    }
  },
  enrollmentDeadline: {
    type: Date,
    validate: {
      validator: function(deadline: Date) {
        return !deadline || deadline > new Date();
      },
      message: 'Enrollment deadline must be in the future'
    }
  },
  instructorNotes: {
    type: String,
    maxlength: 1000
  },
  whatYoullLearn: {
    type: String,
    maxlength: 1000
  },
  courseLessonModule: {
    type: String,
    maxlength: 2000
  },
  learningObjectives: {
    type: [String],
    required: true,
    validate: {
      validator: function(objectives: string[]) {
        // Filter out empty strings and validate non-empty objectives
        const validObjectives = objectives.filter(obj => obj && obj.trim());
        return validObjectives.length >= 1 && validObjectives.length <= 10;
      },
      message: 'Course must have 1-10 learning objectives'
    }
  },
  links: {
    type: [String],
    default: [],
    validate: {
      validator: function(links: string[]) {
        return links.length <= 10;
      },
      message: 'Course cannot have more than 10 links'
    }
  },
  lessons: [{
    type: Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  totalLessons: {
    type: Number,
    default: 0,
    min: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0,
    min: 0
  },
  enrolledStudents: {
    type: Number,
    default: 0,
    min: 0
  },
  completionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  courseLanguage: {
    primary: {
      type: String,
      default: 'japanese'
    },
    secondary: {
      type: String,
      default: 'english'
    }
  },
  curriculum: {
    modules: [{
      name: {
        type: String,
        required: true
      },
      description: String,
      items: [{
        type: {
          type: String,
          enum: ['live-class', 'announcement', 'resource', 'assignment', 'quiz'],
          required: true
        },
        title: {
          type: String,
          required: true
        },
        description: String,
        scheduledDate: {
          type: Date,
          required: true
        },
        meetingLink: String,
        meetingPlatform: {
          type: String,
          enum: ['zoom', 'google-meet', 'other']
        },
        duration: Number,
        resourceType: {
          type: String,
          enum: ['pdf', 'video', 'youtube', 'recording', 'other']
        },
        resourceUrl: String,
        resourceFile: String,
        announcementType: {
          type: String,
          enum: ['important', 'cancellation', 'general']
        },
        validUntil: Date,
        isPinned: {
          type: Boolean,
          default: false
        },
        dueDate: Date,
        quizData: {
          quizType: {
            type: String,
            enum: ['mcq', 'open-ended']
          },
          timeLimit: Number,
          totalPoints: {
            type: Number,
            default: 0
          },
          passingScore: {
            type: Number,
            default: 60,
            min: 0,
            max: 100
          },
          allowMultipleAttempts: {
            type: Boolean,
            default: false
          },
          showAnswersAfterSubmission: {
            type: Boolean,
            default: true
          },
          randomizeQuestions: {
            type: Boolean,
            default: false
          },
          randomizeOptions: {
            type: Boolean,
            default: false
          },
          mcqQuestions: [{
            question: {
              type: String,
              required: function() { return this.quizType === 'mcq'; }
            },
            options: [{
              text: String,
              isCorrect: Boolean
            }],
            points: {
              type: Number,
              default: 1
            },
            explanation: String
          }],
          openEndedQuestion: String,
          openEndedQuestionFile: String,
          acceptFileUpload: {
            type: Boolean,
            default: true
          },
          acceptTextAnswer: {
            type: Boolean,
            default: true
          }
        },
        isPublished: {
          type: Boolean,
          default: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }],
      isPublished: {
        type: Boolean,
        default: false
      },
      order: {
        type: Number,
        required: true
      }
    }]
  },
  metadata: {
    version: {
      type: String,
      default: '1.0.0'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: String,
      required: true
    },
    approvedBy: String
  },
  // Advanced course management data
  advanced: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
CourseSchema.index({ level: 1, category: 1 });
CourseSchema.index({ isPremium: 1, isPublished: 1 });
CourseSchema.index({ tags: 1 });
CourseSchema.index({ difficulty: 1 });
CourseSchema.index({ averageRating: -1 });
CourseSchema.index({ enrolledStudents: -1 });
CourseSchema.index({ 'metadata.lastUpdated': -1 });

// Text search index temporarily disabled to isolate language field issue
// CourseSchema.index({
//   title: 'text',
//   description: 'text',
//   tags: 'text'
// }, { 
//   default_language: 'english',
//   language_override: 'indexLanguage'
// });

// Virtual for formatted duration
CourseSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.estimatedDuration / 60);
  const minutes = this.estimatedDuration % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

// Virtual for difficulty label
CourseSchema.virtual('difficultyLabel').get(function() {
  if (this.difficulty <= 3) return 'Easy';
  if (this.difficulty <= 6) return 'Medium';
  if (this.difficulty <= 8) return 'Hard';
  return 'Expert';
});

// Method to check if course is accessible to user
CourseSchema.methods.isAccessibleTo = function(user: any) {
  if (!this.isPublished) return false;
  if (!this.isPremium) return true;
  return user.hasActiveSubscription();
};

// Method to update completion rate
CourseSchema.methods.updateCompletionRate = async function() {
  // This would calculate based on user progress data
  // Implementation depends on UserProgress model
};

// Static method to find recommended courses
CourseSchema.statics.findRecommended = function(userLevel: string, userInterests: string[], limit = 10) {
  return this.find({
    isPublished: true,
    level: userLevel,
    category: { $in: userInterests }
  })
  .sort({ averageRating: -1, enrolledStudents: -1 })
  .limit(limit)
  .populate('lessons', 'title estimatedDuration');
};

// Pre-save hook to clean up arrays
CourseSchema.pre('save', function(next) {
  // Clean up learningObjectives - remove empty strings
  if (this.learningObjectives) {
    this.learningObjectives = this.learningObjectives.filter((obj: string) => obj && obj.trim());
  }
  
  // Clean up links - remove empty strings
  if (this.links) {
    this.links = this.links.filter((link: string) => link && link.trim());
  }
  
  next();
});

// Force model refresh - delete from both models and connection
if (mongoose.models.Course) {
  delete mongoose.models.Course;
}
if (mongoose.connection.models.Course) {
  delete mongoose.connection.models.Course;
}

export default mongoose.model<ICourse>('Course', CourseSchema);