import mongoose, { Schema, Document } from 'mongoose';

export interface IAttachment {
  type: 'drive' | 'youtube' | 'file' | 'link';
  url: string;
  name?: string;
}

export interface IAssignment extends Document {
  courseId: mongoose.Types.ObjectId;
  week: number;
  title: string;
  instructions?: string;
  dueDate?: Date;
  points: number;
  attachments: IAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>({
  type: {
    type: String,
    enum: ['drive', 'youtube', 'file', 'link'],
    required: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  }
}, { _id: false });

const AssignmentSchema = new Schema<IAssignment>({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  week: {
    type: Number,
    required: true,
    min: 1,
    max: 52,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: 5000
  },
  dueDate: {
    type: Date,
    index: true
  },
  points: {
    type: Number,
    default: 100,
    min: 0,
    max: 1000
  },
  attachments: {
    type: [AttachmentSchema],
    default: []
  }
}, {
  timestamps: true,
  collection: 'assignments'
});

// Indexes
AssignmentSchema.index({ courseId: 1, week: 1 });
AssignmentSchema.index({ dueDate: 1 });

const Assignment = mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema);

export default Assignment;
