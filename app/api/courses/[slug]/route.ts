import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import { Course, Lesson } from '@/lib/models';
import { updateCourseSchema, type UpdateCourseInput } from '@/lib/validations/course';

// GET /api/courses/[slug] - Get course by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Connect to database
    await connectDB();

    const { slug } = params;

    // Find course by slug
    const course = await Course.findOne({ slug }).lean();

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Get lessons for this course
    const lessons = await Lesson.find({
      courseId: course._id,
      isPublished: true
    })
    .select('title slug description order duration difficulty xpReward')
    .sort({ order: 1 })
    .lean();

    return NextResponse.json({
      course: {
        ...course,
        lessons
      }
    });

  } catch (error) {
    console.error('GET /api/courses/[slug] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[slug] - Update course (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Check authentication
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    const { slug } = params;

    // Parse and validate request body
    const body = await request.json();
    const validatedData: UpdateCourseInput = updateCourseSchema.parse(body);

    // Find course
    const course = await Course.findOne({ slug });
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // TODO: Add admin check here
    // For now, allow any authenticated user to update

    // Update course
    Object.assign(course, validatedData);
    await course.save();

    return NextResponse.json({
      message: 'Course updated successfully',
      course: course
    });

  } catch (error) {
    console.error('PUT /api/courses/[slug] error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[slug] - Delete course (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Check authentication
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    const { slug } = params;

    // Find course
    const course = await Course.findOne({ slug });
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // TODO: Add admin check here
    // For now, allow any authenticated user to delete

    // Check if course has lessons
    const lessonsCount = await Lesson.countDocuments({ courseId: course._id });
    if (lessonsCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete course with existing lessons. Delete lessons first.' },
        { status: 400 }
      );
    }

    // Delete course
    await Course.findByIdAndDelete(course._id);

    return NextResponse.json({
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('DELETE /api/courses/[slug] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}