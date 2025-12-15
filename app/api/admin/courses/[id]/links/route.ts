import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/lib/models/Course';
import { auth } from '@clerk/nextjs/server';

// POST - Add a new link to a module in a course
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const { moduleIndex, linkItem } = body;
    if (typeof moduleIndex !== 'number' || !linkItem) {
      return NextResponse.json({ error: 'moduleIndex and linkItem are required' }, { status: 400 });
    }
    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    if (!course.curriculum?.modules?.[moduleIndex]) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }
    // Add link as a curriculum item
    course.curriculum.modules[moduleIndex].items.push(linkItem);
    await course.save();
    return NextResponse.json({ success: true, link: linkItem, curriculum: course.curriculum });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to add link', details: error.message }, { status: 500 });
  }
}
