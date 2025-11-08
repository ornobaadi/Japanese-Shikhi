import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Course from '@/lib/models/Course';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Find the enrollment
    const enrollment = user.enrolledCourses.find(
      (ec: any) => ec.courseId.toString() === id
    );

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 });
    }

    // Mark as completed
    if (enrollment.progress.progressPercentage >= 100 && !enrollment.completedAt) {
      enrollment.completedAt = new Date();
      await user.save();

      return NextResponse.json({
        success: true,
        message: 'Course marked as completed',
        completedAt: enrollment.completedAt,
      });
    }

    if (enrollment.completedAt) {
      return NextResponse.json({
        success: true,
        message: 'Course already completed',
        completedAt: enrollment.completedAt,
      });
    }

    return NextResponse.json(
      {
        error: 'Course not yet completed',
        progress: enrollment.progress.progressPercentage
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error marking course as complete:', error);
    return NextResponse.json(
      { error: 'Failed to mark course as complete' },
      { status: 500 }
    );
  }
}
