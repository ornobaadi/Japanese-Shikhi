import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/lib/models/Course';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  try {
    const { id } = await params;
    const course = await Course.findById(id).lean();
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    return NextResponse.json({ course });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log('📝 Updating course:', id);
    console.log('📦 Blog posts in update:', body.blogPosts?.length || 0);
    
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    console.log('✅ Course updated with', updatedCourse.blogPosts?.length || 0, 'blog posts');
    
    return NextResponse.json({ message: 'Course updated successfully', course: updatedCourse });
  } catch (error) {
    console.error('❌ Update error:', error);
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log('🔥 PATCH API called for course:', id);
    console.log('📦 Received data:', JSON.stringify(body, null, 2));
    
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    console.log('✅ Course updated with advanced data');
    return NextResponse.json({ message: 'Advanced course data saved successfully', course: updatedCourse });
  } catch (error) {
    console.error('❌ PATCH Error:', error);
    return NextResponse.json({ error: 'Failed to update course with advanced data' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  try {
    const { id } = await params;
    const result = await Course.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Course deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
