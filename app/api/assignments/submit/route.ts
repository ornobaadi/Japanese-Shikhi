import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, assignmentId, assignmentTitle, textAnswer, fileUrl, fileName } = body;

    if (!courseId || !assignmentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await clientPromise;
    const db = (await import('mongoose')).connection.db;
    if (!db) throw new Error('MongoDB connection is not established');

    // Create assignment submission
    const submission = {
      courseId,
      assignmentId,
      assignmentTitle,
      studentId: user.id,
      studentEmail: user.emailAddresses[0]?.emailAddress,
      studentName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username,
      textAnswer: textAnswer || '',
      fileUrl: fileUrl || '',
      fileName: fileName || '',
      submittedAt: new Date(),
      status: 'submitted', // submitted, graded, returned
      grade: null,
      feedback: null,
    };

    const result = await db.collection('assignmentSubmissions').insertOne(submission);

    return NextResponse.json({
      success: true,
      submissionId: result.insertedId,
      message: 'Assignment submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return NextResponse.json(
      { error: 'Failed to submit assignment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET - Fetch student's submissions
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const assignmentId = searchParams.get('assignmentId');

    await clientPromise;
    const db = (await import('mongoose')).connection.db;
    if (!db) throw new Error('MongoDB connection is not established');

    const query: any = { studentId: user.id };
    if (courseId) query.courseId = courseId;
    if (assignmentId) query.assignmentId = assignmentId;

    const submissions = await db
      .collection('assignmentSubmissions')
      .find(query)
      .sort({ submittedAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
