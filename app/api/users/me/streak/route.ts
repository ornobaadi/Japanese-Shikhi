import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models';
import { updateStreakSchema } from '@/lib/validations/user';

// POST /api/users/me/streak - Update user streak
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateStreakSchema.parse(body);

    // Find user
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update streak based on action
    if (validatedData.action === 'increment') {
      await user.updateStreak();
    } else if (validatedData.action === 'reset') {
      user.streak = 0;
      user.lastActivityDate = new Date();
      await user.save();
    }

    // Return updated user data
    const userResponse = user.toObject();
    delete userResponse.clerkUserId;

    return NextResponse.json({
      message: `Streak ${validatedData.action === 'increment' ? 'updated' : 'reset'} successfully`,
      user: userResponse,
      currentStreak: user.streak
    });

  } catch (error) {
    console.error('POST /api/users/me/streak error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}