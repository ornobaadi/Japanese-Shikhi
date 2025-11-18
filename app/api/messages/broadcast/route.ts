import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Message from '@/lib/models/Message';
import User from '@/lib/models/User';

// Generate a simple unique ID for thread
const generateThreadId = () => {
  return `broadcast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export async function POST(request: NextRequest) {
  try {
    console.log('📢 Broadcast API: POST request received');
    
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      console.error('Unauthorized: No user ID or user object');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userRole = (user.publicMetadata as any)?.role;
    if (userRole !== 'admin') {
      console.error('Forbidden: User is not admin');
      return NextResponse.json({ error: 'Only admins can send broadcast messages' }, { status: 403 });
    }

    await connectToDatabase();
    console.log('Database connected');

    const body = await request.json();
    const { subject, message } = body;

    // Validate required fields
    if (!subject || !message) {
      console.error('Missing required fields');
      return NextResponse.json({ 
        error: 'Missing required fields: subject, message' 
      }, { status: 400 });
    }

    // Get all students (users who are not admins and have enrolled in at least one course)
    const { clerkClient: getClerkClient } = await import('@clerk/nextjs/server');
    const client = await getClerkClient();
    
    // Get all users from Clerk
    const allClerkUsers = await client.users.getUserList({ limit: 500 });
    
    // Filter students (users without admin role)
    const studentClerkUsers = allClerkUsers.data.filter(clerkUser => {
      const role = (clerkUser.publicMetadata as any)?.role;
      return role !== 'admin';
    });

    if (studentClerkUsers.length === 0) {
      return NextResponse.json({ 
        error: 'No students found to send message to',
        sentCount: 0
      }, { status: 404 });
    }

    console.log(`Found ${studentClerkUsers.length} students to send broadcast message`);

    // Generate a unique thread ID for this broadcast
    const threadId = generateThreadId();

    // Create message for each student
    const messages = await Promise.all(
      studentClerkUsers.map(async studentClerkUser => {
        try {
          // Get or create student user in MongoDB
          let studentUser = await User.findOne({ clerkUserId: studentClerkUser.id });
          
          if (!studentUser) {
            // Create student user if not exists
            studentUser = new User({
              clerkUserId: studentClerkUser.id,
              email: studentClerkUser.emailAddresses[0]?.emailAddress || '',
              username: studentClerkUser.username || undefined,
              firstName: studentClerkUser.firstName || undefined,
              lastName: studentClerkUser.lastName || undefined,
              profileImageUrl: studentClerkUser.imageUrl || undefined,
              nativeLanguage: 'English',
              currentLevel: 'beginner',
              learningGoals: [],
            });
            await studentUser.save();
          }
          
          const newMessage = new Message({
            senderId: userId,
            senderName: user.fullName || `${user.firstName} ${user.lastName}`,
            senderEmail: user.emailAddresses[0]?.emailAddress || '',
            receiverId: studentClerkUser.id,
            receiverName: `${studentClerkUser.firstName || ''} ${studentClerkUser.lastName || ''}`.trim() || 'Student',
            receiverEmail: studentClerkUser.emailAddresses[0]?.emailAddress || '',
            subject: `[Broadcast] ${subject}`,
            message,
            contextType: 'broadcast',
            threadId,
            attachments: [],
            isRead: false,
            sentAt: new Date()
          });
          
          return newMessage.save();
        } catch (error) {
          console.error(`Failed to send message to ${studentClerkUser.id}:`, error);
          return null;
        }
      })
    );

    // Filter out failed messages
    const successfulMessages = messages.filter(msg => msg !== null);

    console.log(`✅ Broadcast sent to ${successfulMessages.length}/${studentClerkUsers.length} students`);

    return NextResponse.json({
      success: true,
      message: `Broadcast message sent successfully`,
      sentCount: successfulMessages.length,
      totalStudents: studentClerkUsers.length,
      threadId
    });

  } catch (error) {
    console.error('❌ Broadcast error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send broadcast message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
