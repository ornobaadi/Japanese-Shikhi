import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/lib/models/Course';

export async function GET(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = (sessionClaims?.publicMetadata as any)?.role === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectToDatabase();

    // Get course statistics
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ isPublished: true });

    // Calculate total completed lessons (this would need proper lesson completion tracking)
    const completedLessons = 0; // Placeholder - would need UserProgress model

    // Get recent courses
    const recentCourses = await Course.find()
      .select('title description level difficulty isPublished createdAt enrolledStudents')
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({
      total: totalCourses,
      published: publishedCourses,
      completedLessons,
      recentCourses
    });
  } catch (error) {
    console.error('Error fetching admin course data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = (sessionClaims?.publicMetadata as any)?.role === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, level, difficulty, objectives } = body;

    await connectToDatabase();

    const newCourse = new Course({
      title,
      description,
      level,
      difficulty,
      objectives: objectives || [],
      createdBy: userId,
      isPublished: false,
      enrolledStudents: [],
      lessons: [],
      tags: [],
      prerequisites: []
    });

    await newCourse.save();

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}