import { NextRequest, NextResponse } from 'next/server';
import { Assignment, Course, connectDB } from '@/lib/models';
import { auth } from '@clerk/nextjs/server';

// POST /api/courses/[slug]/assignments - Create a new assignment
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    console.log('Assignment API - slug:', params.slug);
    
    // Check authentication
    const { userId } = await auth();
    console.log('Assignment API - userId:', userId);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();
    console.log('Assignment API - DB connected');

    // Verify course exists by slug (or fallback to id if slug is actually an id)
    let course = await Course.findOne({ slug: params.slug });
    if (!course) {
      try {
        // If params.slug is an ObjectId string, try findById
        course = await Course.findById(params.slug);
      } catch (e) {
        // ignore
      }
    }
    console.log('Assignment API - Course found:', !!course);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    console.log('Assignment API - Request body:', body);
    const { week, title, instructions, dueDate, points, attachments } = body;

    // Validate required fields
    if (!title || !week) {
      return NextResponse.json(
        { error: 'Title and week are required' },
        { status: 400 }
      );
    }

    // Create assignment
    const assignment = new Assignment({
      courseId: course._id,
      week,
      title,
      instructions,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      points: points || 100,
      attachments: attachments || []
    });

    console.log('Assignment API - Saving assignment...');
    await assignment.save();
    console.log('Assignment API - Assignment saved successfully');

    return NextResponse.json({
      success: true,
      message: 'Assignment created successfully',
      data: assignment
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating assignment:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationErrors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/courses/[slug]/assignments - Get all assignments for a course
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Get week filter from query params
    const searchParams = request.nextUrl.searchParams;
    const week = searchParams.get('week');

    // Find the course by slug (or fallback to id if slug is actually an id)
    let course = await Course.findOne({ slug: params.slug });
    if (!course) {
      try {
        // If params.slug is an ObjectId string, try findById
        course = await Course.findById(params.slug);
      } catch (e) {
        // ignore
      }
    }
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Build query
    const query: any = { courseId: course._id };
    if (week) {
      query.week = parseInt(week);
    }

    // Fetch assignments
    const assignments = await Assignment.find(query)
      .sort({ week: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: assignments
    });

  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
