import { z } from 'zod';

// Course creation and update schemas
export const createCourseSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  thumbnail: z.string().url().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  category: z.enum(['hiragana', 'katakana', 'kanji', 'grammar', 'vocabulary', 'conversation', 'culture']),
  tags: z.array(z.string()).optional().default([]),
  estimatedDuration: z.number().min(1),
  order: z.number().min(0),
  isPremium: z.boolean().optional().default(false),
  createdBy: z.string().min(1),
});

export const updateCourseSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  thumbnail: z.string().url().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  category: z.enum(['hiragana', 'katakana', 'kanji', 'grammar', 'vocabulary', 'conversation', 'culture']).optional(),
  tags: z.array(z.string()).optional(),
  estimatedDuration: z.number().min(1).optional(),
  order: z.number().min(0).optional(),
  isPremium: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

// Course query schemas
export const getCoursesQuerySchema = z.object({
  page: z.string().transform(Number).optional().default(1),
  limit: z.string().transform(Number).optional().default(10),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  category: z.enum(['hiragana', 'katakana', 'kanji', 'grammar', 'vocabulary', 'conversation', 'culture']).optional(),
  isPremium: z.string().transform(val => val === 'true').optional(),
  isPublished: z.string().transform(val => val === 'true').optional().default(true),
  search: z.string().optional(),
  sortBy: z.enum(['title', 'difficulty', 'enrollmentCount', 'rating', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export const getCourseParamsSchema = z.object({
  slug: z.string().min(1),
});

// Course enrollment schema
export const enrollCourseSchema = z.object({
  userId: z.string().min(1),
});

// Course rating schema
export const rateCourseSchema = z.object({
  rating: z.number().min(1).max(5),
  userId: z.string().min(1),
  review: z.string().max(500).optional(),
});

// Export types for use in API routes
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type GetCoursesQuery = z.infer<typeof getCoursesQuerySchema>;
export type GetCourseParams = z.infer<typeof getCourseParamsSchema>;
export type EnrollCourseInput = z.infer<typeof enrollCourseSchema>;
export type RateCourseInput = z.infer<typeof rateCourseSchema>;