import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import { z } from 'zod';

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
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove sensitive data from response
    const responseUser = user.toObject();
    delete responseUser.clerkUserId;

    return NextResponse.json({
      success: true,
      data: responseUser,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user data
    Object.keys(validatedData).forEach(key => {
      if (key === 'preferences' && validatedData.preferences) {
        user.preferences = { ...user.preferences, ...validatedData.preferences };
      } else {
        (user as any)[key] = (validatedData as any)[key];
      }
    });

    await user.save();

    // Remove sensitive data from response
    const responseUser = user.toObject();
    delete responseUser.clerkUserId;

    return NextResponse.json({
      success: true,
      data: responseUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const user = await User.findOneAndDelete({ clerkUserId: userId });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User account deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user account:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}