import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Assignment from '@/lib/models/Assignment';
import Course from '@/lib/models/Course';

// GET /api/courses/[id]/assignments - Get assignments for a course (optionally filtered by week)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const courseId = resolvedParams.id;

        // Get week query parameter (optional)
        const { searchParams } = new URL(request.url);
        const week = searchParams.get('week');

        // Find course by ID
        let course = await Course.findById(courseId);
        
        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        // Build query
        const query: any = { courseId: course._id };
        if (week) {
            query.week = parseInt(week);
        }

        // Fetch assignments
        const assignments = await Assignment.find(query).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: assignments
        });

    } catch (error) {
        console.error('Error fetching assignments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch assignments' },
            { status: 500 }
        );
    }
}

// POST /api/courses/[id]/assignments - Create a new assignment
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const courseId = resolvedParams.id;

        // Find course by ID
        const course = await Course.findById(courseId);

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        // Parse request body
        const body = await request.json();
        const { week, title, instructions, dueDate, points, attachments } = body;

        // Validation
        const errors = [];
        if (!week || week < 1 || week > 52) {
            errors.push('Week must be between 1 and 52');
        }
        if (!title || title.trim().length === 0) {
            errors.push('Title is required');
        }
        if (title && title.length > 200) {
            errors.push('Title must be less than 200 characters');
        }
        if (instructions && instructions.length > 5000) {
            errors.push('Instructions must be less than 5000 characters');
        }
        if (points && (points < 0 || points > 1000)) {
            errors.push('Points must be between 0 and 1000');
        }

        if (errors.length > 0) {
            return NextResponse.json(
                { error: 'Validation failed', details: errors },
                { status: 400 }
            );
        }

        // Create assignment
        const assignment = await Assignment.create({
            courseId: course._id,
            week,
            title: title.trim(),
            instructions: instructions?.trim() || '',
            dueDate: dueDate ? new Date(dueDate) : null,
            points: points || 100,
            attachments: attachments || []
        });

        return NextResponse.json({
            success: true,
            data: assignment
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating assignment:', error);

        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map((err: any) => err.message);
            return NextResponse.json(
                { error: 'Validation failed', details: validationErrors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create assignment' },
            { status: 500 }
        );
    }
}
