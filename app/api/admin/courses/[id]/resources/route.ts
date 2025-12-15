import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/lib/models/Course';
import { auth } from '@clerk/nextjs/server';

// POST - Add a new resource to a module in a course
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const { moduleIndex, resource } = body;
    
    console.log('=== ADD RESOURCE API ===');
    console.log('Module index:', moduleIndex);
    console.log('Resource:', JSON.stringify(resource, null, 2));
    console.log('Resource attachments:', resource.attachments);
    
    if (typeof moduleIndex !== 'number' || !resource) {
      return NextResponse.json({ error: 'moduleIndex and resource are required' }, { status: 400 });
    }
    
    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    if (!course.curriculum?.modules?.[moduleIndex]) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }
    
    // Use native MongoDB driver to bypass Mongoose schema validation
    const db = Course.db;
    const collection = db.collection('courses');
    
    // Push resource directly to the items array
    const updateResult = await collection.updateOne(
      { _id: course._id },
      {
        $push: {
          [`curriculum.modules.${moduleIndex}.items`]: resource
        }
      }
    );
    
    console.log('Native MongoDB update result:', updateResult);
    
    if (updateResult.modifiedCount === 0) {
      console.error('Failed to add resource - no documents modified');
      return NextResponse.json({ error: 'Failed to add resource' }, { status: 500 });
    }
    
    // Fetch updated curriculum
    const updatedCourse = await Course.findById(id).lean();
    console.log('Verification - resource added with attachments:', 
      (updatedCourse as any)?.curriculum?.modules?.[moduleIndex]?.items?.slice(-1)?.[0]?.attachments);
    
    return NextResponse.json({ 
      success: true, 
      resource, 
      curriculum: (updatedCourse as any)?.curriculum 
    });
  } catch (error: any) {
    console.error('Error adding resource:', error);
    return NextResponse.json({ error: 'Failed to add resource', details: error.message }, { status: 500 });
  }
}
