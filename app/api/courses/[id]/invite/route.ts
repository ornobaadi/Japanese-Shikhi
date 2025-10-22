import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/lib/models/Course';
import { sendCourseInviteEmails } from '@/lib/email';

// POST /api/courses/[id]/invite - Send course invitations via email
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

        // Find course
        const course = await Course.findById(courseId);
        
        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        const body = await request.json();
        const { emails, courseName, inviteLink } = body;

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return NextResponse.json(
                { error: 'Email addresses are required' },
                { status: 400 }
            );
        }

        // Validate emails
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const trimmedEmails = emails.map(email => email.trim()).filter(email => email.length > 0);
        const invalidEmails = trimmedEmails.filter(email => !emailRegex.test(email));
        
        console.log('📧 Processing emails:', trimmedEmails);
        console.log('❌ Invalid emails found:', invalidEmails);
        
        if (invalidEmails.length > 0) {
            return NextResponse.json(
                { 
                    error: `Invalid email format: ${invalidEmails.join(', ')}`, 
                    invalidEmails,
                    allEmails: trimmedEmails
                },
                { status: 400 }
            );
        }

        // Send invitation emails using Resend
        try {
            await sendCourseInviteEmails({
                to: trimmedEmails,
                courseName: courseName || course.title,
                courseUrl: inviteLink,
                inviterName: 'Japanese Learning Platform'
            });

            console.log('✅ Invitations sent successfully to:', trimmedEmails);

            return NextResponse.json({
                success: true,
                message: `Invitations sent to ${trimmedEmails.length} email(s)`,
                emailsSent: trimmedEmails
            });

        } catch (emailError) {
            console.error('Failed to send emails:', emailError);
            return NextResponse.json(
                { error: 'Failed to send invitation emails. Please check your email service configuration.' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Error sending invitations:', error);
        return NextResponse.json(
            { error: 'Failed to send invitations' },
            { status: 500 }
        );
    }
}
