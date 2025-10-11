// Model exports for easy importing
export { default as User, type IUser } from './User';
export { default as Course, type ICourse } from './Course';
export { default as Lesson, type ILesson, type IContentBlock, type ILessonObjective } from './Lesson';
export { default as Vocabulary, type IVocabulary } from './Vocabulary';
export { default as UserProgress, type IUserProgress } from './UserProgress';
export { default as Assignment, type IAssignment } from './Assignment';
export { 
  default as CourseManagement, 
  type ICourseManagement,
  type IVideoLink,
  type IDocumentFile,
  type IWeeklyContent,
  type IClassLink,
  type IBlogPost,
  type IEnrolledStudent,
  type CourseManagementData,
  type CreateCourseManagementData
} from './CourseManagement';

// Database connection
export { default as connectDB } from '@/lib/mongodb';

// Re-export common types for convenience
export type { Document, Model, Types } from 'mongoose';