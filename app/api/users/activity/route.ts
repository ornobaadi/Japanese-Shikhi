import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import QuizSubmission from '@/lib/models/QuizSubmission';
import AssignmentSubmission from '@/lib/models/AssignmentSubmission';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectToDatabase();

    // Fetch user
    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Gather enrollments (from enrolledCourses array)
    const enrollments = (user.enrolledCourses || []).map((enroll: any) => ({
      type: 'enrollment',
      courseId: enroll.courseId,
      courseName: enroll.courseName || '',
      enrolledAt: enroll.enrolledAt,
    }));

    // Gather quiz submissions
    const quizSubmissions = await QuizSubmission.find({ studentId: userId })
      .sort({ submittedAt: -1 })
      .limit(10)
      .lean();
    const quizzes = quizSubmissions.map((quiz: any) => ({
      type: 'quiz',
      courseId: quiz.courseId,
      courseName: quiz.courseName || '',
      quizTitle: quiz.quizTitle || '',
      score: quiz.percentage || 0,
      submittedAt: quiz.submittedAt,
    }));

    // Gather assignment submissions
    const assignmentSubmissions = await AssignmentSubmission.find({ studentId: userId })
      .sort({ submittedAt: -1 })
      .limit(10)
      .lean();
    const assignments = assignmentSubmissions.map((a: any) => ({
      type: 'assignment',
      courseId: a.courseId,
      courseName: a.courseName || '',
      assignmentTitle: a.assignmentTitle || '',
      grade: a.percentage,
      submittedAt: a.submittedAt,
      isLate: a.isLate || false,
    }));

    // Combine and sort all activities by date
    const allActivities = [
      ...enrollments,
      ...quizzes,
      ...assignments,
    ].sort((a, b) => {
      const aDate = a.enrolledAt || a.submittedAt;
      const bDate = b.enrolledAt || b.submittedAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    }).slice(0, 15);

    return NextResponse.json({ success: true, activities: allActivities });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch activities', details: error instanceof Error ? error.message : error }, { status: 500 });
  }
}
