const { MongoClient, ObjectId } = require('mongodb');

async function updateCourseStructure() {
  const uri = "mongodb+srv://japanese:n6vbI2iHkfUe1ZFT@cluster0.xd8rz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('Japanese');
    const courses = db.collection('courses');
    
    const courseId = new ObjectId('6907359f04e2fbae0192d025');
    
    // Update curriculum structure to include required fields
    const updateDoc = {
      $set: {
        'curriculum.modules': [
          {
            _id: new ObjectId(),
            name: 'Introduction to Japanese',
            description: 'Basic introduction to Japanese language and culture',
            order: 1,
            isPublished: true,
            items: [
              {
                _id: new ObjectId(),
                type: 'live-class',
                title: 'Welcome to Japanese Learning',
                description: 'Introduction to the course and Japanese basics',
                scheduledDate: new Date('2024-01-15T10:00:00Z'),
                meetingLink: 'https://zoom.us/j/123456789',
                meetingPlatform: 'zoom',
                duration: 60,
                isPublished: true,
                isFreePreview: true
              },
              {
                _id: new ObjectId(),
                type: 'resource',
                title: 'Hiragana Chart PDF',
                description: 'Complete Hiragana character chart for practice',
                scheduledDate: new Date('2024-01-15T11:00:00Z'),
                resourceType: 'pdf',
                resourceUrl: 'https://example.com/hiragana-chart.pdf',
                isPublished: true,
                isFreePreview: true
              },
              {
                _id: new ObjectId(),
                type: 'live-class',
                title: 'Hiragana Practice Session',
                description: 'Practice reading and writing Hiragana characters',
                scheduledDate: new Date('2024-01-16T10:00:00Z'),
                meetingLink: 'https://zoom.us/j/987654321',
                meetingPlatform: 'zoom',
                duration: 90,
                isPublished: true,
                isFreePreview: false
              }
            ]
          },
          {
            _id: new ObjectId(),
            name: 'Advanced Japanese',
            description: 'Advanced concepts in Japanese language',
            order: 2,
            isPublished: true,
            items: [
              {
                _id: new ObjectId(),
                type: 'live-class',
                title: 'Katakana Introduction',
                description: 'Introduction to Katakana writing system',
                scheduledDate: new Date('2024-01-17T10:00:00Z'),
                meetingLink: 'https://zoom.us/j/111222333',
                meetingPlatform: 'zoom',
                duration: 75,
                isPublished: true,
                isFreePreview: false
              }
            ]
          }
        ]
      }
    };
    
    const result = await courses.updateOne({ _id: courseId }, updateDoc);
    
    if (result.matchedCount > 0) {
      console.log('✅ Course curriculum updated successfully!');
      console.log('Modified count:', result.modifiedCount);
      
      // Fetch updated document
      const updatedCourse = await courses.findOne({ _id: courseId });
      console.log('\nUpdated curriculum structure:');
      console.log('Modules count:', updatedCourse.curriculum.modules.length);
      
      updatedCourse.curriculum.modules.forEach((module, index) => {
        console.log(`\nModule ${index + 1}: ${module.name}`);
        console.log('- Published:', module.isPublished);
        console.log('- Items count:', module.items.length);
        
        module.items.forEach((item, itemIndex) => {
          console.log(`  Item ${itemIndex + 1}: ${item.title}`);
          console.log(`  - Type: ${item.type}`);
          console.log(`  - Published: ${item.isPublished}`);
          console.log(`  - Free Preview: ${item.isFreePreview}`);
        });
      });
      
    } else {
      console.log('❌ Course not found!');
    }
    
  } catch (error) {
    console.error('Error updating course:', error);
  } finally {
    await client.close();
  }
}

updateCourseStructure();