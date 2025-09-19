#!/usr/bin/env ts-node

/**
 * Database Setup Script
 *
 * This script sets up the database with initial data and indexes
 * Usage: npm run setup:db or ts-node scripts/setup-database.ts
 */

import connectDB from '../lib/mongodb';
import { User, Course, Lesson, Vocabulary } from '../lib/models';
import { dbConfig } from '../lib/config/database';
import logger from '../lib/utils/logger';

async function createIndexes() {
  logger.info('Creating database indexes...', 'Setup');

  try {
    // Create indexes for User collection
    await User.collection.createIndex({ clerkUserId: 1 }, { unique: true });
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ totalXP: -1 });
    await User.collection.createIndex({ streak: -1 });

    // Create indexes for Course collection
    await Course.collection.createIndex({ slug: 1 }, { unique: true });
    await Course.collection.createIndex({ difficulty: 1, category: 1 });
    await Course.collection.createIndex({ isPublished: 1, order: 1 });

    // Create indexes for Lesson collection
    await Lesson.collection.createIndex({ courseId: 1, order: 1 });
    await Lesson.collection.createIndex({ slug: 1 }, { unique: true });
    await Lesson.collection.createIndex({ isPublished: 1 });

    // Create indexes for Vocabulary collection
    await Vocabulary.collection.createIndex({ romaji: 1 });
    await Vocabulary.collection.createIndex({ difficulty: 1, category: 1 });
    await Vocabulary.collection.createIndex({ jlptLevel: 1 });

    // Create text search indexes
    await Vocabulary.collection.createIndex({
      romaji: 'text',
      meaning: 'text',
      bengaliMeaning: 'text',
      hiragana: 'text',
      katakana: 'text',
      kanji: 'text',
    });

    logger.info('✅ Database indexes created successfully', 'Setup');
  } catch (error) {
    logger.error('❌ Failed to create indexes', 'Setup', error);
    throw error;
  }
}

async function seedSampleData() {
  logger.info('Seeding sample data...', 'Setup');

  try {
    // Check if data already exists
    const existingCourses = await Course.countDocuments();
    if (existingCourses > 0) {
      logger.info('Sample data already exists, skipping...', 'Setup');
      return;
    }

    // Create sample courses
    const hiraganaBasics = new Course({
      title: 'Hiragana Basics',
      description: 'Learn the fundamental hiragana characters step by step',
      slug: 'hiragana-basics',
      difficulty: 'beginner',
      category: 'hiragana',
      tags: ['hiragana', 'basics', 'writing'],
      estimatedDuration: 120,
      order: 1,
      isPremium: false,
      isPublished: true,
      createdBy: 'system',
    });

    const katakanaBasics = new Course({
      title: 'Katakana Basics',
      description: 'Master katakana characters for foreign words',
      slug: 'katakana-basics',
      difficulty: 'beginner',
      category: 'katakana',
      tags: ['katakana', 'basics', 'writing'],
      estimatedDuration: 120,
      order: 2,
      isPremium: false,
      isPublished: true,
      createdBy: 'system',
    });

    const basicVocabulary = new Course({
      title: 'Basic Japanese Vocabulary',
      description: 'Essential vocabulary for everyday conversation',
      slug: 'basic-vocabulary',
      difficulty: 'beginner',
      category: 'vocabulary',
      tags: ['vocabulary', 'conversation', 'n5'],
      estimatedDuration: 180,
      order: 3,
      isPremium: false,
      isPublished: true,
      createdBy: 'system',
    });

    await Course.insertMany([hiraganaBasics, katakanaBasics, basicVocabulary]);

    // Create sample lessons for hiragana course
    const hiraganaLessons = [
      {
        courseId: hiraganaBasics._id,
        title: 'A, I, U, E, O - Basic Vowels',
        description: 'Learn the five basic vowel sounds in Japanese',
        slug: 'hiragana-vowels',
        content: [
          {
            type: 'text',
            content: 'The Japanese language has five basic vowel sounds. Let\'s learn them one by one.',
          },
          {
            type: 'interactive',
            content: 'Practice writing あ (a), い (i), う (u), え (e), お (o)',
          },
        ],
        objectives: [
          { id: 'obj1', description: 'Recognize all five vowel hiragana', completed: false },
          { id: 'obj2', description: 'Write all five vowel hiragana', completed: false },
        ],
        order: 1,
        duration: 15,
        difficulty: 'beginner',
        vocabularyIntroduced: [],
        grammarPoints: ['vowels'],
        isPublished: true,
        isPremium: false,
        prerequisites: [],
        xpReward: 20,
        createdBy: 'system',
      },
      {
        courseId: hiraganaBasics._id,
        title: 'K-Series: Ka, Ki, Ku, Ke, Ko',
        description: 'Learn the K-series hiragana characters',
        slug: 'hiragana-k-series',
        content: [
          {
            type: 'text',
            content: 'Now let\'s learn the K-series hiragana characters.',
          },
        ],
        objectives: [
          { id: 'obj1', description: 'Recognize K-series hiragana', completed: false },
        ],
        order: 2,
        duration: 20,
        difficulty: 'beginner',
        vocabularyIntroduced: [],
        grammarPoints: ['k-series'],
        isPublished: true,
        isPremium: false,
        prerequisites: [],
        xpReward: 25,
        createdBy: 'system',
      },
    ];

    await Lesson.insertMany(hiraganaLessons);

    // Create sample vocabulary
    const sampleVocabulary = [
      {
        hiragana: 'あい',
        romaji: 'ai',
        meaning: 'love',
        bengaliMeaning: 'ভালোবাসা',
        partOfSpeech: 'noun',
        exampleSentences: [
          {
            japanese: 'あいが大切です。',
            english: 'Love is important.',
            bengali: 'ভালোবাসা গুরুত্বপূর্ণ।',
            romaji: 'Ai ga taisetsu desu.',
          },
        ],
        difficulty: 'beginner',
        jlptLevel: 'N5',
        category: 'emotions',
        frequency: 8,
        isPublished: true,
        createdBy: 'system',
      },
      {
        hiragana: 'いえ',
        romaji: 'ie',
        meaning: 'house',
        bengaliMeaning: 'বাড়ি',
        partOfSpeech: 'noun',
        exampleSentences: [
          {
            japanese: 'いえに帰ります。',
            english: 'I will go home.',
            bengali: 'আমি বাড়ি যাব।',
            romaji: 'Ie ni kaerimasu.',
          },
        ],
        difficulty: 'beginner',
        jlptLevel: 'N5',
        category: 'home',
        frequency: 9,
        isPublished: true,
        createdBy: 'system',
      },
    ];

    await Vocabulary.insertMany(sampleVocabulary);

    logger.info('✅ Sample data seeded successfully', 'Setup');
  } catch (error) {
    logger.error('❌ Failed to seed sample data', 'Setup', error);
    throw error;
  }
}

async function validateSetup() {
  logger.info('Validating database setup...', 'Setup');

  try {
    // Check collections exist and have data
    const userCount = await User.countDocuments();
    const courseCount = await Course.countDocuments();
    const lessonCount = await Lesson.countDocuments();
    const vocabCount = await Vocabulary.countDocuments();

    logger.info('Database statistics:', 'Setup', {
      users: userCount,
      courses: courseCount,
      lessons: lessonCount,
      vocabulary: vocabCount,
    });

    // Test a simple query
    const publishedCourses = await Course.find({ isPublished: true }).countDocuments();
    logger.info(`Found ${publishedCourses} published courses`, 'Setup');

    logger.info('✅ Database setup validation completed', 'Setup');
  } catch (error) {
    logger.error('❌ Database validation failed', 'Setup', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Japanese Shikhi - Database Setup Script');
  console.log('='.repeat(50));

  try {
    // Connect to database
    await connectDB();
    logger.info('Connected to database', 'Setup');

    // Create indexes
    await createIndexes();

    // Seed sample data
    await seedSampleData();

    // Validate setup
    await validateSetup();

    logger.info('🎉 Database setup completed successfully!', 'Setup');
    process.exit(0);

  } catch (error) {
    logger.error('💥 Database setup failed', 'Setup', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}