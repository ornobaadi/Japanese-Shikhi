import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin by fetching user data directly
    try {
      const user = await (await clerkClient()).users.getUser(userId);
      const isAdmin = (user.publicMetadata as any)?.role === 'admin';
      
      if (!isAdmin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    } catch (error) {
      console.error('Error fetching user data in API:', error);
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

    // Get all users with pagination (default to first 100)
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = (page - 1) * limit;

    // Get users with complete information
    const allUsers = await User.find()
      .select('clerkUserId firstName lastName email profilePicture createdAt lastLoginAt enrolledCourses statistics')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Fetch Clerk data for admin status and additional info
    const client = await clerkClient();
    const usersWithClerkData = await Promise.all(
      allUsers.map(async (user) => {
        try {
          const clerkUser = await client.users.getUser(user.clerkUserId);
          const isAdmin = (clerkUser.publicMetadata as any)?.role === 'admin';
          
          return {
            id: user._id.toString(),
            clerkId: user.clerkUserId,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
            email: user.email || clerkUser.emailAddresses[0]?.emailAddress || 'No email',
            profilePicture: user.profilePicture || clerkUser.imageUrl,
            isActive: user.lastLoginAt && user.lastLoginAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            isPremium: false, // You can implement premium logic here
            isAdmin: isAdmin,
            role: isAdmin ? 'admin' : 'student',
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
            enrolledCourses: user.enrolledCourses || [],
            totalSpent: 0, // You can implement payment tracking here
            coursesEnrolled: user.enrolledCourses?.length || 0,
            statistics: user.statistics
          };
        } catch (error) {
          console.error(`Error fetching Clerk data for user ${user.clerkUserId}:`, error);
          return {
            id: user._id.toString(),
            clerkId: user.clerkUserId,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
            email: user.email || 'No email',
            profilePicture: user.profilePicture,
            isActive: user.lastLoginAt && user.lastLoginAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            isPremium: false,
            isAdmin: false,
            role: 'student',
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
            enrolledCourses: user.enrolledCourses || [],
            totalSpent: 0,
            coursesEnrolled: user.enrolledCourses?.length || 0,
            statistics: user.statistics
          };
        }
      })
    );

    // Calculate premium users (you can update this logic based on your premium system)
    const premiumUsers = usersWithClerkData.filter(user => user.isPremium).length;
    const totalRevenue = usersWithClerkData.reduce((sum, user) => sum + user.totalSpent, 0);

    return NextResponse.json({
      users: usersWithClerkData,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit)
      },
      stats: {
        total: totalUsers,
        activeUsers,
        premiumUsers,
        totalRevenue,
        totalEnrollments
      },
      // Keep legacy format for backward compatibility
      total: totalUsers,
      activeUsers,
      totalEnrollments,
      recentUsers: usersWithClerkData.slice(0, 10)
    });
  } catch (error) {
    console.error('Error fetching admin user data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}