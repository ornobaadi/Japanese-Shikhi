import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/lib/models/Course';
import User from '@/lib/models/User';
import { auth, clerkClient } from '@clerk/nextjs/server';

// GET /api/courses/[id]/curriculum - get curriculum with access control
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    await connectToDatabase();
    const { id } = await params;

    const course = await Course.findById(id).select('curriculum title description isPublished allowFreePreview freePreviewCount enrolledStudents');

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if course is published
    if (!course.isPublished) {
      return NextResponse.json({ error: 'Course not available' }, { status: 403 });
    }

    // Check if user is admin
    let isAdmin = false;
    if (userId) {
      try {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(userId);
        isAdmin = clerkUser.publicMetadata?.role === 'admin';
      } catch (e) {
        console.error('Error checking admin status:', e);
      }
    }

    // Check if user is enrolled (only if user is logged in and not admin)
    let isEnrolled = false;
    if (userId && !isAdmin) {
      const user = await User.findOne({ clerkUserId: userId });
      if (user) {
        isEnrolled = user.enrolledCourses.some((ec: any) => 
          ec.courseId && ec.courseId.toString() === id
        );
      }
    }

    // Admins have full access
    if (isAdmin) {
      isEnrolled = true;
    }

    // Initialize curriculum if it doesn't exist
    if (!course.curriculum) {
      return NextResponse.json({
        success: true,
        title: course.title,
        description: course.description || '',
        curriculum: {
          modules: []
        },
        accessInfo: {
          isEnrolled,
          hasAccess: isEnrolled,
          canPreview: course.allowFreePreview,
          freePreviewCount: course.freePreviewCount || 0
        }
      });
    }

    // Filter content based on enrollment and free preview settings
    let itemCount = 0;
    // Ensure modules are in order
    const modules = Array.isArray(course.curriculum.modules)
      ? course.curriculum.modules.slice().sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
      : [];

    const filteredCurriculum = {
      modules: modules
        // Show module if it's published OR the user is enrolled OR the user is admin
        .filter((module: any) => (isEnrolled || isAdmin) ? true : module.isPublished)
        .map((module: any) => ({
          ...module.toObject(),
          items: (module.items || [])
            .filter((item: any) => item.isPublished)
            .map((item: any) => {
              itemCount++;
              const itemObj = item.toObject();

              // Determine if user has access to this item
              let hasAccess = false;
              if (isEnrolled) {
                // Enrolled users get full access
                hasAccess = true;
              } else if (course.allowFreePreview) {
                // Non-enrolled users get free preview access
                hasAccess = item.isFreePreview || itemCount <= (course.freePreviewCount || 2);
              }

              return {
                ...itemObj,
                hasAccess,
                isLocked: !hasAccess,
                requiresEnrollment: !hasAccess && !isEnrolled
              };
            })
        }))
    };

    return NextResponse.json({
      success: true,
      title: course.title,
      description: course.description || '',
      curriculum: filteredCurriculum,
      accessInfo: {
        isEnrolled,
        hasAccess: isEnrolled,
        canPreview: course.allowFreePreview,
        freePreviewCount: course.freePreviewCount || 0,
        isLoggedIn: !!userId
      }
    });
  } catch (error: any) {
    console.error('Error fetching curriculum:', error);
    return NextResponse.json(
      { error: 'Failed to fetch curriculum', details: error.message },
      { status: 500 }
    );
  }
}