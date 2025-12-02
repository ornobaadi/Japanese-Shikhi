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
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Course updated successfully', course: updatedCourse });
  } catch (error) {
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
    
    // If this is advanced course management data (containing weeklyContent, classLinks, etc.)
    // we need to save it to the CourseManagement collection instead
    const hasAdvancedFields = body.weeklyContent || body.classLinks || body.blogPosts || body.enrolledStudents;
    
    if (hasAdvancedFields) {
      // Import CourseManagement model
      const { CourseManagement } = await import('@/lib/models');
      
      console.log('📚 Saving to CourseManagement collection...');
      
      // Find or create CourseManagement document
      let courseManagement = await CourseManagement.findOne({ courseId: id });
      
      if (!courseManagement) {
        // Create a new CourseManagement document
        const course = await Course.findById(id);
        if (!course) {
          return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }
        
        courseManagement = new CourseManagement({
          courseId: id,
          courseName: course.title,
          weeklyContent: body.weeklyContent || [],
          classLinks: body.classLinks || [],
          blogPosts: body.blogPosts || [],
          enrolledStudents: body.enrolledStudents || [],
          settings: body.settings || {
            allowStudentComments: true,
            autoPublishContent: false,
            requireInstructorApproval: true,
            emailNotifications: true,
            maxStudentsPerClass: 50
          },
          statistics: body.statistics || {
            totalVideos: 0,
            totalDocuments: 0,
            totalClasses: 0,
            totalBlogs: 0,
            totalStudents: 0,
            averageProgress: 0,
            lastUpdated: new Date()
          }
        });
      } else {
        // Update existing CourseManagement document
        if (body.weeklyContent) courseManagement.weeklyContent = body.weeklyContent;
        if (body.classLinks) courseManagement.classLinks = body.classLinks;
        if (body.blogPosts) courseManagement.blogPosts = body.blogPosts;
        if (body.enrolledStudents) courseManagement.enrolledStudents = body.enrolledStudents;
        if (body.settings) courseManagement.settings = { ...courseManagement.settings, ...body.settings };
        if (body.statistics) courseManagement.statistics = { ...courseManagement.statistics, ...body.statistics };
      }
      
      await courseManagement.save();
      console.log('✅ CourseManagement data saved successfully');
      
      return NextResponse.json({ 
        message: 'Advanced course data saved successfully', 
        data: courseManagement 
      });
    } else {
      // Regular course field update (not advanced management)
      const updatedCourse = await Course.findByIdAndUpdate(
        id,
        { ...body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      if (!updatedCourse) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }
      
      console.log('✅ Course updated successfully');
      return NextResponse.json({ message: 'Course data updated successfully', course: updatedCourse });
    }
  } catch (error) {
    console.error('❌ PATCH Error:', error);
    return NextResponse.json({ error: 'Failed to update course', details: (error as any).message }, { status: 500 });
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
