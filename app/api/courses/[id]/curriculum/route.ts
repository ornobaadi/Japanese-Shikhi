import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/lib/models/Course';
import { auth } from '@clerk/nextjs/server';

// GET /api/courses/[id]/curriculum - get curriculum for enrolled students
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;

    const course = await Course.findById(id).select('curriculum title isPublished');

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if course is published or if user has access
    if (!course.isPublished) {
      return NextResponse.json({ error: 'Course not available' }, { status: 403 });
    }

    // Initialize curriculum if it doesn't exist
    if (!course.curriculum) {
      return NextResponse.json({
        success: true,
        curriculum: {
          modules: []
        }
      });
    }

    // Filter out unpublished content for students
    const filteredCurriculum = {
      modules: course.curriculum.modules
        .filter((module: any) => module.isPublished)
        .map((module: any) => ({
          ...module.toObject(),
          items: module.items.filter((item: any) => item.isPublished)
        }))
    };

    return NextResponse.json({
      success: true,
      curriculum: filteredCurriculum
    });
  } catch (error: any) {
    console.error('Error fetching curriculum:', error);
    return NextResponse.json(
      { error: 'Failed to fetch curriculum', details: error.message },
      { status: 500 }
    );
  }
}