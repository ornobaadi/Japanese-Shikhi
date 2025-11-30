import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/lib/models/Course';

export async function POST() {
  try {
    await connectToDatabase();

    const testCourse = new Course({
      title: "Japanese Modules Test Course",
      description: "Course with modules and items to test free preview behavior",
      level: "beginner",
      category: "language",
      estimatedDuration: 60,
      difficulty: 1,
      isPremium: false,
      isPublished: true,
      learningObjectives: ["Intro", "Practice"],
      links: [],
      thumbnailUrl: "",
      instructorNotes: "Test course",
      tags: ['test', 'modules'],
      allowFreePreview: true,
      freePreviewCount: 2,
      curriculum: {
        modules: [
          {
            name: 'Module 1',
            description: 'Intro module',
            isPublished: true,
            order: 0,
            items: [
              {
                title: 'Intro Video',
                type: 'resource',
                resourceType: 'video',
                resourceUrl: 'https://example.com/video1.mp4',
                duration: 5,
                scheduledDate: new Date(),
                isPublished: true,
                isFreePreview: true
              },
              {
                title: 'Intro PDF',
                type: 'resource',
                resourceType: 'pdf',
                resourceUrl: 'https://example.com/doc1.pdf',
                duration: 0,
                scheduledDate: new Date(),
                isPublished: true,
                isFreePreview: true
              },
              {
                title: 'Locked Video',
                type: 'resource',
                resourceType: 'video',
                resourceUrl: 'https://example.com/video2.mp4',
                duration: 10,
                scheduledDate: new Date(),
                isPublished: true,
                isFreePreview: false
              }
            ]
          }
        ]
      },
      metadata: { version: '1.0.0', lastUpdated: new Date(), createdBy: 'test-endpoint' }
    });

    const saved = await testCourse.save();

    return NextResponse.json({ success: true, courseId: saved._id, title: saved.title, allowFreePreview: saved.allowFreePreview });
  } catch (err: any) {
    console.error('Error creating modules test course:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
