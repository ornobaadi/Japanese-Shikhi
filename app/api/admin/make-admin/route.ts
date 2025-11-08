import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';

// Make a user admin by email or make current user admin
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Try to get email from request body
    let targetEmail = null;
    try {
      const body = await request.json();
      targetEmail = body.email;
    } catch {
      // No body, will use current user
    }

    let user;
    
    if (targetEmail) {
      // Make specific user admin by email
      user = await User.findOne({ email: targetEmail });
      
      if (!user) {
        return NextResponse.json({ 
          error: `User with email ${targetEmail} not found` 
        }, { status: 404 });
      }
    } else {
      // Make current user admin
      user = await User.findOne({ clerkUserId: userId });
      
      if (!user) {
        return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
      }
    }

    // Make user admin
    user.subscriptionStatus = 'lifetime';
    await user.save();

    return NextResponse.json({
      success: true,
      message: targetEmail 
        ? `${targetEmail} is now an admin!`
        : 'You are now an admin!',
      user: {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        subscriptionStatus: user.subscriptionStatus
      }
    });

  } catch (error) {
    console.error('Error making admin:', error);
    return NextResponse.json(
      { error: 'Failed to make admin', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Get admin status
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkUserId: userId });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      isAdmin: user.subscriptionStatus === 'lifetime',
      email: user.email,
      subscriptionStatus: user.subscriptionStatus
    });

  } catch (error) {
    console.error('Error checking admin:', error);
    return NextResponse.json(
      { error: 'Failed to check admin status' },
      { status: 500 }
    );
  }
}
