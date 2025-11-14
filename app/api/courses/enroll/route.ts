import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getOrCreateUserFromClerk } from '@/lib/clerk/user-sync';
import Course from '@/lib/models/Course';
import { z } from 'zod';
import mongoose from 'mongoose';

const DEFAULT_COURSE_PRICE_BDT = 999; // Fallback price when no pricing defined

const enrollSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  // paymentData from client is optional & only advisory; server recalculates authoritative price
  paymentData: z.object({
    amount: z.number().min(0).optional(),
    transactionId: z.string().optional(),
    paymentMethod: z.string().optional()
  }).optional()
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
  const { courseId, paymentData } = enrollSchema.parse(body);

    // Ensure user exists (auto-provision if missing)
    let user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      try {
        const c = await clerkClient();
        const clerkUser = await c.users.getUser(userId);
        user = await getOrCreateUserFromClerk(userId, {
          id: clerkUser.id,
          email_addresses: clerkUser.emailAddresses.map((e: any) => ({ email_address: e.emailAddress })),
          first_name: clerkUser.firstName || undefined,
          last_name: clerkUser.lastName || undefined,
          username: clerkUser.username || undefined,
          image_url: clerkUser.imageUrl || undefined,
          created_at: new Date(clerkUser.createdAt).getTime(),
          updated_at: new Date(clerkUser.updatedAt).getTime()
        });
      } catch (e) {
        return NextResponse.json(
          { success: false, error: 'User not found and could not be created' },
          { status: 404 }
        );
      }
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Defensive: ensure enrolledCourses array exists
    if (!Array.isArray((user as any).enrolledCourses)) {
      (user as any).enrolledCourses = [];
    }

    // Check if user is already enrolled in this course
    const isAlreadyEnrolled = (user as any).enrolledCourses.some(
      (enrollment: any) => enrollment.courseId.toString() === courseId
    );

  // Server authoritative pricing with fallback default (BDT)
  const serverPrice = (course.discountedPrice ?? course.actualPrice ?? DEFAULT_COURSE_PRICE_BDT);

    if (isAlreadyEnrolled) {
      return NextResponse.json({
        success: true,
        alreadyEnrolled: true,
        message: 'User already enrolled in this course',
        data: {
          courseId: course._id,
          courseName: course.title,
          price: serverPrice
        }
      });
    }

    // Atomic enrollment write to prevent duplicate & guarantee persistence
    const enrollmentDoc = {
      courseId: course._id instanceof mongoose.Types.ObjectId ? course._id : new mongoose.Types.ObjectId(String(course._id)),
      enrolledAt: new Date(),
      progress: {
        completedLessons: 0,
        totalLessons: course.totalLessons || 0,
        progressPercentage: 0,
        lastAccessedAt: new Date(),
      },
    };

    const updateResult = await User.updateOne(
      { clerkUserId: userId, 'enrolledCourses.courseId': { $ne: course._id } },
      { $push: { enrolledCourses: enrollmentDoc } }
    );

    let actuallyInserted = false;
    if (updateResult.modifiedCount === 1) {
      actuallyInserted = true;
      await Course.updateOne({ _id: course._id }, { $inc: { enrolledStudents: 1 } });
    }

    // Read back enrollments for verification (debug)
  const postUser = await User.findOne({ clerkUserId: userId }).select('enrolledCourses');
    console.log('[enroll] updateResult', updateResult, 'postUser.enrolledCourses:', postUser?.enrolledCourses?.map((e:any)=>e.courseId?.toString()));

    // TODO: In a real application, you would:
    // 1. Validate the payment with your payment processor
    // 2. Store payment transaction details
    // 3. Send confirmation email
    // 4. Handle payment failures

    console.log('Course enrollment successful:', {
      userId: user._id,
      courseId,
      courseName: course.title,
      clientPaymentData: paymentData,
      serverPrice,
      inserted: actuallyInserted,
      enrolledAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully enrolled in course',
      alreadyEnrolled: !actuallyInserted,
      data: {
        courseId,
        courseName: course.title,
        enrolledAt: new Date(),
        price: serverPrice
      },
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: (error as any).issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}