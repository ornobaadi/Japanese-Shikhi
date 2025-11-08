import { NextRequest, NextResponse } from 'next/server';
import { 
  CourseManagement, 
  Course,
  type ICourseManagement,
  type CourseManagementData,
  connectDB 
} from '@/lib/models';
import { auth } from '@clerk/nextjs/server';

// GET /api/admin/courses/[id]/management
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Verify course exists
    const course = await Course.findById(params.id);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Get or create course management data
    let courseManagement = await CourseManagement.findOne({ courseId: params.id });

    if (!courseManagement) {
      // Create initial course management data if it doesn't exist
      const initialWeeklyContent = Array.from({ length: 4 }, (_, index) => ({
        id: `week-${index + 1}`,
        week: index + 1,
        title: `Week ${index + 1}`,
        description: '',
        videoLinks: [],
        documents: [],
        comments: '',
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      courseManagement = new CourseManagement({
        courseId: params.id,
        courseName: course.title,
        weeklyContent: initialWeeklyContent,
        classLinks: [],
        blogPosts: [],
        enrolledStudents: [],
        settings: {
          allowStudentComments: true,
          autoPublishContent: false,
          requireInstructorApproval: true,
          emailNotifications: true,
          maxStudentsPerClass: 50
        },
        statistics: {
          totalVideos: 0,
          totalDocuments: 0,
          totalClasses: 0,
          totalBlogs: 0,
          totalStudents: 0,
          averageProgress: 0,
          lastUpdated: new Date()
        }
      });

      await courseManagement.save();
    }

    return NextResponse.json({
      success: true,
      data: courseManagement
    });

  } catch (error) {
    console.error('Error fetching course management data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/courses/[id]/management
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    console.log('POST /api/admin/courses/[id]/management called with courseId:', params.id);
    
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      console.log('Unauthorized - no userId');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Verify course exists
    const course = await Course.findById(params.id);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const managementData: CourseManagementData = await request.json();
    console.log('🔥 API ENDPOINT CALLED!');
    console.log('📍 Course ID from params:', params.id);
    console.log('📦 Received management data:', JSON.stringify(managementData, null, 2));

    // Validate required fields
    if (!managementData.courseName) {
      console.log('Missing course name in request');
      return NextResponse.json(
        { error: 'Course name is required' },
        { status: 400 }
      );
    }

    // Add timestamps to nested objects
    const processedData = {
      ...managementData,
      weeklyContent: managementData.weeklyContent?.map(week => ({
        ...week,
        videoLinks: week.videoLinks?.map(video => ({
          ...video,
          createdAt: video.createdAt || new Date(),
          updatedAt: new Date()
        })) || [],
        documents: week.documents?.map(doc => ({
          ...doc,
          createdAt: doc.createdAt || new Date(),
          updatedAt: new Date(),
          uploadedAt: doc.uploadedAt || new Date()
        })) || [],
        createdAt: week.createdAt || new Date(),
        updatedAt: new Date()
      })) || [],
      classLinks: managementData.classLinks?.map(link => ({
        ...link,
        createdAt: link.createdAt || new Date(),
        updatedAt: new Date()
      })) || [],
      blogPosts: managementData.blogPosts?.map(post => ({
        ...post,
        createdAt: post.createdAt || new Date(),
        updatedAt: new Date(),
        // Generate slug if not provided
        slug: post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      })) || [],
      enrolledStudents: managementData.enrolledStudents?.map(student => ({
        ...student,
        createdAt: student.createdAt || new Date(),
        updatedAt: new Date()
      })) || []
    };

    // Update or create course management data
    const courseManagement = await CourseManagement.findOneAndUpdate(
      { courseId: params.id },
      {
        courseId: params.id,
        courseName: processedData.courseName,
        weeklyContent: processedData.weeklyContent,
        classLinks: processedData.classLinks,
        blogPosts: processedData.blogPosts,
        enrolledStudents: processedData.enrolledStudents,
        updatedAt: new Date()
      },
      { 
        upsert: true, 
        new: true,
        runValidators: true
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Course management data saved successfully',
      data: courseManagement
    });

  } catch (error: any) {
    console.error('Error saving course management data:', error);
    
    // Handle validation errors
    if (error?.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors || {}).map((err: any) => err?.message || 'Validation error');
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationErrors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/courses/[id]/management - Update specific sections
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Parse request body
    const { section, data } = await request.json();

    if (!section || !data) {
      return NextResponse.json(
        { error: 'Section and data are required' },
        { status: 400 }
      );
    }

    // Verify course management exists
    const courseManagement = await CourseManagement.findOne({ courseId: params.id });
    if (!courseManagement) {
      return NextResponse.json(
        { error: 'Course management data not found' },
        { status: 404 }
      );
    }

    // Update specific section
    const updateData: any = {};
    switch (section) {
      case 'weeklyContent':
        updateData.weeklyContent = data;
        break;
      case 'classLinks':
        updateData.classLinks = data;
        break;
      case 'blogPosts':
        updateData.blogPosts = data;
        break;
      case 'enrolledStudents':
        updateData.enrolledStudents = data;
        break;
      case 'settings':
        updateData.settings = { ...courseManagement.settings, ...data };
        break;
      default:
        return NextResponse.json(
          { error: `Invalid section: ${section}` },
          { status: 400 }
        );
    }

    updateData.updatedAt = new Date();

    const updatedCourseManagement = await CourseManagement.findOneAndUpdate(
      { courseId: params.id },
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: `${section} updated successfully`,
      data: updatedCourseManagement
    });

  } catch (error) {
    console.error('Error updating course management data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/courses/[id]/management
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Delete course management data
    const deletedCourseManagement = await CourseManagement.findOneAndDelete({ 
      courseId: params.id 
    });

    if (!deletedCourseManagement) {
      return NextResponse.json(
        { error: 'Course management data not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Course management data deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting course management data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}