import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import EnrollmentRequest from '@/lib/models/EnrollmentRequest';
import User from '@/lib/models/User';

// DELETE - Unenroll student (remove from course)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if admin
    const isAdmin = user.publicMetadata?.role === 'admin' || user.privateMetadata?.role === 'admin';
    if (!isAdmin) {
      const dbUser = await User.findOne({ clerkUserId: user.id });
      if (!dbUser || dbUser.role !== 'admin') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    }

    await connectToDatabase();

    const { id } = await params;
    const body = await request.json();
    const { userId, courseId } = body;

    // Delete the enrollment request
    const enrollmentRequest = await EnrollmentRequest.findByIdAndDelete(id);

    if (!enrollmentRequest) {
      return NextResponse.json({ error: 'Enrollment request not found' }, { status: 404 });
    }

    // Remove course from user's enrolledCourses array
    const updateResult = await User.findOneAndUpdate(
      { clerkUserId: userId },
      { 
        $pull: { 
          enrolledCourses: { 
            courseId: courseId._id || courseId 
          } 
        } 
      },
      { new: true }
    );

    if (!updateResult) {
      console.log('⚠️ User not found in MongoDB, but enrollment request deleted');
    } else {
      console.log('✅ Removed course from user enrolledCourses');
    }

    console.log(`✅ Student unenrolled from course:`, enrollmentRequest._id);

    return NextResponse.json({ 
      success: true, 
      message: 'Student unenrolled successfully',
    });
  } catch (error) {
    console.error('❌ Unenroll error:', error);
    return NextResponse.json({ 
      error: 'Failed to unenroll student' 
    }, { status: 500 });
  }
}
