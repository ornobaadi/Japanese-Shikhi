import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/lib/models/Course';
import { auth } from '@clerk/nextjs/server';
import { ObjectId } from 'mongodb';

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

    // Use native MongoDB driver to avoid Mongoose schema casting issues
    const db = Course.db;
    const collection = db.collection('courses');
    
    const course = await collection.findOne({ _id: new ObjectId(id) }, { projection: { curriculum: 1 } });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Initialize curriculum if it doesn't exist
    if (!course.curriculum) {
      await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            curriculum: {
              modules: [{
                name: 'Module 1',
                description: '',
                items: [],
                isPublished: false,
                order: 0
              }]
            }
          }
        }
      );
      course.curriculum = {
        modules: [{
          name: 'Module 1',
          description: '',
          items: [],
          isPublished: false,
          order: 0
        }]
      };
    }

    console.log('GET /curriculum - Returning curriculum with attachments:', 
      JSON.stringify(course.curriculum, null, 2));

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
    console.log('PUT /api/admin/courses/[id]/curriculum route hit!');
  try {
    console.log('Starting auth check...');
    const { userId } = await auth();
    console.log('Auth result - userId:', userId);
    
    if (!userId) {
      console.error('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }    await connectToDatabase();
    const { id } = await params;
    
    console.log('Updating curriculum for course:', id);
    
    const body = await request.json();
    console.log('Request body received');

    // Log attachments specifically
    body.curriculum?.modules?.forEach((mod: any, modIdx: number) => {
      mod.items?.forEach((item: any, itemIdx: number) => {
        console.log(`Module ${modIdx} Item ${itemIdx} (${item.title}): attachments=${item.attachments?.length || 0}, driveLinks=${item.driveLinks?.length || 0}`);
        if (item.attachments && item.attachments.length > 0) {
          console.log('  Attachments:', JSON.stringify(item.attachments));
        }
      });
    });

    // Validate request body
    if (!body.curriculum) {
      console.error('Missing curriculum in request body');
      return NextResponse.json({ error: 'Missing curriculum data' }, { status: 400 });
    }

    if (!body.curriculum.modules || !Array.isArray(body.curriculum.modules)) {
      console.error('Invalid curriculum structure - modules must be an array');
      return NextResponse.json({ error: 'Invalid curriculum structure' }, { status: 400 });
    }

    const course = await Course.findById(id);

    if (!course) {
      console.error('Course not found:', id);
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    console.log('Found course:', course.title);
    console.log('Current course category:', course.category);
    console.log('Current metadata:', course.metadata);

    // DEBUG: Log the received curriculum before saving
    console.log('API DEBUG: Received curriculum:', JSON.stringify(body.curriculum, null, 2));

    // Use native MongoDB driver to bypass Mongoose schema casting completely
    const db = Course.db;
    const collection = db.collection('courses');

    // DEBUG: Log the update query
    console.log('API DEBUG: Update query:', {
      _id: course._id,
      curriculum: body.curriculum
    });

    const updateResult = await collection.updateOne(
      { _id: course._id },
      {
        $set: {
          curriculum: body.curriculum,
          'metadata.lastUpdated': new Date()
        }
      }
    );

    console.log('API DEBUG: Native MongoDB update result:', updateResult);

    if (updateResult.modifiedCount === 0 && updateResult.matchedCount === 0) {
      console.error('Failed to update course - no documents matched');
      return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
    }

    // Verify the save by reading back using native driver
    const verifiedCourse = await collection.findOne({ _id: course._id });
    console.log('API DEBUG: Verification - Full curriculum from DB:', 
      JSON.stringify(verifiedCourse?.curriculum, null, 2));
    
    // Check each module and item for attachments
    verifiedCourse?.curriculum?.modules?.forEach((mod: any, modIdx: number) => {
      mod.items?.forEach((item: any, itemIdx: number) => {
        if (item.attachments && item.attachments.length > 0) {
          console.log(`API DEBUG: Module ${modIdx} Item ${itemIdx} has ${item.attachments.length} attachments`);
        }
      });
    });

    return NextResponse.json({
      success: true,
      curriculum: verifiedCourse?.curriculum
    });
  } catch (error: any) {
    console.error('Error updating curriculum:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Failed to update curriculum', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// POST - Test route to verify API is reachable
export async function POST() {
  console.log('POST test route hit!');
  return NextResponse.json({ message: 'API route is working', timestamp: new Date().toISOString() });
}
