'use client';

import { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';
import Link from 'next/link';

interface BlogPost {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    author: string;
    publishDate: string;
    tags: string[];
    isPublished: boolean;
    featuredImage: string;
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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'ব্লগ লোড হচ্ছে...' : 'Loading Blogs...'}
                    </h3>
                    <p className="text-gray-500">
                        {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'অনুগ্রহ করে অপেক্ষা করুন' : 'Please wait a moment'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Back to Home Button */}
                    <div className="mb-8">
                        <Link href="/">
                            <Button
                                variant="ghost"
                                className="flex items-center gap-2 hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'হোমে ফিরুন' : 'Back to Home'}
                            </Button>
                        </Link>
                    </div>

                    <div className="text-center">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                            {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'আমাদের ব্লগ' : 'Our Blog'}
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            {t('nav.features') === 'বৈশিষ্ট্যসমূহ'
                                ? 'জাপানি ভাষা শেখার টিপস, গাইড এবং অভিজ্ঞতা'
                                : 'Tips, guides, and insights for learning Japanese language'}
                        </p>
                    </div>
                </div>
            </div>            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Search and Filter */}
                <div className="mb-12">
                    <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                        <div className="relative flex-1 max-w-md">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <Input
                                placeholder={t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'ব্লগ খুঁজুন...' : 'Search blogs...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-12 border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl"
                            />
                        </div>
                        <Button
                            variant={selectedTag ? 'default' : 'outline'}
                            onClick={() => setSelectedTag('')}
                            className="whitespace-nowrap px-8 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white border-0"
                        >
                            {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'সব দেখান' : 'All Posts'}
                        </Button>
                    </div>

                    {/* Tags Filter */}
                    {allTags.length > 0 && (
                        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-100">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'ট্যাগ:' : 'Filter by Tags:'}
                                </span>
                                {allTags.map(tag => (
                                    <Badge
                                        key={tag}
                                        variant={selectedTag === tag ? 'default' : 'outline'}
                                        className={`cursor-pointer transition-all duration-300 rounded-full px-4 py-2 ${selectedTag === tag
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
                                            : 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                                            }`}
                                        onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                                    >
                                        #{tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Blog Posts */}
                {filteredBlogs.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="max-w-md mx-auto">
                            <div className="mb-4">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'কোনো ব্লগ পোস্ট নেই' : 'No blog posts found'}
                            </h3>
                            <p className="text-gray-600">
                                {searchTerm || selectedTag
                                    ? (t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'আপনার অনুসন্ধানের সাথে মিলে এমন কোনো ব্লগ পোস্ট পাওয়া যায়নি।' : 'No blog posts match your search criteria.')
                                    : (t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'এখনো কোনো ব্লগ পোস্ট প্রকাশিত হয়নি।' : 'No blog posts have been published yet.')
                                }
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredBlogs.map((blog) => {
                            // Validate image URL
                            const isValidImageUrl = blog.featuredImage && (
                                blog.featuredImage.startsWith('http://') || 
                                blog.featuredImage.startsWith('https://') ||
                                blog.featuredImage.startsWith('data:') ||
                                blog.featuredImage.startsWith('/')
                            );

                            return (
                            <Card key={blog.id} className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                                {isValidImageUrl && (
                                    <div className="relative h-96 w-full overflow-hidden rounded-t-2xl">
                                        {blog.featuredImage.startsWith('data:') ? (
                                            // Use regular img tag for data URLs
                                            <img
                                                src={blog.featuredImage}
                                                alt={blog.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 rounded-t-2xl"
                                            />
                                        ) : (
                                            // Use Next.js Image for HTTP URLs
                                            <Image
                                                src={blog.featuredImage}
                                                alt={blog.title}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-700 rounded-t-2xl"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                }}
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />
                                    </div>
                                )}
                                <CardHeader className="pb-4 pt-6">
                                    <CardTitle className="text-xl font-bold line-clamp-2 leading-tight text-gray-800 group-hover:text-blue-600 transition-colors">
                                        {blog.title}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-3 text-gray-600 leading-relaxed mt-2">
                                        {blog.excerpt}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0 pb-6">
                                    <div className="space-y-5">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                                    <span className="text-white text-sm font-semibold">{blog.author.charAt(0)}</span>
                                                </div>
                                                <span className="font-semibold text-gray-700">{blog.author}</span>
                                            </div>
                                            <span className="text-sm text-gray-500">{new Date(blog.publishDate).toLocaleDateString()}</span>
                                        </div>

                                        {blog.courseName && (
                                            <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-0">
                                                📚 {blog.courseName}
                                            </Badge>
                                        )}

                                        {blog.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {blog.tags.slice(0, 3).map(tag => (
                                                    <Badge key={tag} variant="outline" className="text-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors rounded-full px-3 py-1">
                                                        #{tag}
                                                    </Badge>
                                                ))}
                                                {blog.tags.length > 3 && (
                                                    <Badge variant="outline" className="text-xs bg-gray-50 rounded-full px-3 py-1">
                                                        +{blog.tags.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}

                                        <Button
                                            variant="default"
                                            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-xl h-12 font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                                            asChild
                                        >
                                            <Link href={`/blog/${blog.slug || blog.id}`}>
                                                {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'আরও পড়ুন' : 'Read More'}
                                                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function BlogPage() {
    return (
        <Suspense fallback={<div className="container mx-auto py-12 px-4">Loading...</div>}>
            <BlogPageContent />
        </Suspense>
    );
}