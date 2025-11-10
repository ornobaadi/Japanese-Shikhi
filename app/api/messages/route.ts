import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Message from '@/lib/models/Message';
import User from '@/lib/models/User';

// Generate a simple unique ID
const generateThreadId = () => {
  return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Send a new message (both admin and student can send)
export async function POST(request: NextRequest) {
  try {
    console.log('📧 Message API: POST request received');
    
    const { userId } = await auth();
    const user = await currentUser();
    
    console.log('User ID:', userId);
    
    if (!userId || !user) {
      console.error('Unauthorized: No user ID or user object');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    console.log('Database connected');

    const senderUser = await User.findOne({ clerkUserId: userId });
    console.log('Sender user found:', senderUser ? 'Yes' : 'No');
    
    if (!senderUser) {
      console.error('User not found in database:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const { 
      receiverId, // Can be specific admin ID or "admin" for all admins
      subject, 
      message, 
      contextType, 
      contextId, 
      contextTitle,
      replyToId,
      attachments 
    } = body;

    // Validate required fields
    if (!receiverId || !subject || !message) {
      console.error('Missing required fields');
      return NextResponse.json({ 
        error: 'Missing required fields: receiverId, subject, message' 
      }, { status: 400 });
    }

    // Generate thread ID if this is a new conversation
    let threadId = generateThreadId();
    
    // If this is a reply, use the same thread ID
    if (replyToId) {
      const originalMessage = await Message.findById(replyToId);
      if (originalMessage) {
        threadId = originalMessage.threadId || threadId;
      }
    }

    console.log('Thread ID:', threadId);

    // If sending to "admin", all admins will receive
    if (receiverId === 'admin') {
      // Get all admin users
      const admins = await User.find({ subscriptionStatus: 'lifetime' });
      
      console.log('Found admins:', admins.length);
      
      if (admins.length === 0) {
        console.warn('No admins found, creating a notification entry');
        
        // Create a notification entry that can be picked up later
        // Store it with a special receiverId
        const notificationMessage = new Message({
          senderId: userId,
          senderName: user.fullName || `${user.firstName} ${user.lastName}`,
          senderEmail: user.emailAddresses[0]?.emailAddress || '',
          receiverId: 'ADMIN_TEAM', // Special marker for admin team
          receiverName: 'Admin Team',
          receiverEmail: 'admin@system',
          subject,
          message,
          contextType,
          contextId,
          contextTitle,
          threadId,
          replyToId,
          attachments: attachments || [],
          isRead: false,
          sentAt: new Date()
        });
        
        await notificationMessage.save();
        
        return NextResponse.json({
          success: true,
          message: 'Message saved. Will be delivered when admin is available.',
          data: notificationMessage,
          warning: 'No active admins found'
        });
      }

      // Create message for each admin
      const messages = await Promise.all(
        admins.map(admin => {
          const newMessage = new Message({
            senderId: userId,
            senderName: user.fullName || `${user.firstName} ${user.lastName}`,
            senderEmail: user.emailAddresses[0]?.emailAddress || '',
            receiverId: admin.clerkUserId,
            receiverName: `${admin.firstName} ${admin.lastName}`,
            receiverEmail: admin.email,
            subject,
            message,
            contextType,
            contextId,
            contextTitle,
            threadId,
            replyToId,
            attachments: attachments || [],
            isRead: false,
            sentAt: new Date()
          });
          return newMessage.save();
        })
      );

      return NextResponse.json({
        success: true,
        message: `Message sent to ${admins.length} admin(s)`,
        data: messages[0] // Return first message as reference
      });
    }

    // Get receiver details for specific user
    const receiver = await User.findOne({ clerkUserId: receiverId });
    if (!receiver) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });
    }

    // Create message for specific user
    const newMessage = new Message({
      senderId: userId,
      senderName: user.fullName || `${user.firstName} ${user.lastName}`,
      senderEmail: user.emailAddresses[0]?.emailAddress || '',
      receiverId,
      receiverName: `${receiver.firstName} ${receiver.lastName}`,
      receiverEmail: receiver.email,
      subject,
      message,
      contextType,
      contextId,
      contextTitle,
      threadId,
      replyToId,
      attachments: attachments || [],
      isRead: false,
      sentAt: new Date()
    });

    await newMessage.save();

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });

  } catch (error) {
    console.error('❌ Error sending message:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Failed to send message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get messages (inbox/sent)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'inbox'; // inbox | sent | thread
    const threadId = searchParams.get('threadId');
    const studentId = searchParams.get('studentId'); // For admin to see messages with specific student

    let query: any = {};

    if (type === 'inbox') {
      query.receiverId = userId;
    } else if (type === 'sent') {
      query.senderId = userId;
    } else if (type === 'thread' && threadId) {
      query.threadId = threadId;
    }

    // If admin is viewing messages with a specific student
    if (studentId) {
      query = {
        $or: [
          { senderId: userId, receiverId: studentId },
          { senderId: studentId, receiverId: userId }
        ]
      };
    }

    const messages = await Message.find(query)
      .sort({ sentAt: -1 })
      .limit(100)
      .lean();

    // Get unread count
    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      isRead: false
    });

    return NextResponse.json({
      success: true,
      messages,
      unreadCount
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// Mark message as read
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    const { messageId } = body;

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
    }

    const message = await Message.findOne({
      _id: messageId,
      receiverId: userId
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    return NextResponse.json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('Error marking message as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark message as read' },
      { status: 500 }
    );
  }
}
