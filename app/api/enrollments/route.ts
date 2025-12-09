import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import EnrollmentRequest from '@/lib/models/EnrollmentRequest';
import Course from '@/lib/models/Course';

// GET - Get user's enrollment requests
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const enrollments = await EnrollmentRequest.find({ userId })
      .sort({ submittedAt: -1 })
      .lean();

    return NextResponse.json({ 
      success: true, 
      data: enrollments 
    });
  } catch (error) {
    console.error('Error fetching enrollment requests:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch enrollment requests' 
    }, { status: 500 });
  }
}

// POST - Submit new enrollment request
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { 
      courseId, 
      paymentMethod, 
      transactionId, 
      senderNumber, 
      paymentScreenshot 
    } = body;

    // Validation
    if (!courseId || !paymentMethod || !transactionId || !senderNumber) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    await connectToDatabase();

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ 
        error: 'Course not found' 
      }, { status: 404 });
    }


    // Only block if there is a pending or approved request
    const existing = await EnrollmentRequest.findOne({
      userId,
      courseId,
      status: { $in: ['pending', 'approved'] }
    });
    if (existing) {
      if (existing.status === 'pending') {
        return NextResponse.json({
          error: 'You already have a pending enrollment request for this course'
        }, { status: 400 });
      }
      if (existing.status === 'approved') {
        return NextResponse.json({
          error: 'You are already enrolled in this course'
        }, { status: 400 });
      }
    }

    // Create enrollment request
    const enrollmentRequest = await EnrollmentRequest.create({
      userId,
      userEmail: user.emailAddresses[0]?.emailAddress || 'No email',
      userName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || 'User',
      courseId,
      courseName: course.title,
      coursePrice: course.discountedPrice || course.actualPrice || 0,
      paymentMethod,
      transactionId,
      senderNumber,
      paymentScreenshot,
      status: 'pending',
      submittedAt: new Date()
    });

    console.log('✅ Enrollment request created:', enrollmentRequest._id);

    return NextResponse.json({ 
      success: true, 
      message: 'Enrollment request submitted successfully. Admin will review your payment.',
      data: enrollmentRequest 
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating enrollment request:', error);
    return NextResponse.json({ 
      error: 'Failed to submit enrollment request' 
    }, { status: 500 });
  }
}
