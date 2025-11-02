import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/lib/models/Course';
import QuizSubmission from '@/lib/models/QuizSubmission';

// Helper function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

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

    if (!quizItem.isPublished) {
      return NextResponse.json({ error: 'Quiz is not published' }, { status: 403 });
    }

    const quizData = quizItem.quizData;
    if (!quizData) {
      return NextResponse.json({ error: 'Quiz data not found' }, { status: 404 });
    }

    // Check if student has already submitted and if multiple attempts are allowed
    const existingSubmissions = await QuizSubmission.find({
      courseId,
      moduleIndex: parseInt(moduleIndex),
      itemIndex: parseInt(itemIndex),
      studentId: userId
    }).sort({ attemptNumber: -1 });

    if (existingSubmissions.length > 0 && !quizData.allowMultipleAttempts) {
      return NextResponse.json({
        error: 'You have already submitted this quiz',
        alreadySubmitted: true,
        submission: existingSubmissions[0]
      }, { status: 403 });
    }

    // Prepare quiz data for student (without correct answers for MCQ)
    let quizForStudent: any = {
      title: quizItem.title,
      description: quizItem.description,
      quizType: quizData.quizType,
      timeLimit: quizData.timeLimit,
      totalPoints: quizData.totalPoints,
      passingScore: quizData.passingScore,
      allowMultipleAttempts: quizData.allowMultipleAttempts,
      attemptNumber: existingSubmissions.length + 1
    };

    if (quizData.quizType === 'mcq') {
      // Remove correct answers from options
      let questions = quizData.mcqQuestions?.map((q: any, idx: number) => ({
        questionIndex: idx,
        question: q.question,
        options: q.options.map((opt: any, optIdx: number) => ({
          optionIndex: optIdx,
          text: opt.text
          // isCorrect is NOT included
        })),
        points: q.points
      })) || [];

      // Randomize questions if enabled
      if (quizData.randomizeQuestions) {
        questions = shuffleArray(questions);
        // Update questionIndex after shuffling
        questions = questions.map((q: any, newIdx: number) => ({
          ...q,
          originalIndex: q.questionIndex,
          questionIndex: newIdx
        }));
      }

      // Randomize options if enabled
      if (quizData.randomizeOptions) {
        questions = questions.map((q: any) => ({
          ...q,
          options: shuffleArray(q.options).map((opt: any, newIdx: number) => ({
            ...opt,
            originalIndex: opt.optionIndex,
            optionIndex: newIdx
          }))
        }));
      }

      quizForStudent.questions = questions;

    } else if (quizData.quizType === 'open-ended') {
      quizForStudent.question = quizData.openEndedQuestion;
      quizForStudent.questionFile = quizData.openEndedQuestionFile;
      quizForStudent.acceptFileUpload = quizData.acceptFileUpload;
      quizForStudent.acceptTextAnswer = quizData.acceptTextAnswer;
    }

    return NextResponse.json({
      success: true,
      quiz: quizForStudent,
      previousAttempts: existingSubmissions.length
    });

  } catch (error: any) {
    console.error('Fetch quiz error:', error);
    return NextResponse.json({
      error: 'Failed to fetch quiz',
      details: error.message
    }, { status: 500 });
  }
}
