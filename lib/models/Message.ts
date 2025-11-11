import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  senderId: string; // Clerk user ID
  senderName: string;
  senderEmail: string;
  receiverId: string; // Clerk user ID
  receiverName: string;
  receiverEmail: string;
  
  subject: string;
  message: string;
  
  // Message type for chat-like experience
  messageType?: 'text' | 'image' | 'video' | 'audio' | 'file' | 'voice';
  
  // Context (optional - link to course/assignment/quiz)
  contextType?: 'course' | 'assignment' | 'quiz' | 'general';
  contextId?: mongoose.Types.ObjectId;
  contextTitle?: string;
  
  // Status
  isRead: boolean;
  readAt?: Date;
  isDeleted: boolean; // For unsend feature
  deletedAt?: Date;
  deletedBy?: string; // User ID who deleted
  
  // Thread support
  threadId?: string; // For grouping related messages
  replyToId?: mongoose.Types.ObjectId;
  
  // Timestamps
  sentAt: Date;
  
  // Attachments (optional)
  attachments?: {
    type: 'file' | 'link' | 'image' | 'video' | 'audio' | 'document';
    url: string;
    name: string;
    size?: number;
    mimeType?: string;
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
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'file', 'voice'],
    default: 'text'
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
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: Date,
  deletedBy: String,
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
      enum: ['file', 'link', 'image', 'video', 'audio', 'document'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    size: Number,
    mimeType: String
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
