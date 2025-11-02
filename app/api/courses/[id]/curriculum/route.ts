import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/lib/models/Course';
import { auth } from '@clerk/nextjs/server';

// GET /api/courses/[id]/curriculum - get curriculum with access control
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    await connectToDatabase();
    const { id } = await params;

    const course = await Course.findById(id).select('curriculum title isPublished allowFreePreview freePreviewCount enrolledStudents');

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if course is published
    if (!course.isPublished) {
      return NextResponse.json({ error: 'Course not available' }, { status: 403 });
    }

    // Check if user is enrolled (only if user is logged in)
    let isEnrolled = false;
    if (userId && course.enrolledStudents) {
      isEnrolled = course.enrolledStudents.some((student: any) => 
        student.userId && student.userId.toString() === userId
      );
    }

    // Initialize curriculum if it doesn't exist
    if (!course.curriculum) {
      return NextResponse.json({
        success: true,
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
    const filteredCurriculum = {
      modules: course.curriculum.modules
        .filter((module: any) => module.isPublished)
        .map((module: any) => ({
          ...module.toObject(),
          items: module.items
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