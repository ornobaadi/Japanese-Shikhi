import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import connectToDatabase from '../lib/mongodb';
import User from '../lib/models/User';
import Course from '../lib/models/Course';
import Vocabulary from '../lib/models/Vocabulary';

async function testDatabaseConnection() {
  try {
    console.log('🔄 Testing MongoDB Atlas connection...');

    // Test connection
    await connectToDatabase();
    console.log('✅ Database connection successful');

    // Test User model
    console.log('\n🔄 Testing User model...');
    const testUser = new User({
      clerkUserId: 'test_user_123',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      nativeLanguage: 'English',
      currentLevel: 'beginner',
      learningGoals: ['Learn basic Japanese']
    });

    // Validate without saving
    await testUser.validate();
    console.log('✅ User model validation successful');

    // Test Course model
    console.log('\n🔄 Testing Course model...');
    const testCourse = new Course({
      title: 'Basic Japanese Greetings',
      description: 'Learn essential Japanese greetings',
      level: 'beginner',
      category: 'vocabulary',
      estimatedDuration: 30,
      difficulty: 2,
      learningObjectives: ['Learn basic greetings', 'Practice pronunciation'],
      metadata: {
        createdBy: 'test_user_123'
      }
    });

    await testCourse.validate();
    console.log('✅ Course model validation successful');

    // Test Vocabulary model
    console.log('\n🔄 Testing Vocabulary model...');
    const testVocab = new Vocabulary({
      word: 'こんにちは',
      hiragana: 'こんにちは',
      romaji: 'konnichiwa',
      meanings: {
        english: ['hello', 'good afternoon']
      },
      partOfSpeech: ['expression'],
      frequency: 10,
      difficulty: 1,
      wordType: 'vocabulary',
      jlptLevel: 'N5',
      metadata: {
        addedBy: 'test_user_123',
        source: 'test'
      }
    });

    await testVocab.validate();
    console.log('✅ Vocabulary model validation successful');

    console.log('\n🎉 All database tests passed successfully!');
    console.log('\n📋 Summary:');
    console.log('- MongoDB Atlas connection: ✅');
    console.log('- User model: ✅');
    console.log('- Course model: ✅');
    console.log('- Vocabulary model: ✅');

  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

// Run the test
testDatabaseConnection();