import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import { QuizSubmission } from '@/lib/models';

// GET - Fetch quiz submissions for current user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Fetch all quiz submissions for the user
    const submissions = await QuizSubmission.find({ userId })
      .populate('courseId', 'title')
      .sort({ submittedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      submissions: submissions.map((sub: any) => ({
        _id: sub._id,
        courseId: sub.courseId?._id,
        courseTitle: sub.courseId?.title,
        lessonId: sub.lessonId,
        score: sub.score,
        totalQuestions: sub.totalQuestions,
        percentage: sub.percentage,
        passed: sub.passed,
        submittedAt: sub.submittedAt,
        timeTaken: sub.timeTaken,
      }))
    });
  } catch (error) {
    console.error('Error fetching quiz submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz submissions' },
      { status: 500 }
    );
  }
}
