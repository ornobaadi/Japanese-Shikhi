const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkRhgethCourse() {
  const client = new MongoClient(process.env.MONGODB_URI);
  const dbName = process.env.DB_NAME || 'Japanese';
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
  const db = client.db(dbName);
    const coursesCollection = db.collection('courses');
    
    // Find all courses
    const allCourses = await coursesCollection.find({}).toArray();
    
    console.log('\n=== ALL COURSES ===');
    allCourses.forEach((c, idx) => {
      console.log(`\n${idx + 1}. Course:`);
      console.log('   _id:', c._id);
      console.log('   title:', c.title);
      console.log('   level:', c.level);
      console.log('   has curriculum:', !!c.curriculum);
    });
    
    // Find rhgeth course (case insensitive)
    const course = await coursesCollection.findOne({ 
      title: { $regex: /rhgeth/i } 
    });
    
    if (!course) {
      console.log('\nCourse with "rhgeth" not found!');
      return;
    }
    
    console.log('\n=== RHGETH COURSE DATA ===');
    console.log('_id:', course._id);
    console.log('_id type:', typeof course._id);
    console.log('title:', course.title);
    console.log('level:', course.level);
    console.log('category:', course.category);
    console.log('isPremium:', course.isPremium);
    console.log('isPublished:', course.isPublished);
    console.log('\n=== CURRICULUM ===');
    console.log('curriculum exists:', !!course.curriculum);
    if (course.curriculum) {
      console.log('curriculum type:', typeof course.curriculum);
      console.log('curriculum structure:', JSON.stringify(course.curriculum, null, 2));
    }
    
    console.log('\n=== FULL COURSE OBJECT ===');
    console.log(JSON.stringify(course, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkRhgethCourse();
