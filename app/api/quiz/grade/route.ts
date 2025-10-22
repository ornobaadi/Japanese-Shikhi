import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import QuizSubmission from '@/lib/models/QuizSubmission';
import Course from '@/lib/models/Course';

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // TODO: Add admin role check
    // For now, assuming all authenticated users can grade

    await connectToDatabase();

    const body = await request.json();
    const { submissionId, score, feedback, courseId, moduleIndex, itemIndex } = body;

    if (!submissionId || score === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch the submission
    const submission = await QuizSubmission.findById(submissionId);
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (submission.quizType !== 'open-ended') {
      return NextResponse.json({ error: 'Can only grade open-ended quizzes' }, { status: 400 });
    }

    // Fetch quiz data to get total points and passing score
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const module = course.curriculum?.modules[moduleIndex];
    const quizItem = module?.items[itemIndex];
    const quizData = quizItem?.quizData;

    if (!quizData) {
      return NextResponse.json({ error: 'Quiz data not found' }, { status: 404 });
    }

    // Validate score
    if (score < 0 || score > quizData.totalPoints) {
      return NextResponse.json({
        error: `Score must be between 0 and ${quizData.totalPoints}`,
      }, { status: 400 });
    }

    // Calculate percentage and pass/fail
    const percentage = Math.round((score / quizData.totalPoints) * 100);
    const passed = percentage >= quizData.passingScore;

    // Update submission
    submission.score = score;
    submission.percentage = percentage;
    submission.passed = passed;
    submission.openEndedAnswer = {
      ...submission.openEndedAnswer,
      gradedScore: score,
      feedback: feedback || '',
      gradedAt: new Date(),
      gradedBy: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || userId,
    };

    await submission.save();

    return NextResponse.json({
      success: true,
      submission,
    });

  } catch (error: any) {
    console.error('Grading error:', error);
    return NextResponse.json({
      error: 'Failed to grade submission',
      details: error.message,
    }, { status: 500 });
  }
}

// Get ungraded submissions for a quiz
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin role check

    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    const moduleIndex = searchParams.get('moduleIndex');
    const itemIndex = searchParams.get('itemIndex');

    if (!courseId || moduleIndex === null || itemIndex === null) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Fetch all submissions for this quiz
    const submissions = await QuizSubmission.find({
      courseId,
      moduleIndex: parseInt(moduleIndex),
      itemIndex: parseInt(itemIndex),
      quizType: 'open-ended',
    }).sort({ submittedAt: -1 });

    // Separate graded and ungraded
    const ungraded = submissions.filter(
      (sub) => sub.openEndedAnswer?.gradedScore === undefined
    );
    const graded = submissions.filter(
      (sub) => sub.openEndedAnswer?.gradedScore !== undefined
    );

    return NextResponse.json({
      success: true,
      ungraded,
      graded,
      total: submissions.length,
    });

  } catch (error: any) {
    console.error('Fetch submissions error:', error);
    return NextResponse.json({
      error: 'Failed to fetch submissions',
      details: error.message,
    }, { status: 500 });
  }
}
