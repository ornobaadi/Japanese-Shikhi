import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/lib/models/Course';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const courses = await Course.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(20);

    console.log('Direct courses fetch:', courses.length, 'courses found');

    return NextResponse.json({
      success: true,
      courses: courses,
      count: courses.length
    });

  } catch (error) {
    console.error('Error fetching courses directly:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch courses',
        courses: []
      },
      { status: 500 }
    );
  }
}