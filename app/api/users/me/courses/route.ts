import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getOrCreateUserFromClerk } from '@/lib/clerk/user-sync';
import Course from '@/lib/models/Course';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

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

    // Re-fetch plain user document (no populate) to avoid strictPopulate errors
    user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const enrollmentArray: any[] = Array.isArray((user as any).enrolledCourses) ? (user as any).enrolledCourses : [];
    const courseIds = enrollmentArray.map((e: any) => e.courseId).filter(Boolean);
    const coursesById: Record<string, any> = {};
    console.log('[me/courses] enrollments raw:', JSON.stringify(enrollmentArray.map(e=>({courseId:e.courseId, enrolledAt:e.enrolledAt})), null, 2));
    if (courseIds.length) {
      const courses = await Course.find({ _id: { $in: courseIds } })
        .select('title description level category estimatedDuration thumbnailUrl totalLessons enrolledStudents averageRating totalRatings');
      courses.forEach(c => { coursesById[c._id.toString()] = c; });
      console.log('[me/courses] fetched courses:', courses.map(c => ({ id: c._id.toString(), title: c.title })));
    } else {
      console.log('[me/courses] no courseIds found');
    }

  // Transform the data to match the expected format (defensive for empty)
    const sourceEnrollments: any[] = enrollmentArray;
    const enrolledCourses = sourceEnrollments.map((enrollment: any) => {
      const key = enrollment.courseId?.toString?.();
      const course = coursesById[key] || null;
      if (!course) {
        console.log('[me/courses] missing course data for enrollment courseId', key);
        return null;
      }

      return {
        _id: course._id,
        title: course.title,
        description: course.description,
        level: course.level,
        category: course.category,
        estimatedDuration: course.estimatedDuration,
        enrolledStudents: course.enrolledStudents,
        totalLessons: course.totalLessons,
        thumbnailUrl: course.thumbnailUrl,
        averageRating: course.averageRating || 0,
        totalRatings: course.totalRatings || 0,
        enrolledAt: enrollment.enrolledAt,
        progress: {
          completedLessons: enrollment.progress.completedLessons,
          progressPercentage: enrollment.progress.progressPercentage,
          lastAccessedAt: enrollment.progress.lastAccessedAt,
        },
        // Add mock next class data for demo (in real app, this would come from a separate collection)
        nextClass: enrollment.progress.progressPercentage < 100 ? {
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
          meetingLink: `https://meet.example.com/course-${course._id}`,
          title: `${course.title} - Next Lesson`,
        } : null,
      };
    }).filter(Boolean); // Remove null entries

    return NextResponse.json({
      success: true,
      data: enrolledCourses,
    });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}