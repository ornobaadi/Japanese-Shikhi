import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

// GET /api/users/admins - Get list of admin users (accessible to all authenticated users)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all users from Clerk
    const client = await clerkClient();
    const { data: users } = await client.users.getUserList({
      limit: 500 // Get up to 500 users
    });

    // Filter only admin users
    const admins = users
      .filter(user => (user.publicMetadata as any)?.role === 'admin')
      .map(user => ({
        id: user.id,
        clerkId: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Admin',
        email: user.emailAddresses[0]?.emailAddress || '',
        profilePicture: user.imageUrl || null,
        role: 'admin'
      }));

    return NextResponse.json({
      success: true,
      admins
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin contacts' },
      { status: 500 }
    );
  }
}
