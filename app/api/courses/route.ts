import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/lib/models/Course';
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
  instructorNotes: z.string().max(1000).optional(),
  learningObjectives: z.array(z.string()).min(1).max(10),
  prerequisites: z.array(z.string()).default([]),
});

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const level = searchParams.get('level');
    const category = searchParams.get('category');
    const isPremium = searchParams.get('premium');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';

    const skip = (page - 1) * limit;

    let query: any = { isPublished: true };

    if (level) query.level = level;
    if (category) query.category = category;
    if (isPremium) query.isPremium = isPremium === 'true';

    if (search) {
      query.$text = { $search: search };
    }

    let sortOption: any = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'rating':
        sortOption = { averageRating: -1 };
        break;
      case 'popular':
        sortOption = { enrolledStudents: -1 };
        break;
      case 'difficulty':
        sortOption = { difficulty: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const courses = await Course.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .select('-instructorNotes -metadata.createdBy') // Hide sensitive fields
      .populate('lessons', 'title estimatedDuration');

    const total = await Course.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Check if user exists and has permission to create courses
    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // For now, only allow premium users to create courses
    // You can modify this logic based on your requirements
    if (!user.hasActiveSubscription()) {
      return NextResponse.json(
        { success: false, error: 'Premium subscription required to create courses' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createCourseSchema.parse(body);

    const course = new Course({
      ...validatedData,
      metadata: {
        version: '1.0.0',
        lastUpdated: new Date(),
        createdBy: userId,
      },
    });

    await course.save();

    return NextResponse.json(
      { success: true, data: course },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating course:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}