'use client';

import { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from "../blocks/Navbar";
import Footer from "@/components/footer";
import { ArrowLeft, Search, Tag, Calendar, User } from "lucide-react";

interface BlogPost {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    author: string;
    publishDate: string;
    tags: string[];
    isPublished: boolean;
    featuredImage?: string;
    slug?: string;
    courseName?: string;
}

function BlogPageContent() {
    const { t } = useLanguage();
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Load blog posts from API and localStorage
    useEffect(() => {
        const loadBlogs = async () => {
            try {
                // Load from API first
                const response = await fetch('/api/blogs');
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && Array.isArray(data.data)) {
                        setBlogPosts(data.data);
                        setIsLoading(false);
                        return;
                    }
                }
                
                // Fallback to localStorage if API fails
                const savedBlogs = localStorage.getItem('publishedBlogs');
                if (savedBlogs) {
                    const blogs = JSON.parse(savedBlogs);
                    setBlogPosts(blogs.filter((blog: BlogPost) => blog.isPublished));
                }
            } catch (error) {
                console.error('Error loading blogs:', error);
                // Try localStorage as fallback
                try {
                    const savedBlogs = localStorage.getItem('publishedBlogs');
                    if (savedBlogs) {
                        const blogs = JSON.parse(savedBlogs);
                        setBlogPosts(blogs.filter((blog: BlogPost) => blog.isPublished));
                    }
                } catch (e) {
                    console.error('Error loading from localStorage:', e);
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadBlogs();
    }, []);

    // Get all unique tags
    const allTags = Array.from(new Set(blogPosts.flatMap(blog => blog.tags)));

    // Filter blogs based on search and tag
    const filteredBlogs = blogPosts.filter(blog => {
        const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
            blog.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTag = !selectedTag || blog.tags.includes(selectedTag);
        return matchesSearch && matchesTag;
    });

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'ব্লগ লোড হচ্ছে...' : 'Loading blogs...'}
              </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 pb-10 md:pb-14">
            <div className="mb-8 md:mb-10">
              <Link href="/">
                <Button variant="ghost" className="pl-2">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'হোমে ফিরুন' : 'Back to home'}
                </Button>
              </Link>

              <div className="mt-6">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'আমাদের ব্লগ' : 'Blog'}
                </h1>
                <p className="text-base md:text-lg text-gray-600 mt-2 max-w-3xl">
                  {t('nav.features') === 'বৈশিষ্ট্যসমূহ'
                    ? 'জাপানি ভাষা শেখার টিপস, গাইড এবং অভিজ্ঞতা'
                    : 'Tips, guides, and insights for learning Japanese.'}
                </p>
              </div>
            </div>

                {/* Search and Filter */}
                <div className="mb-8">
                  <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                    <div className="relative w-full md:max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'ব্লগ খুঁজুন...' : 'Search blogs...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>

                    <Button
                      variant={selectedTag ? 'outline' : 'default'}
                      onClick={() => setSelectedTag('')}
                      className="md:w-auto"
                    >
                      {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'সব পোস্ট' : 'All posts'}
                    </Button>
                  </div>

                    {/* Tags Filter */}
                    {allTags.length > 0 && (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="text-sm text-muted-foreground inline-flex items-center gap-2 mr-1">
                          <Tag className="h-4 w-4" />
                          {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'ট্যাগ' : 'Tags'}
                        </span>
                        {allTags.map(tag => (
                          <Badge
                            key={tag}
                            variant={selectedTag === tag ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                </div>

                {/* Blog Posts */}
                {filteredBlogs.length === 0 ? (
                  <Card className="border border-border/60 shadow-sm">
                    <CardContent className="py-10 text-center text-muted-foreground">
                      {searchTerm || selectedTag
                        ? (t('nav.features') === 'বৈশিষ্ট্যসমূহ'
                          ? 'আপনার অনুসন্ধানের সাথে মিলে এমন কোনো ব্লগ পোস্ট পাওয়া যায়নি।'
                          : 'No posts match your search.')
                        : (t('nav.features') === 'বৈশিষ্ট্যসমূহ'
                          ? 'এখনো কোনো ব্লগ পোস্ট প্রকাশিত হয়নি।'
                          : 'No blog posts published yet.')}
                    </CardContent>
                  </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBlogs.map((blog) => {
                            // Validate image URL
                          const imageSrc = blog.featuredImage;
                          const isValidImageUrl = !!imageSrc && (
                            imageSrc.startsWith('http://') ||
                            imageSrc.startsWith('https://') ||
                            imageSrc.startsWith('data:') ||
                            imageSrc.startsWith('/')
                          );

                            return (
                            <Card key={blog.id} className="overflow-hidden bg-white border border-border/60 shadow-sm hover:shadow-md transition-shadow">
                                {isValidImageUrl && (
                                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                                    {imageSrc!.startsWith('data:') ? (
                                            // Use regular img tag for data URLs
                                            <img
                                        src={imageSrc!}
                                                alt={blog.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            // Use Next.js Image for HTTP URLs
                                            <Image
                                        src={imageSrc!}
                                                alt={blog.title}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                }}
                                            />
                                        )}
                                    </div>
                                )}
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg font-semibold line-clamp-2 leading-snug text-gray-900">
                                        {blog.title}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 text-gray-600 leading-relaxed">
                                        {blog.excerpt}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0">
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                    {blog.author && (
                                      <span className="inline-flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        {blog.author}
                                      </span>
                                    )}
                                    {blog.publishDate && (
                                      <span className="inline-flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(blog.publishDate).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>

                                  {blog.courseName && (
                                    <div className="mt-3">
                                      <Badge variant="secondary">{blog.courseName}</Badge>
                                    </div>
                                  )}

                                  {blog.tags?.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {blog.tags.slice(0, 3).map(tag => (
                                        <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>
                                      ))}
                                    </div>
                                  )}

                                  <div className="mt-4">
                                    <Button asChild variant="outline" className="w-full">
                                      <Link href={`/blog/${blog.slug || blog.id}`}>
                                        {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'পড়ুন' : 'Read'}
                                      </Link>
                                    </Button>
                                  </div>
                                </CardContent>
                            </Card>
                        );
                        })}
                    </div>
                )}
          </main>
          {/* <Footer /> */}
        </div>
    );
}

export default function BlogPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
            <BlogPageContent />
        </Suspense>
    );
}