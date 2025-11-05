import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import EnrollmentRequest from '@/lib/models/EnrollmentRequest';
import User from '@/lib/models/User';

// PATCH - Approve or reject enrollment request
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if admin - check both Clerk metadata and MongoDB
    const isAdmin = user.publicMetadata?.role === 'admin' || user.privateMetadata?.role === 'admin';
    if (!isAdmin) {
      // Also check MongoDB as fallback
      const dbUser = await User.findOne({ clerkUserId: user.id });
      if (!dbUser || dbUser.role !== 'admin') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    }

    await connectToDatabase();

    const { id } = await params;
    const body = await request.json();
    const { status, adminNotes, rejectionReason } = body;

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updateData: any = {
      status,
      reviewedBy: user.id,
      reviewedAt: new Date()
    };

    if (status === 'approved') {
      updateData.approvedBy = user.id;
      updateData.approvedAt = new Date();
      if (adminNotes) updateData.adminNotes = adminNotes;
    }

    if (status === 'rejected') {
      updateData.rejectionReason = rejectionReason || adminNotes || 'No reason provided';
    }

    const enrollmentRequest = await EnrollmentRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!enrollmentRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // If approved, add course to user's enrolled courses
    if (status === 'approved') {
      // First, ensure the user exists in MongoDB
      let dbUser = await User.findOne({ clerkUserId: enrollmentRequest.userId });
      
      if (!dbUser) {
        // Create user if doesn't exist
        dbUser = await User.create({
          clerkUserId: enrollmentRequest.userId,
          email: enrollmentRequest.userEmail,
          username: enrollmentRequest.userName,
          firstName: enrollmentRequest.userName.split(' ')[0],
          lastName: enrollmentRequest.userName.split(' ')[1] || '',
          nativeLanguage: 'Bengali',
          learningGoals: [],
          currentLevel: 'beginner',
          subscriptionStatus: 'free',
          learningStreak: 0,
          lastActiveDate: new Date(),
          totalStudyTime: 0,
          enrolledCourses: [],
          preferences: {
            dailyGoal: 30,
            notifications: true,
            preferredScript: 'hiragana',
            difficultyPreference: 'gradual'
          },
          statistics: {
            wordsLearned: 0,
            lessonsCompleted: 0,
            quizzesCompleted: 0,
            accuracyRate: 0
          }
        });
        console.log('✅ Created new user in MongoDB:', dbUser.clerkUserId);
      }

      // Now add the course to enrolled courses
      await User.findOneAndUpdate(
        { clerkUserId: enrollmentRequest.userId },
        { 
          $addToSet: { 
            enrolledCourses: {
              courseId: enrollmentRequest.courseId,
              enrolledAt: new Date(),
              progress: {
                completedLessons: 0,
                totalLessons: 0,
                progressPercentage: 0,
                lastAccessedAt: new Date()
              }
            }
          }
        }
      );
      console.log('✅ Added course to user enrolledCourses');
    }

    console.log(`✅ Enrollment ${status}:`, enrollmentRequest._id);

    return NextResponse.json({ 
      success: true, 
      message: `Enrollment ${status} successfully`,
      data: enrollmentRequest
    });
  } catch (error) {
    console.error('❌ Update enrollment error:', error);
    return NextResponse.json({ error: 'Failed to update enrollment' }, { status: 500 });
  }
}
