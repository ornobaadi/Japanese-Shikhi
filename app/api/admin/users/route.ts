import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = (sessionClaims?.publicMetadata as any)?.role === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectToDatabase();

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    // Calculate total enrollments
    const enrollmentData = await User.aggregate([
      { $unwind: { path: '$enrolledCourses', preserveNullAndEmptyArrays: true } },
      { $group: { _id: null, totalEnrollments: { $sum: 1 } } }
    ]);

    const totalEnrollments = enrollmentData[0]?.totalEnrollments || 0;

    // Get recent users
    const recentUsers = await User.find()
      .select('clerkId firstName lastName email profilePicture createdAt lastLoginAt enrolledCourses')
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({
      total: totalUsers,
      activeUsers,
      totalEnrollments,
      recentUsers
    });
  } catch (error) {
    console.error('Error fetching admin user data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}