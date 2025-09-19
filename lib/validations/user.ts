import { z } from 'zod';

// User preference validation schemas
export const learningGoalsSchema = z.array(
  z.enum(['travel', 'business', 'academic', 'culture', 'entertainment', 'conversation', 'reading', 'writing'])
);

export const userPreferencesSchema = z.object({
  learningGoals: learningGoalsSchema.optional(),
  dailyGoal: z.number().min(5).max(180).optional(),
  preferredLearningTime: z.enum(['morning', 'afternoon', 'evening', 'night']).optional(),
  language: z.string().min(2).max(5).optional(),
  timezone: z.string().optional(),
});

export const userNotificationsSchema = z.object({
  email: z.boolean().optional(),
  push: z.boolean().optional(),
  dailyReminder: z.boolean().optional(),
  streakReminder: z.boolean().optional(),
});

// User creation and update schemas
export const createUserSchema = z.object({
  clerkUserId: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().min(3).max(30).optional(),
  profileImageUrl: z.string().url().optional(),
});

export const updateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().min(3).max(30).optional(),
  profileImageUrl: z.string().url().optional(),
  currentLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  preferences: userPreferencesSchema.optional(),
  notifications: userNotificationsSchema.optional(),
});

// User progress tracking schemas
export const updateStreakSchema = z.object({
  action: z.enum(['increment', 'reset']),
});

export const addXPSchema = z.object({
  points: z.number().min(1).max(1000),
  source: z.string().optional(),
});

// Query schemas
export const getUserQuerySchema = z.object({
  clerkUserId: z.string().optional(),
  email: z.string().email().optional(),
}).refine(data => data.clerkUserId || data.email, {
  message: "Either clerkUserId or email must be provided",
});

export const getUsersQuerySchema = z.object({
  page: z.string().transform(Number).optional().default("1"),
  limit: z.string().transform(Number).optional().default("10"),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  subscription: z.enum(['free', 'premium', 'lifetime']).optional(),
  sortBy: z.enum(['createdAt', 'totalXP', 'streak']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Export types for use in API routes
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type UserNotifications = z.infer<typeof userNotificationsSchema>;
export type GetUserQuery = z.infer<typeof getUserQuerySchema>;
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;