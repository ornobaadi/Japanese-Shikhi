import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();

    return NextResponse.json({
      userId,
      sessionClaims,
      publicMetadata: sessionClaims?.publicMetadata,
      userRole: (sessionClaims?.publicMetadata as any)?.role,
      isAdmin: (sessionClaims?.publicMetadata as any)?.role === 'admin'
    });
  } catch (error) {
    console.error('Error in test session:', error);
    return NextResponse.json(
      { error: 'Failed to get session data' },
      { status: 500 }
    );
  }
}