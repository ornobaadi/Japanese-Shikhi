import mongoose, { Schema, Document } from 'mongoose';

// Interface definitions for course management components
export interface IVideoLink {
  id: string;
  title: string;
  url: string;
  description: string;
  duration?: number; // in seconds
  videoType: 'youtube' | 'drive' | 'vimeo' | 'direct' | 'other';
  thumbnailUrl?: string;
  isPreview?: boolean; // Mark as free preview content
  createdAt: Date;
  updatedAt: Date;
}

export interface IDocumentFile {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileType: 'pdf' | 'doc' | 'docx' | 'txt' | 'other';
  fileSize?: number; // in bytes
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWeeklyContent {
  id: string;
  week: number;
  title?: string;
  description?: string;
  videoLinks: IVideoLink[];
  documents: IDocumentFile[];
  comments: string;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClassLink {
  id: string;
  title: string;
  meetingUrl: string;
  schedule: Date;
  description: string;
  duration?: number; // in minutes
  meetingId?: string;
  password?: string;
  platform: 'zoom' | 'google-meet' | 'teams' | 'other';
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number; // every N days/weeks/months
    endDate?: Date;
  };
  attendees?: string[]; // user IDs
  maxParticipants?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  authorId?: string; // user ID
  publishDate: Date;
  tags: string[];
  isPublished: boolean;
  featuredImage?: string;
  slug?: string;
  seoMetadata?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  readingTime?: number; // estimated reading time in minutes
  viewCount: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEnrolledStudent {
  id: string;
  userId: string; // reference to User model
  name: string;
  email: string;
  enrollmentDate: Date;
  progress: number; // 0-100 percentage
  status: 'active' | 'inactive' | 'suspended' | 'completed';
  lastAccessDate?: Date;
  completionDate?: Date;
  certificateIssued: boolean;
  certificateId?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'free';
  paymentId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourseManagement extends Document {
  courseId: mongoose.Types.ObjectId;
  courseName: string;
  weeklyContent: IWeeklyContent[];
  classLinks: IClassLink[];
  blogPosts: IBlogPost[];
  enrolledStudents: IEnrolledStudent[];
  settings: {
    allowStudentComments: boolean;
    autoPublishContent: boolean;
    requireInstructorApproval: boolean;
    emailNotifications: boolean;
    maxStudentsPerClass: number;
  };
  statistics: {
    totalVideos: number;
    totalDocuments: number;
    totalClasses: number;
    totalBlogs: number;
    totalStudents: number;
    averageProgress: number;
    lastUpdated: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schemas
const VideoLinkSchema = new Schema<IVideoLink>({
  id: { type: String, required: true },
  title: { type: String, required: true, maxlength: 200 },
  url: { 
    type: String, 
    required: true,
    validate: {
      validator: function(url: string) {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Invalid URL format'
    }
  },
  description: { type: String, maxlength: 500 },
  duration: { type: Number, min: 0 },
  videoType: {
    type: String,
    enum: ['youtube', 'drive', 'vimeo', 'direct', 'other'],
    default: 'other'
  },
  thumbnailUrl: { type: String },
  isPreview: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const DocumentFileSchema = new Schema<IDocumentFile>({
  id: { type: String, required: true },
  title: { type: String, required: true, maxlength: 200 },
  fileName: { type: String, required: true, maxlength: 255 },
  fileUrl: { 
    type: String, 
    required: true,
    validate: {
      validator: function(url: string) {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Invalid URL format'
    }
  },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'doc', 'docx', 'txt', 'other'],
    default: 'other'
  },
  fileSize: { type: Number, min: 0 },
  uploadedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const WeeklyContentSchema = new Schema<IWeeklyContent>({
  id: { type: String, required: true },
  week: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 52,
    index: true 
  },
  title: { type: String, maxlength: 200 },
  description: { type: String, maxlength: 1000 },
  videoLinks: [VideoLinkSchema],
  documents: [DocumentFileSchema],
  comments: { type: String, maxlength: 2000, default: '' },
  isPublished: { type: Boolean, default: false, index: true },
  publishedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ClassLinkSchema = new Schema<IClassLink>({
  id: { type: String, required: true },
  title: { type: String, required: true, maxlength: 200 },
  meetingUrl: { 
    type: String, 
    required: true,
    validate: {
      validator: function(url: string) {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Invalid URL format'
    }
  },
  schedule: { type: Date, required: true, index: true },
  description: { type: String, maxlength: 500 },
  duration: { type: Number, min: 1, max: 480 }, // max 8 hours
  meetingId: { type: String, maxlength: 100 },
  password: { type: String, maxlength: 50 },
  platform: {
    type: String,
    enum: ['zoom', 'google-meet', 'teams', 'other'],
    default: 'zoom'
  },
  isRecurring: { type: Boolean, default: false },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: function() { return this.isRecurring; }
    },
    interval: {
      type: Number,
      min: 1,
      max: 12,
      required: function() { return this.isRecurring; }
    },
    endDate: { type: Date }
  },
  attendees: [{ type: String }], // user IDs
  maxParticipants: { type: Number, min: 1, max: 1000 },
  isActive: { type: Boolean, default: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const BlogPostSchema = new Schema<IBlogPost>({
  id: { type: String, required: true },
  title: { type: String, required: true, maxlength: 200, index: true },
  content: { type: String, required: true, maxlength: 10000 },
  excerpt: { type: String, maxlength: 500 },
  author: { type: String, required: true, maxlength: 100 },
  authorId: { type: String, maxlength: 50 },
  publishDate: { type: Date, required: true, index: true },
  tags: {
    type: [String],
    validate: {
      validator: function(tags: string[]) {
        return tags.length <= 10;
      },
      message: 'Maximum 10 tags allowed'
    }
  },
  isPublished: { type: Boolean, default: false, index: true },
  featuredImage: { type: String },
  slug: { 
    type: String, 
    unique: true, 
    sparse: true,
    index: true 
  },
  seoMetadata: {
    metaTitle: { type: String, maxlength: 60 },
    metaDescription: { type: String, maxlength: 160 },
    keywords: [{ type: String, maxlength: 50 }]
  },
  readingTime: { type: Number, min: 1 },
  viewCount: { type: Number, default: 0, min: 0 },
  likes: { type: Number, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const EnrolledStudentSchema = new Schema<IEnrolledStudent>({
  id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true, maxlength: 100 },
  email: { 
    type: String, 
    required: true, 
    maxlength: 255,
    validate: {
      validator: function(email: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Invalid email format'
    },
    index: true
  },
  enrollmentDate: { type: Date, required: true, index: true },
  progress: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 100,
    default: 0 
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'suspended', 'completed'],
    default: 'active',
    index: true
  },
  lastAccessDate: { type: Date },
  completionDate: { type: Date },
  certificateIssued: { type: Boolean, default: false },
  certificateId: { type: String, maxlength: 100 },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'free'],
    default: 'pending',
    index: true
  },
  paymentId: { type: String, maxlength: 100 },
  notes: { type: String, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const CourseManagementSchema = new Schema<ICourseManagement>({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    unique: true,
    index: true
  },
  courseName: { 
    type: String, 
    required: true, 
    maxlength: 200 
  },
  weeklyContent: {
    type: [WeeklyContentSchema],
    default: []
  },
  classLinks: {
    type: [ClassLinkSchema],
    default: []
  },
  blogPosts: {
    type: [BlogPostSchema],
    default: []
  },
  enrolledStudents: {
    type: [EnrolledStudentSchema],
    default: []
  },
  settings: {
    allowStudentComments: { type: Boolean, default: true },
    autoPublishContent: { type: Boolean, default: false },
    requireInstructorApproval: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    maxStudentsPerClass: { type: Number, default: 50, min: 1, max: 1000 }
  },
  statistics: {
    totalVideos: { type: Number, default: 0, min: 0 },
    totalDocuments: { type: Number, default: 0, min: 0 },
    totalClasses: { type: Number, default: 0, min: 0 },
    totalBlogs: { type: Number, default: 0, min: 0 },
    totalStudents: { type: Number, default: 0, min: 0 },
    averageProgress: { type: Number, default: 0, min: 0, max: 100 },
    lastUpdated: { type: Date, default: Date.now }
  }
}, {
  timestamps: true,
  collection: 'coursemanagement'
});

// Indexes for better performance
CourseManagementSchema.index({ courseId: 1 });
CourseManagementSchema.index({ 'weeklyContent.week': 1 });
CourseManagementSchema.index({ 'classLinks.schedule': 1 });
CourseManagementSchema.index({ 'blogPosts.isPublished': 1, 'blogPosts.publishDate': -1 });
CourseManagementSchema.index({ 'enrolledStudents.status': 1 });

// Pre-save middleware to update statistics
CourseManagementSchema.pre('save', function(next) {
  const courseManagement = this as ICourseManagement;
  
  // Update statistics
  courseManagement.statistics.totalVideos = courseManagement.weeklyContent.reduce(
    (total, week) => total + week.videoLinks.length, 0
  );
  
  courseManagement.statistics.totalDocuments = courseManagement.weeklyContent.reduce(
    (total, week) => total + week.documents.length, 0
  );
  
  courseManagement.statistics.totalClasses = courseManagement.classLinks.length;
  courseManagement.statistics.totalBlogs = courseManagement.blogPosts.length;
  courseManagement.statistics.totalStudents = courseManagement.enrolledStudents.length;
  
  // Calculate average progress
  if (courseManagement.enrolledStudents.length > 0) {
    const totalProgress = courseManagement.enrolledStudents.reduce(
      (sum, student) => sum + student.progress, 0
    );
    courseManagement.statistics.averageProgress = Math.round(
      totalProgress / courseManagement.enrolledStudents.length
    );
  } else {
    courseManagement.statistics.averageProgress = 0;
  }
  
  courseManagement.statistics.lastUpdated = new Date();
  
  next();
});

// Export the model
const CourseManagement = mongoose.models.CourseManagement || 
  mongoose.model<ICourseManagement>('CourseManagement', CourseManagementSchema);

export default CourseManagement;

// Export additional types for use in other files
export type CourseManagementData = {
  courseId: string;
  courseName: string;
  weeklyContent: IWeeklyContent[];
  classLinks: IClassLink[];
  blogPosts: IBlogPost[];
  enrolledStudents: IEnrolledStudent[];
  settings?: {
    allowStudentComments?: boolean;
    autoPublishContent?: boolean;
    requireInstructorApproval?: boolean;
    emailNotifications?: boolean;
    maxStudentsPerClass?: number;
  };
  statistics?: {
    totalVideos?: number;
    totalDocuments?: number;
    totalClasses?: number;
    totalBlogs?: number;
    totalStudents?: number;
    averageProgress?: number;
    lastUpdated?: Date;
  };
};

export type CreateCourseManagementData = Omit<CourseManagementData, 'courseId'>;