const { MongoClient } = require('mongodb');

async function checkCurriculum() {
  const uri = 'mongodb+srv://japanese:n6vbI2iHkfUe1ZFT@cluster0.xd8rz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('Japanese');
    const courses = db.collection('courses');
    
    // Get all courses with curriculum
    const allCourses = await courses.find({ 'curriculum.modules': { $exists: true } }).toArray();
    
    console.log('\nFound', allCourses.length, 'courses with curriculum');
    
    for (const course of allCourses) {
      console.log('\n========================================');
      console.log('Course:', course.title);
      console.log('Curriculum modules:', course.curriculum?.modules?.length || 0);
      
      course.curriculum?.modules?.forEach((mod, modIdx) => {
        console.log('\n  Module', modIdx, ':', mod.name);
        mod.items?.forEach((item, itemIdx) => {
          console.log('    Item', itemIdx, ':', item.title, '- Type:', item.type);
          console.log('      attachments count:', item.attachments?.length || 0);
          if (item.attachments && item.attachments.length > 0) {
            item.attachments.forEach((att, attIdx) => {
              console.log('        Attachment', attIdx, ':', att.name, '- URL length:', att.url?.length || 0);
            });
          }
          console.log('      driveLinks count:', item.driveLinks?.length || 0);
        });
      });
    }
  } finally {
    await client.close();
  }
}

checkCurriculum().catch(console.error);
