import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/lib/models/Course';
import { auth } from '@clerk/nextjs/server';

// GET - Fetch curriculum for a course
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

    const course = await Course.findById(id).select('curriculum');

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Initialize curriculum if it doesn't exist
    if (!course.curriculum) {
      course.curriculum = {
        modules: [{
          name: 'Module 1',
          description: '',
          items: [],
          isPublished: false,
          order: 0
        }]
      };
      await course.save();
    }

    return NextResponse.json({
      success: true,
      curriculum: course.curriculum
    });
  } catch (error: any) {
    console.error('Error fetching curriculum:', error);
    return NextResponse.json(
      { error: 'Failed to fetch curriculum', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update entire curriculum
export async function PUT(
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
    const body = await request.json();

    const course = await Course.findById(id);

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    course.curriculum = body.curriculum;
    course.metadata.lastUpdated = new Date();

    await course.save();

    return NextResponse.json({
      success: true,
      curriculum: course.curriculum
    });
  } catch (error: any) {
    console.error('Error updating curriculum:', error);
    return NextResponse.json(
      { error: 'Failed to update curriculum', details: error.message },
      { status: 500 }
    );
  }
}
