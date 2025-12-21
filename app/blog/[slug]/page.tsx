'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from "../../blocks/Navbar";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Tag, Loader2 } from "lucide-react";

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
  const slug = (params?.slug as string) || '';
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
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 pb-10 md:pb-14">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 pb-10 md:pb-14">
          <Card className="border border-border/60 shadow-sm">
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">{error || 'Blog post not found'}</p>
              <div className="mt-4">
                <Button asChild variant="outline">
                  <Link href="/blog">View all posts</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 pb-10 md:pb-14">
        <Link href="/blog">
          <Button variant="ghost" className="pl-2 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to blog
          </Button>
        </Link>

        <article className="space-y-6">
          <Card className="border border-border/60 shadow-sm overflow-hidden">
            {post.featuredImage && (
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                {post.featuredImage.startsWith('data:') ? (
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}

            <CardHeader className="pb-4">
              <CardTitle className="text-2xl md:text-3xl leading-tight">{post.title}</CardTitle>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                {post.author && (
                  <span className="inline-flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {post.author}
                  </span>
                )}
                {post.publishDate && (
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.publishDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              {post.tags?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="inline-flex items-center gap-2">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>

            <CardContent>
              {(post.videoFile || post.videoLink) && (
                <div className="mb-6 rounded-md overflow-hidden border bg-black">
                  {post.videoFile ? (
                    <video src={post.videoFile} controls className="w-full" />
                  ) : post.videoLink ? (
                    <iframe
                      width="100%"
                      height="420"
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

              <div className="prose prose-slate max-w-none">
                <div className="whitespace-pre-wrap text-[15px] leading-7 text-foreground">
                  {post.content}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-sm">
            <CardContent className="py-6">
              <div className="text-sm text-muted-foreground">{post.excerpt}</div>
              <div className="mt-4">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/blog">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to all posts
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </article>
      </main>

      <Footer />
    </div>
  );
}
