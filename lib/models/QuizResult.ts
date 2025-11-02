import mongoose from 'mongoose';

const QuizResultSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  courseId: {
    type: String,
    required: true,
  },
  quizId: {
    type: String,
    required: true,
  },
  quizTitle: {
    type: String,
    required: true,
  },
  answers: {
    type: Map,
    of: Number,
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  correctAnswers: {
    type: Number,
    required: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0,
  },
}, {
  timestamps: true,
});

// Create compound index for efficient queries
QuizResultSchema.index({ userId: 1, courseId: 1, quizId: 1 }, { unique: true });

const QuizResult = mongoose.models.QuizResult || mongoose.model('QuizResult', QuizResultSchema);

export default QuizResult;