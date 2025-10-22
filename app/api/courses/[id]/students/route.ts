import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import Course from '@/lib/models/Course';

// GET /api/courses/[id]/students - Get enrolled students for a course
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

        // Find course
        const course = await Course.findById(courseId);
        
        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        // Find all users enrolled in this course
        const enrolledStudents = await User.find({
            'enrolledCourses.courseId': courseId
        }).select('email firstName lastName username profileImageUrl');

        return NextResponse.json({
            success: true,
            students: enrolledStudents
        });

    } catch (error) {
        console.error('Error fetching students:', error);
        return NextResponse.json(
            { error: 'Failed to fetch students' },
            { status: 500 }
        );
    }
}
