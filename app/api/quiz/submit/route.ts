import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/lib/models/Course';
import QuizSubmission from '@/lib/models/QuizSubmission';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await connectToDatabase();

    const body = await request.json();
    const { courseId, moduleIndex, itemIndex, answers, quizType, startedAt } = body;

    // Validate required fields
    if (!courseId || moduleIndex === undefined || itemIndex === undefined || !quizType || !startedAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch course and quiz
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const module = course.curriculum?.modules[moduleIndex];
    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const quizItem = module.items[itemIndex];
    if (!quizItem || quizItem.type !== 'quiz') {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    if (!quizItem.isPublished) {
      return NextResponse.json({ error: 'Quiz is not published' }, { status: 403 });
    }

    const quizData = quizItem.quizData;
    if (!quizData) {
      return NextResponse.json({ error: 'Quiz data not found' }, { status: 404 });
    }

    // Check for existing submissions
    const existingSubmissions = await QuizSubmission.find({
      courseId,
      moduleIndex,
      itemIndex,
      studentId: userId
    }).sort({ attemptNumber: -1 });

    const attemptNumber = existingSubmissions.length + 1;

    // Check if multiple attempts are allowed
    if (existingSubmissions.length > 0 && !quizData.allowMultipleAttempts) {
      return NextResponse.json({
        error: 'Multiple attempts not allowed for this quiz',
        existingSubmission: existingSubmissions[0]
      }, { status: 403 });
    }

    const submittedAt = new Date();
    const startTime = new Date(startedAt);
    const timeSpent = Math.floor((submittedAt.getTime() - startTime.getTime()) / 1000);

    let submission: any = {
      courseId,
      moduleIndex,
      itemIndex,
      studentId: userId,
      studentName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || 'Anonymous',
      studentEmail: user.emailAddresses[0]?.emailAddress || '',
      quizType,
      attemptNumber,
      startedAt: startTime,
      submittedAt,
      timeSpent,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
      userAgent: request.headers.get('user-agent') || ''
    };

    if (quizType === 'mcq') {
      // Auto-grade MCQ
      const mcqQuestions = quizData.mcqQuestions || [];
      const mcqAnswers = [];
      let totalScore = 0;

      for (let i = 0; i < mcqQuestions.length; i++) {
        const question = mcqQuestions[i];
        const studentAnswer = answers.mcqAnswers?.[i];

        if (studentAnswer !== undefined && studentAnswer !== null) {
          const correctOptionIndex = question.options.findIndex((opt: any) => opt.isCorrect);
          const isCorrect = studentAnswer === correctOptionIndex;
          const pointsEarned = isCorrect ? question.points : 0;

          mcqAnswers.push({
            questionIndex: i,
            selectedOptionIndex: studentAnswer,
            isCorrect,
            pointsEarned
          });

          totalScore += pointsEarned;
        } else {
          // No answer provided
          mcqAnswers.push({
            questionIndex: i,
            selectedOptionIndex: -1,
            isCorrect: false,
            pointsEarned: 0
          });
        }
      }

      const totalPoints = quizData.totalPoints;
      const percentage = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0;
      const passed = percentage >= quizData.passingScore;

      submission = {
        ...submission,
        mcqAnswers,
        score: totalScore,
        totalPoints,
        percentage,
        passed
      };

    } else if (quizType === 'open-ended') {
      // Store open-ended answer (to be graded manually)
      const openEndedAnswer: any = {};

      if (answers.textAnswer) {
        openEndedAnswer.textAnswer = answers.textAnswer;
      }
      if (answers.fileUrl) {
        openEndedAnswer.fileUrl = answers.fileUrl;
      }

      submission = {
        ...submission,
        openEndedAnswer,
        score: 0, // Will be updated when graded
        totalPoints: quizData.totalPoints,
        percentage: 0,
        passed: false // Will be updated when graded
      };
    }

    // Save submission
    const quizSubmission = new QuizSubmission(submission);
    await quizSubmission.save();

    // Return response based on quiz settings
    if (quizType === 'mcq' && quizData.showAnswersAfterSubmission) {
      // Include correct answers and explanations
      return NextResponse.json({
        success: true,
        submission: quizSubmission,
        showAnswers: true,
        questions: quizData.mcqQuestions
      });
    } else if (quizType === 'mcq') {
      // Don't show answers
      return NextResponse.json({
        success: true,
        submission: {
          _id: quizSubmission._id,
          score: quizSubmission.score,
          totalPoints: quizSubmission.totalPoints,
          percentage: quizSubmission.percentage,
          passed: quizSubmission.passed,
          attemptNumber: quizSubmission.attemptNumber
        },
        showAnswers: false
      });
    } else {
      // Open-ended - waiting for manual grading
      return NextResponse.json({
        success: true,
        message: 'Answer submitted successfully. It will be graded by the instructor.',
        submission: {
          _id: quizSubmission._id,
          submittedAt: quizSubmission.submittedAt,
          attemptNumber: quizSubmission.attemptNumber
        }
      });
    }

  } catch (error: any) {
    console.error('Quiz submission error:', error);
    return NextResponse.json({
      error: 'Failed to submit quiz',
      details: error.message
    }, { status: 500 });
  }
}
