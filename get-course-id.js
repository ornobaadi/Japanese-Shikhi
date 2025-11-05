const { MongoClient } = require('mongodb');

async function getCourseId() {
  const uri = "mongodb+srv://japanese:n6vbI2iHkfUe1ZFT@cluster0.xd8rz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('Japanese');
    const courses = db.collection('courses');
    
    // Find all published courses
    const publishedCourses = await courses.find({ isPublished: true }).toArray();
    
    console.log('Published courses found:', publishedCourses.length);
    
    publishedCourses.forEach((course, index) => {
      console.log(`Course ${index + 1}:`);
      console.log('- ID:', course._id.toString());
      console.log('- Title:', course.title);
      console.log('- Test URL: http://localhost:3001/courses/' + course._id.toString() + '/curriculum');
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

getCourseId();