'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { SiteHeader } from "@/components/site-header";
import Footer from "@/components/footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconCalendar, IconUser, IconTag, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishDate: string;
  tags: string[];
  isPublished: boolean;
  featuredImage?: string;
  videoLink?: string;
  videoFile?: string;
  slug: string;
  createdAt: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchBlogPost();
  }, [slug]);

  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/blogs?slug=${slug}`);
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setPost(data.data[0]);
        } else {
          setError('Blog post not found');
        }
      } else {
        setError('Failed to load blog post');
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setError('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <SiteHeader />
        <div className="flex items-center justify-center py-32">
          <IconLoader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <SiteHeader />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <Link href="/blog">
              <Button variant="ghost" className="mb-8">
                <IconArrowLeft className="size-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">{error || 'Blog post not found'}</p>
              <Link href="/blog">
                <Button>View All Posts</Button>
              </Link>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <SiteHeader />
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Link href="/blog">
          <Button variant="ghost" className="mb-8">
            <IconArrowLeft className="size-4 mr-2" />
            Back to Blog
          </Button>
        </Link>

        <article className="max-w-3xl mx-auto">
          {/* Featured Image */}
          {post.featuredImage && (
            <div className="mb-8 rounded-lg overflow-hidden border">
              {post.featuredImage.startsWith('data:') ? (
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-96 object-cover"
                />
              )}
            </div>
          )}

          {/* Title and Metadata */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
            
            <div className="flex flex-wrap gap-4 text-muted-foreground mb-6">
              {post.author && (
                <div className="flex items-center gap-2">
                  <IconUser className="size-4" />
                  <span>{post.author}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <IconCalendar className="size-4" />
                <span>{new Date(post.publishDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    <IconTag className="size-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Video Content */}
          {(post.videoFile || post.videoLink) && (
            <div className="mb-8 rounded-lg overflow-hidden border bg-black">
              {post.videoFile ? (
                <video
                  src={post.videoFile}
                  controls
                  className="w-full"
                />
              ) : post.videoLink ? (
                <iframe
                  width="100%"
                  height="500"
                  src={post.videoLink}
                  title="Blog video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full"
                />
              ) : null}
            </div>
          )}

          {/* Content */}
          <div className="prose prose-invert max-w-none mb-12">
            <div className="text-lg leading-8 whitespace-pre-wrap text-foreground/90">
              {post.content}
            </div>
          </div>

          {/* Footer Section */}
          <div className="border-t pt-8 mt-12">
            <div className="bg-secondary/50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold mb-2">About this post</h3>
              <p className="text-sm text-muted-foreground">{post.excerpt}</p>
            </div>

            <Link href="/blog">
              <Button className="w-full">
                <IconArrowLeft className="size-4 mr-2" />
                Back to All Posts
              </Button>
            </Link>
          </div>
        </article>
      </div>

      <Footer />
    </div>
  );
}
