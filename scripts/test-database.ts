#!/usr/bin/env ts-node

/**
 * Database Testing Script
 *
 * This script can be run to test the MongoDB integration
 * Usage: npm run test:db or ts-node scripts/test-database.ts
 */

import { DatabaseTester, PerformanceTester, TestDatabase } from '../lib/utils/test-helpers';

async function main() {
  console.log('🧪 Japanese Shikhi - Database Testing Script');
  console.log('='.repeat(50));

  try {
    // Set test environment
    process.env.NODE_ENV = 'test';

    // Check if we have a test database connection
    if (!process.env.MONGODB_URI?.includes('test')) {
      console.warn('⚠️ Warning: Not using a test database!');
      console.warn('Please set MONGODB_URI to a test database to run these tests safely.');
      process.exit(1);
    }

    // Run all database tests
    const testsPassed = await DatabaseTester.runAllTests();

    if (testsPassed) {
      console.log('\n🎯 Running performance tests...');
      await PerformanceTester.testQueryPerformance();

      console.log('\n🚀 Running load simulation...');
      await PerformanceTester.simulateLoad(5, 3);
    }

    // Final cleanup
    await TestDatabase.cleanup();
    await TestDatabase.disconnect();

    if (testsPassed) {
      console.log('\n✅ All tests completed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Some tests failed!');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 Test script failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}