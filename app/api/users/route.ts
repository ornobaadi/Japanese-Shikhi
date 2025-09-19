import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import { z } from 'zod';

const createUserSchema = z.object({
  clerkUserId: z.string().min(1),
  email: z.string().email(),
  username: z.string().min(3).max(30).optional(),
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  profileImageUrl: z.string().url().optional(),
  nativeLanguage: z.string().default('English'),
  learningGoals: z.array(z.string()).default([]),
  currentLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
});

const updateUserSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  profileImageUrl: z.string().url().optional(),
  nativeLanguage: z.string().optional(),
  learningGoals: z.array(z.string()).optional(),
  currentLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  preferences: z.object({
    dailyGoal: z.number().min(5).max(120).optional(),
    notifications: z.boolean().optional(),
    preferredScript: z.enum(['hiragana', 'katakana', 'kanji', 'romaji']).optional(),
    difficultyPreference: z.enum(['gradual', 'challenging']).optional(),
  }).optional(),
});

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const level = searchParams.get('level');
    const subscription = searchParams.get('subscription');

    const skip = (page - 1) * limit;

    let query: any = {};
    if (level) query.currentLevel = level;
    if (subscription) query.subscriptionStatus = subscription;

    const users = await User.find(query)
      .select('-clerkUserId') // Don't expose Clerk IDs in public API
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { clerkUserId: validatedData.clerkUserId },
        { email: validatedData.email }
      ]
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 409 }
      );
    }

    const user = new User(validatedData);
    await user.save();

    // Remove sensitive data from response
    const responseUser = user.toObject();
    delete responseUser.clerkUserId;

    return NextResponse.json(
      { success: true, data: responseUser },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}