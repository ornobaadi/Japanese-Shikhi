import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Set current user as admin
    const user = await (await clerkClient()).users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'admin'
      }
    });

    return NextResponse.json({ 
      message: 'User set as admin successfully',
      email: user.emailAddresses[0]?.emailAddress,
      userId: userId
    });
  } catch (error) {
    console.error('Error setting admin role:', error);
    return NextResponse.json({ error: 'Failed to set admin role' }, { status: 500 });
  }
}