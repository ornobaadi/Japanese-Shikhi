import mongoose, { Schema, Document } from 'mongoose';

export interface IVocabulary extends Document {
  word: string; // Main word (kanji if applicable)
  hiragana?: string;
  katakana?: string;
  romaji: string;
  meanings: {
    english: string[];
    bengali?: string[];
    definition?: string;
  };
  partOfSpeech: string[]; // noun, verb, adjective, etc.
  jlptLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  frequency: number; // 1-10 (how common the word is)
  difficulty: number; // 1-10
  wordType: 'vocabulary' | 'kanji' | 'phrase' | 'expression';
  audioUrl?: string;
  exampleSentences: {
    japanese: string;
    romaji: string;
    english: string;
    bengali?: string;
  }[];
  relatedWords: mongoose.Types.ObjectId[];
  tags: string[];
  usage: {
    formal: boolean;
    informal: boolean;
    written: boolean;
    spoken: boolean;
    contexts: string[]; // business, casual, academic, etc.
  };
  etymology?: {
    origin: string;
    explanation: string;
  };
  conjugations?: {
    form: string; // past, present, potential, etc.
    japanese: string;
    romaji: string;
    english: string;
  }[];
  mnemonics?: {
    text: string;
    imageUrl?: string;
    type: 'visual' | 'story' | 'association';
  }[];
  statistics: {
    timesStudied: number;
    averageAccuracy: number;
    lastStudied?: Date;
    masteryLevel: number; // 0-100
  };
  metadata: {
    source: string; // textbook, jlpt, custom, etc.
    dateAdded: Date;
    addedBy: string;
    verified: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const VocabularySchema = new Schema<IVocabulary>({
  word: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  hiragana: {
    type: String,
    trim: true,
    maxlength: 200
  },
  katakana: {
    type: String,
    trim: true,
    maxlength: 200
  },
  romaji: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 200
  },
  meanings: {
    english: {
      type: [String],
      required: true,
      validate: {
        validator: function(meanings: string[]) {
          return meanings.length >= 1 && meanings.length <= 10;
        },
        message: 'Word must have 1-10 English meanings'
      }
    },
    bengali: [String],
    definition: {
      type: String,
      maxlength: 500
    }
  },
  partOfSpeech: {
    type: [String],
    required: true,
    enum: [
      'noun', 'verb', 'adjective', 'adverb', 'particle', 'pronoun',
      'conjunction', 'interjection', 'counter', 'prefix', 'suffix',
      'expression', 'phrase'
    ]
  },
  jlptLevel: {
    type: String,
    enum: ['N5', 'N4', 'N3', 'N2', 'N1'],
    index: true
  },
  frequency: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 5
  },
  difficulty: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 5
  },
  wordType: {
    type: String,
    enum: ['vocabulary', 'kanji', 'phrase', 'expression'],
    required: true,
    index: true
  },
  audioUrl: String,
  exampleSentences: [{
    japanese: {
      type: String,
      required: true,
      maxlength: 500
    },
    romaji: {
      type: String,
      required: true,
      maxlength: 1000
    },
    english: {
      type: String,
      required: true,
      maxlength: 500
    },
    bengali: {
      type: String,
      maxlength: 500
    }
  }],
  relatedWords: [{
    type: Schema.Types.ObjectId,
    ref: 'Vocabulary'
  }],
  tags: {
    type: [String],
    default: [],
    index: true
  },
  usage: {
    formal: {
      type: Boolean,
      default: true
    },
    informal: {
      type: Boolean,
      default: true
    },
    written: {
      type: Boolean,
      default: true
    },
    spoken: {
      type: Boolean,
      default: true
    },
    contexts: {
      type: [String],
      default: ['general']
    }
  },
  etymology: {
    origin: String,
    explanation: {
      type: String,
      maxlength: 1000
    }
  },
  conjugations: [{
    form: {
      type: String,
      required: true
    },
    japanese: {
      type: String,
      required: true
    },
    romaji: {
      type: String,
      required: true
    },
    english: {
      type: String,
      required: true
    }
  }],
  mnemonics: [{
    text: {
      type: String,
      required: true,
      maxlength: 500
    },
    imageUrl: String,
    type: {
      type: String,
      enum: ['visual', 'story', 'association'],
      required: true
    }
  }],
  statistics: {
    timesStudied: {
      type: Number,
      default: 0,
      min: 0
    },
    averageAccuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastStudied: Date,
    masteryLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  metadata: {
    source: {
      type: String,
      required: true,
      default: 'custom'
    },
    dateAdded: {
      type: Date,
      default: Date.now
    },
    addedBy: {
      type: String,
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
VocabularySchema.index({ word: 1, romaji: 1 });
VocabularySchema.index({ jlptLevel: 1, difficulty: 1 });
VocabularySchema.index({ wordType: 1, frequency: -1 });
VocabularySchema.index({ tags: 1 });
VocabularySchema.index({ 'metadata.verified': 1 });
VocabularySchema.index({ 'statistics.masteryLevel': 1 });

// Text search index
VocabularySchema.index({
  word: 'text',
  hiragana: 'text',
  katakana: 'text',
  romaji: 'text',
  'meanings.english': 'text',
  'meanings.bengali': 'text'
});

// Compound indexes for common queries
VocabularySchema.index({ jlptLevel: 1, wordType: 1, difficulty: 1 });
VocabularySchema.index({ frequency: -1, difficulty: 1, jlptLevel: 1 });

// Virtual for display reading (hiragana or katakana)
VocabularySchema.virtual('reading').get(function() {
  return this.hiragana || this.katakana || this.romaji;
});

// Virtual for primary meaning
VocabularySchema.virtual('primaryMeaning').get(function() {
  return this.meanings.english[0] || 'No meaning available';
});

// Virtual for difficulty label
VocabularySchema.virtual('difficultyLabel').get(function() {
  if (this.difficulty <= 2) return 'Very Easy';
  if (this.difficulty <= 4) return 'Easy';
  if (this.difficulty <= 6) return 'Medium';
  if (this.difficulty <= 8) return 'Hard';
  return 'Very Hard';
});

// Virtual for mastery status
VocabularySchema.virtual('masteryStatus').get(function() {
  const level = this.statistics.masteryLevel;
  if (level >= 90) return 'Mastered';
  if (level >= 70) return 'Good';
  if (level >= 50) return 'Learning';
  if (level >= 20) return 'Weak';
  return 'New';
});

// Method to update mastery level based on accuracy
VocabularySchema.methods.updateMastery = function(accuracy: number) {
  const currentMastery = this.statistics.masteryLevel;
  const weight = 0.2; // How much this attempt affects overall mastery

  if (accuracy >= 80) {
    this.statistics.masteryLevel = Math.min(100, currentMastery + (accuracy - 50) * weight);
  } else {
    this.statistics.masteryLevel = Math.max(0, currentMastery - (50 - accuracy) * weight);
  }

  this.statistics.timesStudied += 1;
  this.statistics.lastStudied = new Date();

  // Update average accuracy
  const totalAccuracy = this.statistics.averageAccuracy * (this.statistics.timesStudied - 1) + accuracy;
  this.statistics.averageAccuracy = totalAccuracy / this.statistics.timesStudied;
};

// Method to get spaced repetition interval
VocabularySchema.methods.getNextReviewDate = function() {
  const masteryLevel = this.statistics.masteryLevel;
  const baseInterval = 1; // days

  let multiplier = 1;
  if (masteryLevel >= 90) multiplier = 30; // Monthly review for mastered words
  else if (masteryLevel >= 70) multiplier = 14; // Bi-weekly
  else if (masteryLevel >= 50) multiplier = 7;  // Weekly
  else if (masteryLevel >= 20) multiplier = 3;  // Every 3 days
  else multiplier = 1; // Daily for new/weak words

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + baseInterval * multiplier);
  return nextReview;
};

// Static method to find words for review
VocabularySchema.statics.findDueForReview = function(userId: string, limit = 20) {
  // This would integrate with UserProgress to find words due for review
  const today = new Date();
  return this.find({
    'metadata.addedBy': userId,
    $or: [
      { 'statistics.lastStudied': { $exists: false } },
      { 'statistics.lastStudied': { $lte: today } }
    ]
  })
  .sort({ 'statistics.masteryLevel': 1, 'statistics.lastStudied': 1 })
  .limit(limit);
};

// Static method to find words by JLPT level
VocabularySchema.statics.findByJLPTLevel = function(level: string, limit = 100) {
  return this.find({
    jlptLevel: level,
    'metadata.verified': true
  })
  .sort({ frequency: -1, difficulty: 1 })
  .limit(limit);
};

export default mongoose.models.Vocabulary || mongoose.model<IVocabulary>('Vocabulary', VocabularySchema);