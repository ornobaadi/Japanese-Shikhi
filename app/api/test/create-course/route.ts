import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/lib/models/Course';

export async function POST() {
  try {
    await connectToDatabase();
    
    console.log('Creating test course...');
    
    // Create a simple test course
    const testCourse = new Course({
      title: "Japanese Basics - Test Course",
      description: "A test course to verify the system is working properly. Learn basic Japanese characters and words.",
      level: "beginner", 
      category: "language",
      estimatedDuration: 30, // 30 minutes
      difficulty: 1,
      isPremium: false,
      isPublished: true, // Make it published so it shows on landing page
      learningObjectives: [
        "Learn basic Hiragana characters",
        "Understand simple Japanese words",
        "Practice basic pronunciation"
      ],
      links: [],
      thumbnailUrl: "",
      instructorNotes: "This is a test course created via API",
      courseSummary: "Basic Japanese learning course for testing",
      lessons: [],
      totalLessons: 0,
      averageRating: 0,
      totalRatings: 0,
      enrolledStudents: 0,
      completionRate: 0,
      courseLanguage: {
        primary: 'japanese',
        secondary: 'english'
      },
      tags: ['japanese', 'beginner', 'test', 'hiragana'],
      // Add free preview functionality
      allowFreePreview: true,
      freePreviewCount: 2,
      curriculum: [
        {
          title: "Introduction to Hiragana",
          type: "video",
          resourceType: "youtube", 
          resourceUrl: "https://youtube.com/watch?v=example1",
          duration: 10,
          isFreePreview: true // Free video
        },
        {
          title: "Basic Hiragana Practice", 
          type: "video",
          resourceType: "youtube",
          resourceUrl: "https://youtube.com/watch?v=example2", 
          duration: 15,
          isFreePreview: true // Free video
        },
        {
          title: "Advanced Hiragana",
          type: "video", 
          resourceType: "youtube",
          resourceUrl: "https://youtube.com/watch?v=example3",
          duration: 20,
          isFreePreview: false // Locked video
        }
      ],
      metadata: {
        version: '1.0.0',
        lastUpdated: new Date(),
        createdBy: 'system-test'
      }
    });

    const savedCourse = await testCourse.save();
    console.log('Test course created successfully:', savedCourse._id);

    return NextResponse.json({
      success: true,
      message: 'Test course created successfully!',
      courseId: savedCourse._id,
      course: {
        title: savedCourse.title,
        isPublished: savedCourse.isPublished,
        allowFreePreview: savedCourse.allowFreePreview
      }
    });
    
  } catch (error: any) {
    console.error('Error creating test course:', error);
    return NextResponse.json({
      success: false, 
      error: 'Failed to create test course',
      details: error.message
    }, { status: 500 });
  }
}