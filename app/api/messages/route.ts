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

    // Check sender role from Clerk metadata
    const clerkSender = await user;
    const senderRole = (clerkSender?.publicMetadata as any)?.role;
    const isSenderAdmin = senderRole === 'admin';

    console.log('Sender role:', senderRole, 'Is admin:', isSenderAdmin);

    // If sender is not admin and receiverId is not 'admin', check if receiver is admin
    if (!isSenderAdmin && receiverId !== 'admin') {
      // Get receiver from Clerk to check their role
      const { clerkClient: getClerkClient } = await import('@clerk/nextjs/server');
      const client = await getClerkClient();
      
      try {
        const receiverClerkUser = await client.users.getUser(receiverId);
        const receiverRole = (receiverClerkUser.publicMetadata as any)?.role;
        const isReceiverAdmin = receiverRole === 'admin';
        
        console.log('Receiver role:', receiverRole, 'Is admin:', isReceiverAdmin);
        
        if (!isReceiverAdmin) {
          console.error('Student-to-student messaging not allowed');
          return NextResponse.json({ 
            error: 'Students can only message admins' 
          }, { status: 403 });
        }
      } catch (error) {
        console.error('Error checking receiver role:', error);
        // If we can't verify receiver role, allow the message (fail open for now)
      }
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
      // Get all admin users from Clerk
      const { clerkClient: getClerkClient } = await import('@clerk/nextjs/server');
      const client = await getClerkClient();
      
      try {
        // Get all users and filter for admins
        const { data: allUsers } = await client.users.getUserList({ limit: 100 });
        const adminClerkUsers = allUsers.filter(u => (u.publicMetadata as any)?.role === 'admin');
        
        console.log('Found admin users from Clerk:', adminClerkUsers.length);
        
        if (adminClerkUsers.length === 0) {
          console.warn('No admins found, creating a notification entry');
          
          // Create a notification entry that can be picked up later
          const notificationMessage = new Message({
            senderId: userId,
            senderName: user.fullName || `${user.firstName} ${user.lastName}`,
            senderEmail: user.emailAddresses[0]?.emailAddress || '',
            receiverId: 'ADMIN_TEAM',
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
          adminClerkUsers.map(async adminClerkUser => {
            // Get or create admin user in MongoDB
            let adminUser = await User.findOne({ clerkUserId: adminClerkUser.id });
            
            if (!adminUser) {
              // Create admin user if not exists
              adminUser = new User({
                clerkUserId: adminClerkUser.id,
                email: adminClerkUser.emailAddresses[0]?.emailAddress || '',
                username: adminClerkUser.username || undefined,
                firstName: adminClerkUser.firstName || undefined,
                lastName: adminClerkUser.lastName || undefined,
                profileImageUrl: adminClerkUser.imageUrl || undefined,
                nativeLanguage: 'English',
                currentLevel: 'beginner',
                learningGoals: [],
              });
              await adminUser.save();
            }
            
            const newMessage = new Message({
              senderId: userId,
              senderName: user.fullName || `${user.firstName} ${user.lastName}`,
              senderEmail: user.emailAddresses[0]?.emailAddress || '',
              receiverId: adminClerkUser.id,
              receiverName: `${adminClerkUser.firstName || ''} ${adminClerkUser.lastName || ''}`.trim() || 'Admin',
              receiverEmail: adminClerkUser.emailAddresses[0]?.emailAddress || '',
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
          message: `Message sent to ${adminClerkUsers.length} admin(s)`,
          data: messages[0]
        });
      } catch (error) {
        console.error('Error fetching admins from Clerk:', error);
        return NextResponse.json(
          { error: 'Failed to fetch admin users' },
          { status: 500 }
        );
      }
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

    // Exclude deleted messages
    query.isDeleted = { $ne: true };

    const messages = await Message.find(query)
      .sort({ sentAt: -1 })
      .limit(100)
      .lean();

    // Get unread count (excluding deleted messages)
    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      isRead: false,
      isDeleted: { $ne: true }
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

// Delete/Unsend message (Telegram-style: anyone can delete for everyone)
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
    }

    // Find message where user is either sender or receiver
    const message = await Message.findOne({
      _id: messageId,
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Delete for everyone (Telegram-style)
    message.isDeleted = true;
    message.deletedAt = new Date();
    message.deletedBy = userId;
    await message.save();

    return NextResponse.json({
      success: true,
      message: 'Message deleted for everyone'
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
