import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

// POST /api/admin/users/make-admin - Make a user an admin
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user is admin
    const currentUser = await (await clerkClient()).users.getUser(userId);
    const isAdmin = (currentUser.publicMetadata as any)?.role === 'admin';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Only admins can make other users admin' }, { status: 403 });
    }

    // Get target user ID from request
    const { targetUserId } = await request.json();

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID required' }, { status: 400 });
    }

    // Update user's publicMetadata to make them admin
    const client = await clerkClient();
    await client.users.updateUserMetadata(targetUserId, {
      publicMetadata: {
        role: 'admin'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'User successfully made admin'
    });
  } catch (error) {
    console.error('Error making user admin:', error);
    return NextResponse.json(
      { error: 'Failed to make user admin' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/make-admin - Remove admin role from a user
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user is admin
    const currentUser = await (await clerkClient()).users.getUser(userId);
    const isAdmin = (currentUser.publicMetadata as any)?.role === 'admin';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Only admins can remove admin role' }, { status: 403 });
    }

    // Get target user ID from request
    const { targetUserId } = await request.json();

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID required' }, { status: 400 });
    }

    // Prevent removing admin role from yourself
    if (targetUserId === userId) {
      return NextResponse.json({ error: 'Cannot remove admin role from yourself' }, { status: 400 });
    }

    // Update user's publicMetadata to remove admin role
    const client = await clerkClient();
    await client.users.updateUserMetadata(targetUserId, {
      publicMetadata: {
        role: 'student'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Admin role removed successfully'
    });
  } catch (error) {
    console.error('Error removing admin role:', error);
    return NextResponse.json(
      { error: 'Failed to remove admin role' },
      { status: 500 }
    );
  }
}
