export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  vocabulary: Vocabulary[];
  grammar: GrammarPoint[];
  exercises: Exercise[];
}

export interface Vocabulary {
  id: string;
  word: string;
  hiragana: string;
  romaji: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
}

export interface GrammarPoint {
  id: string;
  title: string;
  description: string;
  structure: string;
  examples: {
    japanese: string;
    romaji: string;
    english: string;
  }[];
}

export interface Exercise {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'matching' | 'translation';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string; // e.g., "3 months", "6 weeks"
  price: number;
  currency: string;
  thumbnail?: string;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
  enrolledStudents: number;
  isActive: boolean;
}

const COURSES_STORAGE_KEY = 'japanese_courses';

export const courseStorage = {
  // Get all courses
  getAllCourses: (): Course[] => {
    try {
      const stored = localStorage.getItem(COURSES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading courses:', error);
      return [];
    }
  },

  // Get course by ID
  getCourseById: (id: string): Course | null => {
    const courses = courseStorage.getAllCourses();
    return courses.find(course => course.id === id) || null;
  },

  // Save new course
  saveCourse: (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Course => {
    try {
      const courses = courseStorage.getAllCourses();
      const newCourse: Course = {
        ...course,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      courses.push(newCourse);
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));
      return newCourse;
    } catch (error) {
      console.error('Error saving course:', error);
      throw new Error('Failed to save course');
    }
  },

  // Update existing course
  updateCourse: (id: string, updates: Partial<Course>): Course | null => {
    try {
      const courses = courseStorage.getAllCourses();
      const index = courses.findIndex(course => course.id === id);
      
      if (index === -1) return null;
      
      courses[index] = {
        ...courses[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));
      return courses[index];
    } catch (error) {
      console.error('Error updating course:', error);
      return null;
    }
  },

  // Delete course
  deleteCourse: (id: string): boolean => {
    try {
      const courses = courseStorage.getAllCourses();
      const filteredCourses = courses.filter(course => course.id !== id);
      
      if (filteredCourses.length === courses.length) return false;
      
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(filteredCourses));
      return true;
    } catch (error) {
      console.error('Error deleting course:', error);
      return false;
    }
  },

  // Get course statistics
  getCourseStats: () => {
    const courses = courseStorage.getAllCourses();
    return {
      totalCourses: courses.length,
      activeCourses: courses.filter(c => c.isActive).length,
      totalStudents: courses.reduce((sum, c) => sum + c.enrolledStudents, 0),
      totalRevenue: courses.reduce((sum, c) => sum + (c.price * c.enrolledStudents), 0),
      coursesByLevel: courses.reduce((acc, c) => {
        acc[c.level] = (acc[c.level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  },

  // Clear all courses (for development/testing)
  clearAllCourses: (): void => {
    localStorage.removeItem(COURSES_STORAGE_KEY);
  },
};

// Utility function to generate unique IDs
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Utility function to create empty lesson template
export const createEmptyLesson = (): Omit<Lesson, 'id'> => ({
  title: '',
  description: '',
  duration: 30,
  vocabulary: [],
  grammar: [],
  exercises: [],
});

// Utility function to create empty course template
export const createEmptyCourse = (): Omit<Course, 'id' | 'createdAt' | 'updatedAt'> => ({
  name: '',
  description: '',
  level: 'N5',
  duration: '',
  price: 0,
  currency: 'USD',
  lessons: [],
  enrolledStudents: 0,
  isActive: true,
});