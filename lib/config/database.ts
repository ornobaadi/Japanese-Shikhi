import { z } from 'zod';

// Environment variables schema for validation
const envSchema = z.object({
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  MONGODB_DB: z.string().min(1, 'MONGODB_DB is required').default('japanese_shikhi'),
  MONGODB_MAX_POOL_SIZE: z.string().optional().default('10'),
  MONGODB_MIN_POOL_SIZE: z.string().optional().default('1'),
  MONGODB_MAX_IDLE_TIME_MS: z.string().optional().default('30000'),
  MONGODB_BUFFER_MAX_ENTRIES: z.string().optional().default('0'),
});

// Validate environment variables
const validateEnv = () => {
  try {
    return envSchema.parse({
      MONGODB_URI: process.env.MONGODB_URI,
      MONGODB_DB: process.env.MONGODB_DB,
      MONGODB_MAX_POOL_SIZE: process.env.MONGODB_MAX_POOL_SIZE,
      MONGODB_MIN_POOL_SIZE: process.env.MONGODB_MIN_POOL_SIZE,
      MONGODB_MAX_IDLE_TIME_MS: process.env.MONGODB_MAX_IDLE_TIME_MS,
      MONGODB_BUFFER_MAX_ENTRIES: process.env.MONGODB_BUFFER_MAX_ENTRIES,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Database configuration error:\n${errorMessages.join('\n')}`);
    }
    throw error;
  }
};

// Database configuration
export const dbConfig = {
  ...validateEnv(),

  // Connection options for Mongoose
  getConnectionOptions: () => ({
    bufferCommands: false,
    maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10'),
    minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '1'),
    maxIdleTimeMS: parseInt(process.env.MONGODB_MAX_IDLE_TIME_MS || '30000'),
    bufferMaxEntries: parseInt(process.env.MONGODB_BUFFER_MAX_ENTRIES || '0'),
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    retryWrites: true,
    w: 'majority' as const,
  }),

  // Collection names
  collections: {
    users: 'users',
    lessons: 'lessons',
    courses: 'courses',
    userProgress: 'user_progress',
    vocabulary: 'vocabulary',
    userVocabulary: 'user_vocabulary',
    quizzes: 'quizzes',
    quizAttempts: 'quiz_attempts',
    flashcards: 'flashcards',
    flashcardDecks: 'flashcard_decks',
    userSettings: 'user_settings',
    achievements: 'achievements',
    userAchievements: 'user_achievements',
  },

  // Database indexes for performance optimization
  indexes: {
    users: [
      { fields: { clerkUserId: 1 }, options: { unique: true } },
      { fields: { email: 1 }, options: { unique: true } },
      { fields: { createdAt: 1 } },
    ],
    userProgress: [
      { fields: { userId: 1, lessonId: 1 }, options: { unique: true } },
      { fields: { userId: 1, completedAt: 1 } },
      { fields: { lessonId: 1 } },
    ],
    vocabulary: [
      { fields: { hiragana: 1 } },
      { fields: { katakana: 1 } },
      { fields: { kanji: 1 } },
      { fields: { romaji: 1 } },
      { fields: { difficulty: 1 } },
    ],
    lessons: [
      { fields: { courseId: 1, order: 1 } },
      { fields: { difficulty: 1 } },
      { fields: { isPublished: 1 } },
    ],
  }
};

export default dbConfig;