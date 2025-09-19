import mongoose from 'mongoose';
import { User, Course, Lesson, Vocabulary, UserProgress } from '@/lib/models';
import connectDB from '@/lib/mongodb';

// Test database utilities
export class TestDatabase {
  // Clean up test data
  static async cleanup(): Promise<void> {
    try {
      await connectDB();

      // Clear all test collections
      await Promise.all([
        User.deleteMany({ email: { $regex: /test.*@example\.com/ } }),
        Course.deleteMany({ title: { $regex: /^Test/ } }),
        Lesson.deleteMany({ title: { $regex: /^Test/ } }),
        Vocabulary.deleteMany({ romaji: { $regex: /^test/ } }),
        UserProgress.deleteMany({}), // Clear all progress for test users
      ]);

      console.log('✅ Test database cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up test database:', error);
      throw error;
    }
  }

  // Disconnect from test database
  static async disconnect(): Promise<void> {
    await mongoose.disconnect();
  }

  // Generate test ObjectId
  static generateObjectId(): mongoose.Types.ObjectId {
    return new mongoose.Types.ObjectId();
  }

  // Check if we're in test environment
  static isTestEnvironment(): boolean {
    return process.env.NODE_ENV === 'test' ||
           process.env.MONGODB_URI?.includes('test') || false;
  }
}

// Test data factories
export class TestDataFactory {
  // Create test user data
  static createUserData(overrides: Partial<any> = {}) {
    return {
      clerkUserId: `test_clerk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: `test.user.${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      username: `testuser${Date.now()}`,
      currentLevel: 'beginner',
      totalXP: 0,
      streak: 0,
      subscriptionStatus: 'free',
      language: 'en',
      timezone: 'UTC',
      dailyGoal: 15,
      learningGoals: ['travel', 'culture'],
      preferredLearningTime: 'evening',
      notifications: {
        email: true,
        push: true,
        dailyReminder: true,
        streakReminder: true,
      },
      ...overrides,
    };
  }

  // Create test course data
  static createCourseData(overrides: Partial<any> = {}) {
    const timestamp = Date.now();
    return {
      title: `Test Course ${timestamp}`,
      description: 'A test course for learning Japanese',
      slug: `test-course-${timestamp}`,
      difficulty: 'beginner',
      category: 'hiragana',
      tags: ['test', 'beginner'],
      estimatedDuration: 60,
      order: 1,
      isPremium: false,
      isPublished: true,
      createdBy: 'test-admin',
      enrollmentCount: 0,
      rating: 0,
      reviewCount: 0,
      totalLessons: 0,
      ...overrides,
    };
  }

  // Create test lesson data
  static createLessonData(courseId: mongoose.Types.ObjectId, overrides: Partial<any> = {}) {
    const timestamp = Date.now();
    return {
      courseId,
      title: `Test Lesson ${timestamp}`,
      description: 'A test lesson for learning Japanese',
      slug: `test-lesson-${timestamp}`,
      content: [
        {
          type: 'text',
          content: 'This is a test lesson content',
        },
        {
          type: 'interactive',
          content: 'Test interactive content',
        },
      ],
      objectives: [
        {
          id: 'obj1',
          description: 'Learn test content',
          completed: false,
        },
      ],
      order: 1,
      duration: 15,
      difficulty: 'beginner',
      vocabularyIntroduced: [],
      grammarPoints: ['test grammar'],
      isPublished: true,
      isPremium: false,
      prerequisites: [],
      xpReward: 10,
      completionCount: 0,
      averageCompletionTime: 0,
      rating: 0,
      reviewCount: 0,
      createdBy: 'test-admin',
      ...overrides,
    };
  }

  // Create test vocabulary data
  static createVocabularyData(overrides: Partial<any> = {}) {
    const timestamp = Date.now();
    return {
      hiragana: 'てすと',
      katakana: 'テスト',
      kanji: '試験',
      romaji: `test${timestamp}`,
      meaning: 'test',
      bengaliMeaning: 'পরীক্ষা',
      partOfSpeech: 'noun',
      exampleSentences: [
        {
          japanese: 'これはテストです。',
          english: 'This is a test.',
          bengali: 'এটি একটি পরীক্ষা।',
          romaji: 'Kore wa tesuto desu.',
        },
      ],
      difficulty: 'beginner',
      jlptLevel: 'N5',
      category: 'general',
      frequency: 5,
      learningCount: 0,
      masteryCount: 0,
      isPublished: true,
      createdBy: 'test-admin',
      ...overrides,
    };
  }

  // Create test user progress data
  static createUserProgressData(
    userId: mongoose.Types.ObjectId,
    lessonId: mongoose.Types.ObjectId,
    courseId: mongoose.Types.ObjectId,
    overrides: Partial<any> = {}
  ) {
    return {
      userId,
      lessonId,
      courseId,
      status: 'not_started',
      progressPercentage: 0,
      timeSpent: 0,
      attempts: 0,
      lastAccessedAt: new Date(),
      xpEarned: 0,
      objectivesCompleted: [],
      mistakesMade: [],
      reviewCount: 0,
      easeFactor: 2.5,
      interval: 1,
      ...overrides,
    };
  }
}

// Database operation testers
export class DatabaseTester {
  // Test database connection
  static async testConnection(): Promise<boolean> {
    try {
      await connectDB();
      console.log('✅ Database connection test passed');
      return true;
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      return false;
    }
  }

  // Test user CRUD operations
  static async testUserOperations(): Promise<boolean> {
    try {
      console.log('🧪 Testing User CRUD operations...');

      // Create
      const userData = TestDataFactory.createUserData();
      const user = new User(userData);
      await user.save();
      console.log('✅ User creation test passed');

      // Read
      const foundUser = await User.findById(user._id);
      if (!foundUser) throw new Error('User not found after creation');
      console.log('✅ User read test passed');

      // Update
      foundUser.totalXP = 100;
      await foundUser.save();
      const updatedUser = await User.findById(user._id);
      if (updatedUser?.totalXP !== 100) throw new Error('User update failed');
      console.log('✅ User update test passed');

      // Test instance methods
      await foundUser.addXP(50);
      if (foundUser.totalXP !== 150) throw new Error('AddXP method failed');
      console.log('✅ User instance method test passed');

      // Delete
      await User.findByIdAndDelete(user._id);
      const deletedUser = await User.findById(user._id);
      if (deletedUser) throw new Error('User not deleted');
      console.log('✅ User delete test passed');

      return true;
    } catch (error) {
      console.error('❌ User operations test failed:', error);
      return false;
    }
  }

  // Test course and lesson operations
  static async testCourseOperations(): Promise<boolean> {
    try {
      console.log('🧪 Testing Course and Lesson operations...');

      // Create course
      const courseData = TestDataFactory.createCourseData();
      const course = new Course(courseData);
      await course.save();
      console.log('✅ Course creation test passed');

      // Create lesson
      const lessonData = TestDataFactory.createLessonData(course._id);
      const lesson = new Lesson(lessonData);
      await lesson.save();
      console.log('✅ Lesson creation test passed');

      // Test course methods
      await course.incrementEnrollment();
      if (course.enrollmentCount !== 1) throw new Error('Course enrollment increment failed');
      console.log('✅ Course method test passed');

      // Test lesson population
      const populatedLesson = await Lesson.findById(lesson._id).populate('courseId');
      if (!populatedLesson?.courseId) throw new Error('Lesson population failed');
      console.log('✅ Lesson population test passed');

      // Cleanup
      await Lesson.findByIdAndDelete(lesson._id);
      await Course.findByIdAndDelete(course._id);
      console.log('✅ Course and Lesson cleanup completed');

      return true;
    } catch (error) {
      console.error('❌ Course operations test failed:', error);
      return false;
    }
  }

  // Test vocabulary operations
  static async testVocabularyOperations(): Promise<boolean> {
    try {
      console.log('🧪 Testing Vocabulary operations...');

      // Create vocabulary
      const vocabData = TestDataFactory.createVocabularyData();
      const vocab = new Vocabulary(vocabData);
      await vocab.save();
      console.log('✅ Vocabulary creation test passed');

      // Test search functionality
      const searchResults = await Vocabulary.search('test');
      if (searchResults.length === 0) throw new Error('Vocabulary search failed');
      console.log('✅ Vocabulary search test passed');

      // Test instance methods
      await vocab.incrementLearningCount();
      if (vocab.learningCount !== 1) throw new Error('Learning count increment failed');
      console.log('✅ Vocabulary instance method test passed');

      // Cleanup
      await Vocabulary.findByIdAndDelete(vocab._id);

      return true;
    } catch (error) {
      console.error('❌ Vocabulary operations test failed:', error);
      return false;
    }
  }

  // Run all tests
  static async runAllTests(): Promise<boolean> {
    console.log('🚀 Starting database tests...');

    if (!TestDatabase.isTestEnvironment()) {
      console.warn('⚠️ Not in test environment. Skipping tests.');
      return false;
    }

    try {
      const connectionTest = await this.testConnection();
      const userTest = await this.testUserOperations();
      const courseTest = await this.testCourseOperations();
      const vocabularyTest = await this.testVocabularyOperations();

      const allPassed = connectionTest && userTest && courseTest && vocabularyTest;

      if (allPassed) {
        console.log('🎉 All database tests passed!');
      } else {
        console.log('❌ Some database tests failed');
      }

      return allPassed;
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      return false;
    } finally {
      await TestDatabase.cleanup();
    }
  }
}

// Performance testing utilities
export class PerformanceTester {
  // Test query performance
  static async testQueryPerformance(): Promise<void> {
    console.log('🚀 Testing query performance...');

    try {
      // Test user queries
      const start = Date.now();
      await User.find({ subscriptionStatus: 'free' }).limit(100).lean();
      const userQueryTime = Date.now() - start;
      console.log(`User query time: ${userQueryTime}ms`);

      // Test course queries with population
      const start2 = Date.now();
      await Course.find({ isPublished: true }).limit(50).lean();
      const courseQueryTime = Date.now() - start2;
      console.log(`Course query time: ${courseQueryTime}ms`);

      // Test complex aggregation
      const start3 = Date.now();
      await UserProgress.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: '$userId', totalXP: { $sum: '$xpEarned' } } },
        { $limit: 100 }
      ]);
      const aggregationTime = Date.now() - start3;
      console.log(`Aggregation query time: ${aggregationTime}ms`);

    } catch (error) {
      console.error('❌ Performance test failed:', error);
    }
  }

  // Load testing simulation
  static async simulateLoad(concurrentUsers = 10, operationsPerUser = 5): Promise<void> {
    console.log(`🔄 Simulating load: ${concurrentUsers} users, ${operationsPerUser} operations each`);

    const promises: Promise<void>[] = [];

    for (let i = 0; i < concurrentUsers; i++) {
      promises.push(this.simulateUserOperations(i, operationsPerUser));
    }

    const start = Date.now();
    await Promise.all(promises);
    const totalTime = Date.now() - start;

    console.log(`Load test completed in ${totalTime}ms`);
    console.log(`Average time per user: ${totalTime / concurrentUsers}ms`);
  }

  private static async simulateUserOperations(userId: number, operations: number): Promise<void> {
    for (let i = 0; i < operations; i++) {
      // Simulate random operations
      const operation = Math.floor(Math.random() * 3);

      switch (operation) {
        case 0:
          await User.find({ subscriptionStatus: 'free' }).limit(10).lean();
          break;
        case 1:
          await Course.find({ isPublished: true }).limit(5).lean();
          break;
        case 2:
          await Vocabulary.find({ difficulty: 'beginner' }).limit(10).lean();
          break;
      }
    }
  }
}

export default DatabaseTester;