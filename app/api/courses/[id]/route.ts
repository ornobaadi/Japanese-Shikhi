import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/lib/models/Course';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const course = await Course.findById(params.id)
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