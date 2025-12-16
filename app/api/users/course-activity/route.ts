import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import QuizSubmission from '@/lib/models/QuizSubmission';
import AssignmentSubmission from '@/lib/models/AssignmentSubmission';
import Course from '@/lib/models/Course';

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

    // Get all enrolled courses
    const enrolledCourses = user.enrolledCourses || [];
    const courseIds = enrolledCourses.map((c: any) => c.courseId?.toString() || c.courseId);
    const courses = await Course.find({ _id: { $in: courseIds } }).select('_id title');
    const courseMap = Object.fromEntries(courses.map((c: any) => [c._id.toString(), c.title]));

    // Fetch all quiz and assignment submissions for this user
    const quizSubmissions = await QuizSubmission.find({ studentId: userId }).lean();
    const assignmentSubmissions = await AssignmentSubmission.find({ studentId: userId }).lean();

    // For each course, group quizzes and assignments
    const perCourse = courseIds.map((courseId: string) => {
      const quizzes = quizSubmissions.filter(q => q.courseId?.toString() === courseId);
      const assignments = assignmentSubmissions.filter(a => a.courseId?.toString() === courseId);
      return {
        courseId,
        courseTitle: courseMap[courseId] || 'Unknown Course',
        quizzes: quizzes.map(q => ({
          quizId: q.quizId,
          quizTitle: q.quizTitle,
          score: q.percentage,
          submittedAt: q.submittedAt,
          passed: q.passed
        })),
        assignments: assignments.map(a => ({
          assignmentId: a.assignmentId,
          assignmentTitle: a.assignmentTitle,
          grade: a.percentage,
          submittedAt: a.submittedAt,
          isLate: a.isLate
        }))
      };
    });

    return NextResponse.json({ success: true, perCourse });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch per-course activity', details: error instanceof Error ? error.message : error }, { status: 500 });
  }
}
