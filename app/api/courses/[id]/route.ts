import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/lib/models/Course';

// Next.js App Router will pass the dynamic params in the second argument
// Adjust to avoid warnings if signature expectations change between versions
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();

    const resolvedParams = await context.params;
    const courseId = resolvedParams?.id;
    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Course ID missing' },
        { status: 400 }
      );
    }

    const course = await Course.findById(courseId)
      .populate('lessons', 'title estimatedDuration type')
      .select('-instructorNotes -metadata.createdBy');

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Only return published courses (unless it's an admin request)
    if (!course.isPublished) {
      return NextResponse.json(
        { success: false, error: 'Course not available' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}