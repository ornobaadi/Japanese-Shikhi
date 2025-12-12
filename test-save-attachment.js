const { MongoClient, ObjectId } = require('mongodb');

async function testSaveAttachment() {
  const uri = 'mongodb+srv://japanese:n6vbI2iHkfUe1ZFT@cluster0.xd8rz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('Japanese');
    const courses = db.collection('courses');
    
    // Find the N5 course
    const course = await courses.findOne({ title: 'N5' });
    
    if (!course) {
      console.log('N5 course not found');
      return;
    }
    
    console.log('Found course:', course.title);
    console.log('Current modules:', course.curriculum?.modules?.length);
    
    // Add a test attachment to the first item
    const testAttachment = {
      url: '/uploads/test_file.pdf',
      name: 'test_file.pdf',
      type: 'application/pdf'
    };
    
    // Update the first item in the first module with attachments
    if (course.curriculum?.modules?.[0]?.items?.[0]) {
      const result = await courses.updateOne(
        { _id: course._id },
        { 
          $set: { 
            'curriculum.modules.0.items.0.attachments': [testAttachment],
            'curriculum.modules.0.items.0.driveLinks': []
          } 
        }
      );
      
      console.log('Update result:', result);
      
      // Verify
      const updated = await courses.findOne({ _id: course._id });
      console.log('After update - attachments:', updated.curriculum.modules[0].items[0].attachments);
    }
  } finally {
    await client.close();
  }
}

testSaveAttachment().catch(console.error);
