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
      courses.forEach(c => { coursesById[String(c._id)] = c; });
      console.log('[me/courses] fetched courses:', courses.map(c => ({ id: String(c._id), title: c.title })));
    } else {
      console.log('[me/courses] no courseIds found');
    }

  // Fetch curriculum data for courses to get real meeting links
    const coursesWithCurriculum = await Course.find({ _id: { $in: courseIds } })
      .select('_id curriculum');
    
    const curriculumData: Record<string, any> = {};
    coursesWithCurriculum.forEach(course => {
      curriculumData[course._id.toString()] = course.curriculum;
    });

    // Helper function to find next live class from curriculum
    const findNextLiveClass = (curriculum: any) => {
      if (!curriculum?.modules) return null;
      
      const now = new Date();
      let nextClass = null;
      let closestTime = Infinity;
      
      for (const module of curriculum.modules) {
        if (!module.isPublished || !module.items) continue;
        
        for (const item of module.items) {
          if (item.type === 'live-class' && item.isPublished && item.meetingLink) {
            const classTime = new Date(item.scheduledDate);
            const timeDiff = classTime.getTime() - now.getTime();
            
            // Find the next upcoming class (or the most recent if all are past)
            if (timeDiff > 0 && timeDiff < closestTime) {
              closestTime = timeDiff;
              nextClass = {
                date: item.scheduledDate,
                meetingLink: item.meetingLink,
                title: item.title,
                meetingPlatform: item.meetingPlatform || 'google-meet'
              };
            }
          }
        }
      }
      
      return nextClass;
    };

  // Transform the data to match the expected format (defensive for empty)
    const sourceEnrollments: any[] = enrollmentArray;
    const enrolledCourses = sourceEnrollments.map((enrollment: any) => {
      const key = enrollment.courseId?.toString?.();
      const course = coursesById[key] || null;
      if (!course) {
        console.log('[me/courses] missing course data for enrollment courseId', key);
        return null;
      }

      // Get real next class from curriculum
      const curriculum = curriculumData[key];
      const nextClass = findNextLiveClass(curriculum);

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
        completedAt: enrollment.completedAt,
        certificateId: enrollment.certificateId,
        // Use real curriculum data for next class
        nextClass: nextClass,
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