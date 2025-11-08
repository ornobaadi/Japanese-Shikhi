const { MongoClient, ObjectId } = require('mongodb');

async function checkCourseStructure() {
  const uri = "mongodb+srv://japanese:n6vbI2iHkfUe1ZFT@cluster0.xd8rz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('Japanese');
    const courses = db.collection('courses');
    
    const courseId = new ObjectId('6907359f04e2fbae0192d025');
    const course = await courses.findOne({ _id: courseId });
    
    if (course) {
      console.log('Current course structure:');
      console.log('Title:', course.title);
      console.log('Curriculum type:', typeof course.curriculum);
      console.log('Curriculum is array:', Array.isArray(course.curriculum));
      console.log('\nCurrent curriculum:');
      console.log(JSON.stringify(course.curriculum, null, 2));
    } else {
      console.log('Course not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkCourseStructure();