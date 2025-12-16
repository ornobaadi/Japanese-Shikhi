import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import { auth, clerkClient } from '@clerk/nextjs/server';

// DELETE /api/admin/users/delete
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow admins
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    if (clerkUser.publicMetadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { targetUserId } = await request.json();
    if (!targetUserId) {
      return NextResponse.json({ error: 'Missing targetUserId' }, { status: 400 });
    }

    await connectToDatabase();
    // Remove from Clerk
    await client.users.deleteUser(targetUserId);
    // Remove from local DB
    await User.deleteOne({ clerkUserId: targetUserId });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete user' }, { status: 500 });
  }
}
