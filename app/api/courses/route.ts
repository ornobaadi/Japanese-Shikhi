import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/lib/models/Course';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');

    // Build query
    let query: any = { isPublished: true };
    
    if (level) {
      query.level = level;
    }
    
    if (category) {
      query.category = category;
    }

    // Execute query
    let coursesQuery = Course.find(query).sort({ createdAt: -1 });
    
    if (limit) {
      coursesQuery = coursesQuery.limit(parseInt(limit));
    }

    const courses = await coursesQuery.exec();

    return NextResponse.json({
      success: true,
      data: courses,
      count: courses.length
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch courses',
        data: []
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    
    // Create new course
    const course = new Course(body);
    await course.save();

    return NextResponse.json({
      success: true,
      data: course,
      message: 'Course created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create course' 
      },
      { status: 500 }
    );
  }
}