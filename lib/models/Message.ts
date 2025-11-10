import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  senderId: string; // Clerk user ID (admin)
  senderName: string;
  senderEmail: string;
  receiverId: string; // Clerk user ID (student)
  receiverName: string;
  receiverEmail: string;
  
  subject: string;
  message: string;
  
  // Context (optional - link to course/assignment/quiz)
  contextType?: 'course' | 'assignment' | 'quiz' | 'general';
  contextId?: mongoose.Types.ObjectId;
  contextTitle?: string;
  
  // Status
  isRead: boolean;
  readAt?: Date;
  
  // Thread support
  threadId?: string; // For grouping related messages
  replyToId?: mongoose.Types.ObjectId;
  
  // Timestamps
  sentAt: Date;
  
  // Attachments (optional)
  attachments?: {
    type: 'file' | 'link';
    url: string;
    name: string;
  }[];
}

const MessageSchema = new Schema<IMessage>({
  senderId: {
    type: String,
    required: true,
    index: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderEmail: {
    type: String,
    required: true
  },
  receiverId: {
    type: String,
    required: true,
    index: true
  },
  receiverName: {
    type: String,
    required: true
  },
  receiverEmail: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 5000
  },
  contextType: {
    type: String,
    enum: ['course', 'assignment', 'quiz', 'general']
  },
  contextId: {
    type: Schema.Types.ObjectId
  },
  contextTitle: {
    type: String,
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: Date,
  threadId: {
    type: String,
    index: true
  },
  replyToId: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  sentAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  attachments: [{
    type: {
      type: String,
      enum: ['file', 'link'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Compound indexes for efficient queries
MessageSchema.index({ senderId: 1, sentAt: -1 });
MessageSchema.index({ receiverId: 1, sentAt: -1 });
MessageSchema.index({ threadId: 1, sentAt: 1 });
MessageSchema.index({ receiverId: 1, isRead: 1 });

const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
