import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import EnrollmentRequest from '@/lib/models/EnrollmentRequest';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

// GET - Get all enrollment requests (Admin only)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin check here
    // For now, allow all authenticated users

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const query: any = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }

    const enrollments = await EnrollmentRequest.find(query)
      .sort({ submittedAt: -1 })
      .lean();

    return NextResponse.json({ 
      success: true, 
      data: enrollments,
      count: enrollments.length
    });
  } catch (error) {
    console.error('Error fetching enrollment requests:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch enrollment requests' 
    }, { status: 500 });
  }
}

// PATCH - Approve or reject enrollment request
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin check here

    const body = await request.json();
    const { enrollmentId, action, rejectionReason } = body;

    if (!enrollmentId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ 
        error: 'Invalid request' 
      }, { status: 400 });
    }

    await connectToDatabase();

    const enrollment = await EnrollmentRequest.findById(enrollmentId);
    if (!enrollment) {
      return NextResponse.json({ 
        error: 'Enrollment request not found' 
      }, { status: 404 });
    }

    if (enrollment.status !== 'pending') {
      return NextResponse.json({ 
        error: 'This enrollment request has already been processed' 
      }, { status: 400 });
    }

    if (action === 'approve') {
      // Update enrollment status
      enrollment.status = 'approved';
      enrollment.approvedBy = userId;
      enrollment.approvedAt = new Date();
      await enrollment.save();

      // Add course to user's enrolled courses
      const user = await User.findOne({ clerkUserId: enrollment.userId });
      
      if (user) {
        const alreadyEnrolled = user.enrolledCourses.some(
          (ec: any) => ec.courseId.toString() === enrollment.courseId.toString()
        );

        if (!alreadyEnrolled) {
          user.enrolledCourses.push({
            courseId: enrollment.courseId,
            enrolledAt: new Date(),
            progress: {
              completedLessons: 0,
              totalLessons: 0,
              progressPercentage: 0,
              lastAccessedAt: new Date()
            }
          });
          await user.save();
          console.log('✅ User enrolled in course:', enrollment.courseName);
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Enrollment approved successfully',
        data: enrollment
      });

    } else if (action === 'reject') {
      enrollment.status = 'rejected';
      enrollment.approvedBy = userId;
      enrollment.approvedAt = new Date();
      enrollment.rejectionReason = rejectionReason || 'Payment verification failed';
      await enrollment.save();

      return NextResponse.json({ 
        success: true, 
        message: 'Enrollment rejected',
        data: enrollment
      });
    }

  } catch (error) {
    console.error('❌ Error processing enrollment:', error);
    return NextResponse.json({ 
      error: 'Failed to process enrollment request' 
    }, { status: 500 });
  }
}
