import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import QuizResult from '@/lib/models/QuizResult';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, quizId, quizTitle, answers, score, totalQuestions, correctAnswers, timeSpent } = body;

    if (!courseId || !quizId || !quizTitle || !answers || score === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if user already has a result for this quiz
    const existingResult = await QuizResult.findOne({
      userId,
      courseId,
      quizId
    });

    const quizResultData = {
      userId,
      courseId,
      quizId,
      quizTitle,
      answers,
      score,
      totalQuestions,
      correctAnswers,
      completedAt: new Date(),
      timeSpent
    };

    let result;
    if (existingResult) {
      // Update existing result (keep the best score or allow retaking)
      const updateData = score > existingResult.score ? quizResultData : {
        ...quizResultData,
        score: existingResult.score > score ? existingResult.score : score,
        correctAnswers: existingResult.correctAnswers > correctAnswers ? existingResult.correctAnswers : correctAnswers
      };
      
      result = await QuizResult.findByIdAndUpdate(
        existingResult._id,
        updateData,
        { new: true }
      );
    } else {
      // Create new result
      result = await QuizResult.create(quizResultData);
    }

    return NextResponse.json({ 
      success: true, 
      message: existingResult ? 'Quiz result updated' : 'Quiz result saved',
      data: result
    });
  } catch (error) {
    console.error('Error saving quiz result:', error);
    return NextResponse.json({ error: 'Failed to save quiz result' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const quizId = searchParams.get('quizId');

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    let query: any = { userId, courseId };
    if (quizId) {
      query.quizId = quizId;
    }

    const results = await QuizResult.find(query).sort({ completedAt: -1 }).lean();

    return NextResponse.json({ 
      success: true, 
      data: results 
    });
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    return NextResponse.json({ error: 'Failed to fetch quiz results' }, { status: 500 });
  }
}
