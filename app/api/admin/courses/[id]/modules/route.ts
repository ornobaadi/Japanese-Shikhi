import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/lib/models/Course';
import { auth } from '@clerk/nextjs/server';

// POST - Add a new module to a course
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Module name is required' }, { status: 400 });
    }
    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    // Default order is last
    const order = course.curriculum?.modules?.length || 0;
    const newModule = {
      name: body.name,
      description: body.description || '',
      items: [],
      isPublished: false,
      order,
    };
    course.curriculum.modules.push(newModule);
    await course.save();
    return NextResponse.json({ success: true, module: newModule, curriculum: course.curriculum });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to add module', details: error.message }, { status: 500 });
  }
}
