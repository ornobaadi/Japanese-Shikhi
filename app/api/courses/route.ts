import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Course } from '@/lib/models';

// GET /api/courses - return a list of courses (published)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const courses = await Course.find({ isPublished: true })
      .select('title description level estimatedDuration lessons learningObjectives rating enrolledStudents slug thumbnailUrl')
      .limit(50)
      .lean();

    return NextResponse.json({ success: true, data: courses }, { status: 200 });
  } catch (error) {
    console.error('GET /api/courses error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
