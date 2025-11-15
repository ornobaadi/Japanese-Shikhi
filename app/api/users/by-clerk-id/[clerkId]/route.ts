import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';

// GET /api/users/by-clerk-id/[clerkId] - Get user by Clerk ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ clerkId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { clerkId } = await context.params;
    const user = await User.findOne({ clerkUserId: clerkId });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return only necessary user info (not sensitive data)
    return NextResponse.json({
      clerkUserId: user.clerkUserId,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
    });
  } catch (error) {
    console.error('Error fetching user by Clerk ID:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
