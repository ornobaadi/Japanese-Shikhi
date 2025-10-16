import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/lib/models/Course';
import Lesson from '@/lib/models/Lesson';
import User from '@/lib/models/User';
import { z } from 'zod';

const createCourseSchema = z.object({
  title: z.string().min(1).max(200),
  titleJp: z.string().max(200).optional(),
  description: z.string().min(1).max(2000),
  descriptionJp: z.string().max(2000).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  category: z.enum(['vocabulary', 'grammar', 'conversation', 'reading', 'writing', 'culture', 'kanji']),
  tags: z.array(z.string()).max(10).default([]),
  estimatedDuration: z.number().min(5).max(600),
  difficulty: z.number().min(1).max(10),
  isPremium: z.boolean().default(false),
  thumbnailUrl: z.string().url().optional(),
  actualPrice: z.number().min(0).optional(),
  discountedPrice: z.number().min(0).optional(),
  enrollmentDeadline: z.string().datetime().optional(),
  instructorNotes: z.string().max(1000).optional(),
  learningObjectives: z.array(z.string()).min(1).max(10),
  prerequisites: z.array(z.string()).default([]),
});

// GET /api/courses - return a list of courses (published)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const courses = await Course.find({ isPublished: true })
      .select('title description level estimatedDuration lessons learningObjectives rating enrolledStudents slug thumbnailUrl actualPrice discountedPrice enrollmentDeadline')
      .limit(50)
      .lean();

    return NextResponse.json({ success: true, data: courses }, { status: 200 });
  } catch (error) {
    console.error('GET /api/courses error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
