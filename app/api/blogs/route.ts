import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/lib/models/Course';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Fetch all published courses that have blog posts
    const courses = await Course.find({
      isPublished: true,
      blogPosts: { $exists: true, $ne: [] }
    })
      .select('title blogPosts')
      .lean();

    // Extract and flatten all blog posts
    const allBlogs = courses.flatMap(course =>
      (course.blogPosts || [])
        .filter((blog: any) => blog.publishImmediately)
        .map((blog: any) => ({
          id: blog._id?.toString() || blog.id,
          title: blog.title,
          content: blog.content,
          excerpt: blog.excerpt,
          author: blog.author,
          publishDate: blog.publishDate,
          tags: blog.tags || [],
          isPublished: blog.publishImmediately,
          featuredImage: blog.featuredImageUrl || '',
          courseName: course.title
        }))
    );

    // Sort by publish date (newest first)
    allBlogs.sort((a, b) => 
      new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );

    return NextResponse.json({
      success: true,
      data: allBlogs,
      count: allBlogs.length
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}
