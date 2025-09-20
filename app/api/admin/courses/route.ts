import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/lib/models/Course';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin by fetching user data directly
    try {
      const user = await (await clerkClient()).users.getUser(userId);
      const isAdmin = (user.publicMetadata as any)?.role === 'admin';
      
      if (!isAdmin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    } catch (error) {
      console.error('Error fetching user data in API:', error);
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const level = searchParams.get('level') || '';
    const category = searchParams.get('category') || '';

    // Build filter query
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (status === 'published') filter.isPublished = true;
    if (status === 'draft') filter.isPublished = false;
    if (level && level !== 'all') filter.level = level;
    if (category && category !== 'all') filter.category = category;

    // Get total count for pagination
    const totalCourses = await Course.countDocuments(filter);
    const publishedCourses = await Course.countDocuments({ isPublished: true });
    const draftCourses = await Course.countDocuments({ isPublished: false });

    // Get paginated courses
    const courses = await Course.find(filter)
      .select('title description level category difficulty isPremium isPublished createdAt enrolledStudents averageRating totalRatings estimatedDuration thumbnailUrl')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Calculate total pages
    const totalPages = Math.ceil(totalCourses / limit);

    return NextResponse.json({
      courses,
      pagination: {
        currentPage: page,
        totalPages,
        totalCourses,
        limit
      },
      stats: {
        total: totalCourses,
        published: publishedCourses,
        draft: draftCourses
      }
    });
  } catch (error) {
    console.error('Error fetching admin course data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin by fetching user data directly
    try {
      const user = await (await clerkClient()).users.getUser(userId);
      const isAdmin = (user.publicMetadata as any)?.role === 'admin';
      
      if (!isAdmin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    } catch (error) {
      console.error('Error fetching user data in API:', error);
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      level, 
      category, 
      estimatedDuration, 
      difficulty,
      isPremium,
      isPublished,
      learningObjectives,
      prerequisites,
      tags,
      thumbnailUrl,
      instructorNotes
    } = body;

    // Validation
    if (!title || !description || !level || !category || !estimatedDuration || !difficulty || !learningObjectives) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, description, level, category, estimatedDuration, difficulty, learningObjectives' 
      }, { status: 400 });
    }

    await connectToDatabase();

    const newCourse = new Course({
      title: title.trim(),
      description: description.trim(),
      level,
      category,
      estimatedDuration: parseInt(estimatedDuration),
      difficulty: parseInt(difficulty),
      isPremium: isPremium || false,
      isPublished: isPublished || false,
      learningObjectives: learningObjectives || [],
      prerequisites: prerequisites || [],
      tags: tags || [],
      thumbnailUrl: thumbnailUrl || '',
      instructorNotes: instructorNotes || '',
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
      metadata: {
        version: '1.0.0',
        lastUpdated: new Date(),
        createdBy: userId
      }
    });

    const savedCourse = await newCourse.save();

    return NextResponse.json({
      message: 'Course created successfully',
      course: savedCourse
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating course:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json({
        error: 'Validation failed',
        details: Object.values(error.errors).map((err: any) => err.message)
      }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}