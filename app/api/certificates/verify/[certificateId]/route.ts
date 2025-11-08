import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Course from '@/lib/models/Course';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const { certificateId } = await params;

    await connectDB();

    // Find user with this certificate ID
    const user = await User.findOne({
      'enrolledCourses.certificateId': certificateId,
    }).populate('enrolledCourses.courseId');

    if (!user) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Certificate not found' 
        },
        { status: 404 }
      );
    }

    // Find the specific enrollment with this certificate
    const enrollment = user.enrolledCourses.find(
      (ec: any) => ec.certificateId === certificateId
    );

    if (!enrollment) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Certificate not found' 
        },
        { status: 404 }
      );
    }

    const course = enrollment.courseId as any;

    return NextResponse.json({
      valid: true,
      certificate: {
        certificateId,
        studentName: user.fullName || user.username || user.email,
        courseName: course.title,
        completedAt: enrollment.completedAt,
        progressPercentage: enrollment.progress.progressPercentage,
      },
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return NextResponse.json(
      { 
        valid: false, 
        error: 'Failed to verify certificate' 
      },
      { status: 500 }
    );
  }
}
