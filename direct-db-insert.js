const { MongoClient } = require('mongodb');

async function addTestCourse() {
  const uri = "mongodb+srv://japanese:n6vbI2iHkfUe1ZFT@cluster0.xd8rz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('Japanese');
    const courses = db.collection('courses');
    
    const testCourse = {
      title: "Japanese Basics - Backend Test",
      description: "A test course created directly from backend to verify the system works",
      level: "beginner",
      category: "language", 
      estimatedDuration: 45,
      difficulty: 1,
      isPremium: false,
      isPublished: true, // Important: Published so it shows on landing page
      learningObjectives: [
        "Learn Hiragana basics",
        "Practice Japanese pronunciation", 
        "Understand basic vocabulary"
      ],
      links: [],
      thumbnailUrl: "",
      instructorNotes: "Backend test course",
      courseSummary: "Test course for debugging",
      lessons: [],
      totalLessons: 3,
      averageRating: 0,
      totalRatings: 0, 
      enrolledStudents: 0,
      completionRate: 0,
      courseLanguage: {
        primary: "japanese",
        secondary: "english"
      },
      tags: ["japanese", "beginner", "test"],
      allowFreePreview: true,
      freePreviewCount: 2,
      curriculum: [
        {
          title: "Introduction",
          type: "video",
          resourceType: "youtube",
          resourceUrl: "https://youtube.com/watch?v=test1",
          duration: 15,
          isFreePreview: true
        },
        {
          title: "Basic Practice", 
          type: "video",
          resourceType: "youtube", 
          resourceUrl: "https://youtube.com/watch?v=test2",
          duration: 20,
          isFreePreview: true
        },
        {
          title: "Advanced Topics",
          type: "video",
          resourceType: "youtube",
          resourceUrl: "https://youtube.com/watch?v=test3", 
          duration: 25,
          isFreePreview: false
        }
      ],
      metadata: {
        version: "1.0.0",
        lastUpdated: new Date(),
        createdBy: "backend-script"
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await courses.insertOne(testCourse);
    console.log('Course created successfully!');
    console.log('Course ID:', result.insertedId);
    console.log('Course Title:', testCourse.title);
    console.log('Is Published:', testCourse.isPublished);
    
    // Verify by finding all published courses
    const publishedCourses = await courses.find({ isPublished: true }).toArray();
    console.log('Total published courses:', publishedCourses.length);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

addTestCourse();