import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';

// POST /api/resources - Add a new resource
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { courseId, title, description, date, time, resourceType, attachments } = body;
    if (!courseId || !title) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    await connectToDatabase();
    const mongoose = (await import('mongoose')).default;
    const db = mongoose.connection;
    const resource = {
      courseId,
      title,
      description,
      date,
      time,
      resourceType,
      attachments,
      createdAt: new Date(),
    };
    const result = await db.collection('resources').insertOne(resource);
    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// GET /api/resources?courseId=... - Get all resources for a course
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    if (!courseId) {
      return NextResponse.json({ success: false, error: 'Missing courseId' }, { status: 400 });
    }
    await connectToDatabase();
    const mongoose = (await import('mongoose')).default;
    const db = mongoose.connection;
    const resources = await db.collection('resources').find({ courseId }).sort({ createdAt: 1 }).toArray();
    return NextResponse.json({ success: true, resources });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
