"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight } from "lucide-react";

interface BlogPost {
  _id?: string;
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishDate: string;
  tags: string[];
  isPublished?: boolean;
  publishImmediately?: boolean;
  featuredImage?: string;
  featuredImageUrl?: string;
  videoLink?: string;
  courseName?: string;
  slug?: string;
}

export default function BlogSection() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('/api/blogs');
        const data = await response.json();
        
        if (data.success) {
          // Filter published blogs and show only first 3
          const publishedBlogs = (data.data || data.blogs || [])
            .filter((blog: BlogPost) => blog.isPublished || blog.publishImmediately)
            .slice(0, 3);
          setBlogs(publishedBlogs);
        }
      } catch (error) {
        console.error('Failed to load blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Latest from Our Blog</h2>
            <p className="text-gray-600 dark:text-gray-400">Loading latest articles...</p>
          </div>
        </div>
      </section>
    );
  }

  if (blogs.length === 0) {
    return null; // Don't show section if no blogs
  }

  return (
    <section className="py-20 px-4 md:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Latest from Our Blog</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Insights, tips, and stories about learning Japanese
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {blogs.map((blog) => {
            // Validate image URL - support both featuredImage and featuredImageUrl
            const imageUrl = blog.featuredImage || blog.featuredImageUrl;
            const isValidImageUrl = imageUrl && (
              imageUrl.startsWith('http://') || 
              imageUrl.startsWith('https://') ||
              imageUrl.startsWith('/')
            );

            return (
            <Card key={blog._id || blog.id} className="flex flex-col hover:shadow-lg transition-shadow">
              {isValidImageUrl && (
                <div className="relative h-48 overflow-hidden rounded-t-lg bg-muted">
                  <img
                    src={imageUrl}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                  {blog.videoLink && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="text-white text-4xl">▶</div>
                    </div>
                  )}
                </div>
              )}
              
              <CardHeader>
                <div className="flex flex-wrap gap-2 mb-2">
                  {blog.tags.slice(0, 2).map((tag, idx) => (
                    <Badge key={idx} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {blog.excerpt}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow">
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{blog.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(blog.publishDate).toLocaleDateString()}</span>
                  </div>
                </div>
                {blog.courseName && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    From: {blog.courseName}
                  </p>
                )}
              </CardContent>

              <CardFooter>
                <Link href={`/blog`} className="w-full">
                  <Button variant="outline" className="w-full group">
                    Read More
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          );
          })}
        </div>

        <div className="text-center">
          <Link href="/blog">
            <Button size="lg" className="group">
              View All Articles
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
