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

    // Get courseId from query
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    if (!courseId) {
      return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });
    }

    // Get all users enrolled in this course
    const users = await User.find({ 'enrolledCourses.courseId': courseId }).select('clerkUserId firstName lastName');
    const userIds = users.map(u => u.clerkUserId);

    // Get all quiz submissions for this course
    const quizSubmissions = await QuizSubmission.find({ courseId }).lean();

    // Calculate total score per user
    const userScores: Record<string, number> = {};
    quizSubmissions.forEach(q => {
      if (!userScores[q.studentId]) userScores[q.studentId] = 0;
      userScores[q.studentId] += q.percentage || 0;
    });

    // Sort users by total score (descending)
    const ranked = userIds
      .map(uid => ({
        userId: uid,
        name: (users.find(u => u.clerkUserId === uid)?.firstName || '') + ' ' + (users.find(u => u.clerkUserId === uid)?.lastName || ''),
        totalScore: userScores[uid] || 0
      }))
      .sort((a, b) => b.totalScore - a.totalScore);

    // Find current user's rank
    const myRank = ranked.findIndex(r => r.userId === userId) + 1;

    return NextResponse.json({
      success: true,
      rank: myRank,
      total: ranked.length,
      leaderboard: ranked.slice(0, 10) // top 10
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch course rank', details: error instanceof Error ? error.message : error }, { status: 500 });
  }
}
