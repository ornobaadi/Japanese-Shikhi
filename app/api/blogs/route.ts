import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/lib/models/Course';
import Blog from '@/lib/models/Blog';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    // If slug is provided, fetch specific blog post
    if (slug) {
      const blog = await Blog.findOne({
        slug: slug
      }).lean();

      if (!blog) {
        return NextResponse.json({
          success: false,
          data: [],
          error: 'Blog post not found'
        });
      }

      const formattedBlog = {
        _id: blog._id?.toString(),
        id: blog._id?.toString(),
        title: blog.title,
        content: blog.content,
        excerpt: blog.excerpt,
        author: blog.author,
        publishDate: blog.publishDate,
        tags: blog.tags || [],
        isPublished: blog.isPublished,
        featuredImage: blog.featuredImage || '',
        videoLink: blog.videoLink || '',
        videoFile: blog.videoFile || '',
        slug: blog.slug,
      };

      return NextResponse.json({
        success: true,
        data: [formattedBlog]
      });
    }

    // Fetch published blog posts from Blog collection
    const publishedBlogs = await Blog.find({
      isPublished: true
    })
      .sort({ publishDate: -1 })
      .lean() as any[];

    // Format blog posts
    const formattedBlogs = publishedBlogs.map((blog) => ({
      _id: blog._id?.toString(),
      id: blog._id?.toString(),
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt,
      author: blog.author,
      publishDate: blog.publishDate,
      tags: blog.tags || [],
      isPublished: blog.isPublished,
      featuredImage: blog.featuredImage || '',
      videoLink: blog.videoLink || '',
      videoFile: blog.videoFile || '',
      slug: blog.slug,
    }));

    // Also fetch from courses for backward compatibility
    const courses = await Course.find({
      isPublished: true,
      blogPosts: { $exists: true, $ne: [] }
    })
      .select('title blogPosts')
      .lean() as any[];

    const courseBlogs = courses.flatMap(course =>
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

    // Combine and sort all blogs
    const allBlogs = [...formattedBlogs, ...courseBlogs];
    allBlogs.sort((a, b) => 
      new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );

    return NextResponse.json({
      success: true,
      data: allBlogs,
      blogs: allBlogs,
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
