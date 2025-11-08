// Test script to create a course
async function testCourseCreation() {
  const testCourse = {
    title: "Test Japanese Course",
    description: "This is a test course for debugging",
    level: "beginner",
    category: "language",
    estimatedDuration: "60",
    difficulty: "1", 
    isPremium: false,
    isPublished: true,
    learningObjectives: ["Learn Hiragana", "Learn basic greetings"],
    links: [],
    thumbnailUrl: "",
    instructorNotes: "Test notes",
    courseSummary: "Test summary"
  };

  try {
    const response = await fetch('http://localhost:3001/api/admin/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCourse)
    });

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testCourseCreation();