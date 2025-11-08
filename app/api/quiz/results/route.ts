import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/lib/models/Course';
import QuizSubmission from '@/lib/models/QuizSubmission';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    const moduleIndex = searchParams.get('moduleIndex');
    const itemIndex = searchParams.get('itemIndex');
    const submissionId = searchParams.get('submissionId');

    if (!courseId || moduleIndex === null || itemIndex === null) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Fetch course and quiz
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const module = course.curriculum?.modules[parseInt(moduleIndex)];
    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const quizItem = module.items[parseInt(itemIndex)];
    if (!quizItem || quizItem.type !== 'quiz') {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const quizData = quizItem.quizData;
    if (!quizData) {
      return NextResponse.json({ error: 'Quiz data not found' }, { status: 404 });
    }

    // Fetch student's submissions
    let query: any = {
      courseId,
      moduleIndex: parseInt(moduleIndex),
      itemIndex: parseInt(itemIndex),
      studentId: userId
    };

    if (submissionId) {
      query._id = submissionId;
    }

    const submissions = await QuizSubmission.find(query)
      .sort({ attemptNumber: -1 })
      .lean();

    if (!submissions || submissions.length === 0) {
      return NextResponse.json({ error: 'No submissions found' }, { status: 404 });
    }

    // Check if student has submitted the quiz before showing results
    const latestSubmission = submissions[0];

    // Prepare response based on quiz type and settings
    if (quizData.quizType === 'mcq') {
      if (quizData.showAnswersAfterSubmission) {
        // Show full results with correct answers
        return NextResponse.json({
          success: true,
          submissions: submissions.map(sub => ({
            _id: sub._id,
            score: sub.score,
            totalPoints: sub.totalPoints,
            percentage: sub.percentage,
            passed: sub.passed,
            attemptNumber: sub.attemptNumber,
            submittedAt: sub.submittedAt,
            timeSpent: sub.timeSpent,
            mcqAnswers: sub.mcqAnswers
          })),
          questions: quizData.mcqQuestions, // Include questions for showing correct answers
          showAnswers: true
        });
      } else {
        // Only show scores, not correct answers
        return NextResponse.json({
          success: true,
          submissions: submissions.map(sub => ({
            _id: sub._id,
            score: sub.score,
            totalPoints: sub.totalPoints,
            percentage: sub.percentage,
            passed: sub.passed,
            attemptNumber: sub.attemptNumber,
            submittedAt: sub.submittedAt,
            timeSpent: sub.timeSpent
          })),
          showAnswers: false
        });
      }
    } else {
      // Open-ended quiz
      return NextResponse.json({
        success: true,
        submissions: submissions.map(sub => ({
          _id: sub._id,
          openEndedAnswer: sub.openEndedAnswer,
          score: sub.score,
          totalPoints: sub.totalPoints,
          percentage: sub.percentage,
          passed: sub.passed,
          attemptNumber: sub.attemptNumber,
          submittedAt: sub.submittedAt,
          timeSpent: sub.timeSpent
        })),
        question: quizData.openEndedQuestion,
        questionFile: quizData.openEndedQuestionFile
      });
    }

  } catch (error: any) {
    console.error('Fetch quiz results error:', error);
    return NextResponse.json({
      error: 'Failed to fetch quiz results',
      details: error.message
    }, { status: 500 });
  }
}
