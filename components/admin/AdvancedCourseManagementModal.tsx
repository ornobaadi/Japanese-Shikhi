'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    IconX,
    IconPlus,
    IconVideo,
    IconFileText,
    IconUsers,
    IconCalendar,
    IconEdit,
    IconTrash,
    IconDeviceFloppy
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    type IVideoLink,
    type IDocumentFile,
    type IWeeklyContent,
    type IClassLink,
    type IBlogPost,
    type IEnrolledStudent,
    type CourseManagementData
} from '@/lib/models';

interface AdvancedCourseManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    courseName: string;
    courseSlug?: string; // Optional slug parameter
    onSave: (data: CourseManagementData) => Promise<void>;
}

export default function AdvancedCourseManagementModal({
    isOpen,
    onClose,
    courseId,
    courseName,
    courseSlug,
    onSave
}: AdvancedCourseManagementModalProps) {
    const { t } = useLanguage();
    const [activeWeekTab, setActiveWeekTab] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

    // Initialize course management data
    const getInitialData = (): CourseManagementData => ({
        courseId,
        courseName,
        weeklyContent: [
            {
                id: '1',
                week: 1,
                videoLinks: [],
                documents: [],
                comments: '',
                isPublished: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: '2',
                week: 2,
                videoLinks: [],
                documents: [],
                comments: '',
                isPublished: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: '3',
                week: 3,
                videoLinks: [],
                documents: [],
                comments: '',
                isPublished: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: '4',
                week: 4,
                videoLinks: [],
                documents: [],
                comments: '',
                isPublished: false,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ],
        classLinks: [],
        blogPosts: [],
        enrolledStudents: []
    });

    const [data, setData] = useState<CourseManagementData>(getInitialData());

    // Load existing data when modal opens or courseId changes
    useEffect(() => {
        if (isOpen && courseId) {
            loadCourseData();
        }
    }, [isOpen, courseId]);

    const loadCourseData = async () => {
        try {
            // Use admin endpoint to load management data
            const endpoint = `/api/admin/courses/${courseId}/management`;

            console.log('📥 Loading course management data from:', endpoint);
            const response = await fetch(endpoint);
            
            if (response.ok) {
                const responseData = await response.json();
                console.log('📦 Loaded course data:', responseData);
                
                // Extract the actual data from response
                const courseData = responseData.data || responseData;
                setData(courseData);
            } else {
                console.warn('Failed to load course data, using initial data');
                setData(getInitialData());
            }
        } catch (error) {
            console.error('Error loading course data:', error);
            // Use initial data as fallback
            setData(getInitialData());
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            console.log('🚀 Modal handleSave called!');
            console.log('📦 About to save data:', JSON.stringify(data, null, 2));
            console.log('📍 Course ID:', courseId);
            console.log('📋 Course Name:', courseName);
            console.log('🔗 onSave function:', onSave);

            await onSave(data);
            toast.success('Course management data saved successfully!');
            onClose();
        } catch (error) {
            console.error('❌ Modal Error saving course data:', error);
            toast.error('Failed to save course data. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    // Video Link Functions
    const addVideoLink = (week: number) => {
        console.log(`Adding video link for week ${week}`);
        const newVideo: IVideoLink = {
            id: Date.now().toString(),
            title: '',
            url: '',
            description: '',
            videoType: 'other',
            thumbnailUrl: '',
            isPreview: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        setData(prev => {
            const updated = {
                ...prev,
                weeklyContent: prev.weeklyContent.map(content =>
                    content.week === week
                        ? { ...content, videoLinks: [...content.videoLinks, newVideo] }
                        : content
                )
            };
            console.log('Updated data after adding video:', updated);
            return updated;
        });
    };

    const updateVideoLink = (week: number, videoIndex: number, field: keyof IVideoLink, value: string) => {
        console.log(`Updating video link - Week: ${week}, Index: ${videoIndex}, Field: ${field}, Value: ${value}`);
        setData(prev => ({
            ...prev,
            weeklyContent: prev.weeklyContent.map(content =>
                content.week === week
                    ? {
                        ...content,
                        videoLinks: content.videoLinks.map((video, index) =>
                            index === videoIndex ? { ...video, [field]: value } : video
                        )
                    }
                    : content
            )
        }));
    };

    const removeVideoLink = (week: number, videoIndex: number) => {
        setData(prev => ({
            ...prev,
            weeklyContent: prev.weeklyContent.map(content =>
                content.week === week
                    ? {
                        ...content,
                        videoLinks: content.videoLinks.filter((_, index) => index !== videoIndex)
                    }
                    : content
            )
        }));
    };

    // Document Functions
    const addDocument = (week: number) => {
        const newDoc: IDocumentFile = {
            id: Date.now().toString(),
            title: '',
            fileName: '',
            fileUrl: '',
            fileType: 'pdf',
            createdAt: new Date(),
            updatedAt: new Date(),
            uploadedAt: new Date()
        };

        setData(prev => ({
            ...prev,
            weeklyContent: prev.weeklyContent.map(content =>
                content.week === week
                    ? { ...content, documents: [...content.documents, newDoc] }
                    : content
            )
        }));
    };

    const updateDocument = (week: number, docIndex: number, field: keyof IDocumentFile, value: string) => {
        setData(prev => ({
            ...prev,
            weeklyContent: prev.weeklyContent.map(content =>
                content.week === week
                    ? {
                        ...content,
                        documents: content.documents.map((doc, index) =>
                            index === docIndex ? { ...doc, [field]: value } : doc
                        )
                    }
                    : content
            )
        }));
    };

    const removeDocument = (week: number, docIndex: number) => {
        setData(prev => ({
            ...prev,
            weeklyContent: prev.weeklyContent.map(content =>
                content.week === week
                    ? {
                        ...content,
                        documents: content.documents.filter((_, index) => index !== docIndex)
                    }
                    : content
            )
        }));
    };

    // Class Link Functions
    const addClassLink = () => {
        const newLink: IClassLink = {
            id: Date.now().toString(),
            title: '',
            meetingUrl: '',
            schedule: new Date(),
            description: '',
            platform: 'other' as const,
            isRecurring: false,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        setData(prev => ({
            ...prev,
            classLinks: [...prev.classLinks, newLink]
        }));
    };

    const updateClassLink = (index: number, field: keyof IClassLink, value: string) => {
        setData(prev => ({
            ...prev,
            classLinks: prev.classLinks.map((link, i) =>
                i === index ? { ...link, [field]: value } : link
            )
        }));
    };

    const removeClassLink = (index: number) => {
        setData(prev => ({
            ...prev,
            classLinks: prev.classLinks.filter((_, i) => i !== index)
        }));
    };

    // Blog Functions
    const addBlogPost = () => {
        const newBlog: IBlogPost = {
            id: Date.now().toString(),
            title: '',
            content: '',
            excerpt: '',
            author: '',
            publishDate: new Date(),
            tags: [],
            isPublished: false,
            featuredImage: '',
            viewCount: 0,
            likes: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        setData(prev => ({
            ...prev,
            blogPosts: [...prev.blogPosts, newBlog]
        }));
    };

    const updateBlogPost = (index: number, field: keyof IBlogPost, value: any) => {
        setData(prev => ({
            ...prev,
            blogPosts: prev.blogPosts.map((blog, i) =>
                i === index ? { ...blog, [field]: value } : blog
            )
        }));
    };

    const removeBlogPost = (index: number) => {
        setData(prev => ({
            ...prev,
            blogPosts: prev.blogPosts.filter((_, i) => i !== index)
        }));
    };

    // Student Functions
    const addStudent = () => {
        const newStudent: IEnrolledStudent = {
            id: Date.now().toString(),
            name: '',
            email: '',
            enrollmentDate: new Date(),
            progress: 0,
            status: 'active',
            userId: '',
            certificateIssued: false,
            paymentStatus: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        setData(prev => ({
            ...prev,
            enrolledStudents: [...prev.enrolledStudents, newStudent]
        }));
    };

    const updateStudent = (index: number, field: keyof IEnrolledStudent, value: any) => {
        setData(prev => ({
            ...prev,
            enrolledStudents: prev.enrolledStudents.map((student, i) =>
                i === index ? { ...student, [field]: value } : student
            )
        }));
    };

    const removeStudent = (index: number) => {
        setData(prev => ({
            ...prev,
            enrolledStudents: prev.enrolledStudents.filter((_, i) => i !== index)
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <div>
                        <h2 className="text-2xl font-bold">Advanced Course Management</h2>
                        <p className="text-gray-600">Manage detailed course content and student information</p>
                        <p className="text-sm text-blue-600 font-medium">Course: {courseName}</p>
                    </div>
                    <Button variant="outline" onClick={onClose}>
                        <IconX className="size-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">
                    <Tabs defaultValue="content" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="content">Course Content</TabsTrigger>
                            <TabsTrigger value="classes">Class Links</TabsTrigger>
                            <TabsTrigger value="blogs">Blog Management</TabsTrigger>
                            <TabsTrigger value="students">Enrolled Students</TabsTrigger>
                            <TabsTrigger value="summary">Summary</TabsTrigger>
                        </TabsList>

                        {/* Course Content Tab */}
                        <TabsContent value="content" className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Add Courses Content</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Organize your course content by weeks for {courseName}
                                </p>

                                {/* Week Tabs */}
                                <div className="flex border-b mb-6">
                                    {[1, 2, 3, 4].map((week) => (
                                        <button
                                            key={week}
                                            onClick={() => setActiveWeekTab(week)}
                                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeWeekTab === week
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            Week {week}
                                        </button>
                                    ))}
                                </div>

                                {/* Week Content */}
                                {data.weeklyContent.map((weekContent) => (
                                    <div key={weekContent.id} className={activeWeekTab === weekContent.week ? 'block' : 'hidden'}>
                                        <div className="space-y-6">
                                            {/* Video Upload Links Section */}
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <IconVideo className="size-5" />
                                                        Video Upload Links
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Add multiple video links for Week {weekContent.week}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    {weekContent.videoLinks.map((video, videoIndex) => (
                                                        <div key={video.id} className="border rounded-lg p-4 space-y-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <Label>Video Title</Label>
                                                                    <Input
                                                                        value={video.title}
                                                                        onChange={(e) => updateVideoLink(weekContent.week, videoIndex, 'title', e.target.value)}
                                                                        placeholder="e.g., Hiragana Introduction"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label>Video URL</Label>
                                                                    <Input
                                                                        type="url"
                                                                        value={video.url}
                                                                        onChange={(e) => updateVideoLink(weekContent.week, videoIndex, 'url', e.target.value)}
                                                                        placeholder="https://youtube.com/watch?v=... or upload link"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <Label>Description</Label>
                                                                <Textarea
                                                                    value={video.description}
                                                                    onChange={(e) => updateVideoLink(weekContent.week, videoIndex, 'description', e.target.value)}
                                                                    placeholder="Brief description of the video content..."
                                                                    rows={2}
                                                                />
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => removeVideoLink(weekContent.week, videoIndex)}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <IconTrash className="size-4 mr-2" />
                                                                Remove Video
                                                            </Button>
                                                        </div>
                                                    ))}

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => addVideoLink(weekContent.week)}
                                                    >
                                                        <IconPlus className="size-4 mr-2" />
                                                        Add Video Link
                                                    </Button>
                                                </CardContent>
                                            </Card>

                                            {/* PDF/DOCS Upload Section */}
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <IconFileText className="size-5" />
                                                        PDF/DOCS Upload
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Upload multiple documents for Week {weekContent.week}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    {weekContent.documents.map((doc, docIndex) => (
                                                        <div key={doc.id} className="border rounded-lg p-4 space-y-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <Label>Document Title</Label>
                                                                    <Input
                                                                        value={doc.title}
                                                                        onChange={(e) => updateDocument(weekContent.week, docIndex, 'title', e.target.value)}
                                                                        placeholder="e.g., Week 1 Study Material"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label>File Name</Label>
                                                                    <Input
                                                                        value={doc.fileName}
                                                                        onChange={(e) => updateDocument(weekContent.week, docIndex, 'fileName', e.target.value)}
                                                                        placeholder="e.g., hiragana-guide.pdf"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <Label>File URL</Label>
                                                                <Input
                                                                    type="url"
                                                                    value={doc.fileUrl}
                                                                    onChange={(e) => updateDocument(weekContent.week, docIndex, 'fileUrl', e.target.value)}
                                                                    placeholder="https://example.com/document.pdf"
                                                                />
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => removeDocument(weekContent.week, docIndex)}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <IconTrash className="size-4 mr-2" />
                                                                Remove Document
                                                            </Button>
                                                        </div>
                                                    ))}

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => addDocument(weekContent.week)}
                                                    >
                                                        <IconPlus className="size-4 mr-2" />
                                                        Add Document
                                                    </Button>
                                                </CardContent>
                                            </Card>

                                            {/* Comments Section */}
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Week {weekContent.week} Comments</CardTitle>
                                                    <CardDescription>Add comments or notes for Week {weekContent.week}</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <Textarea
                                                        value={weekContent.comments}
                                                        onChange={(e) => {
                                                            setData(prev => ({
                                                                ...prev,
                                                                weeklyContent: prev.weeklyContent.map(content =>
                                                                    content.week === weekContent.week
                                                                        ? { ...content, comments: e.target.value }
                                                                        : content
                                                                )
                                                            }));
                                                        }}
                                                        placeholder="Add your comments, notes, or instructions for this week..."
                                                        rows={4}
                                                    />
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Class Links Tab */}
                        <TabsContent value="classes" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <IconCalendar className="size-5" />
                                        Class Links
                                    </CardTitle>
                                    <CardDescription>Add meeting links for live classes</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {data.classLinks.map((link, index) => (
                                        <div key={link.id} className="border rounded-lg p-4 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Class Title</Label>
                                                    <Input
                                                        value={link.title}
                                                        onChange={(e) => updateClassLink(index, 'title', e.target.value)}
                                                        placeholder="e.g., Japanese Grammar Basics"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Meeting URL</Label>
                                                    <Input
                                                        type="url"
                                                        value={link.meetingUrl}
                                                        onChange={(e) => updateClassLink(index, 'meetingUrl', e.target.value)}
                                                        placeholder="https://zoom.us/j/... or Google Meet link"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Schedule</Label>
                                                    <Input
                                                        type="datetime-local"
                                                        value={link.schedule instanceof Date ? link.schedule.toISOString().slice(0, 16) : link.schedule}
                                                        onChange={(e) => updateClassLink(index, 'schedule', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Description</Label>
                                                    <Input
                                                        value={link.description}
                                                        onChange={(e) => updateClassLink(index, 'description', e.target.value)}
                                                        placeholder="Brief description of the class"
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeClassLink(index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <IconTrash className="size-4 mr-2" />
                                                Remove Link
                                            </Button>
                                        </div>
                                    ))}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addClassLink}
                                    >
                                        <IconPlus className="size-4 mr-2" />
                                        Add Class Link
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Blog Management Tab */}
                        <TabsContent value="blogs" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <IconEdit className="size-5" />
                                            Blog Management
                                        </div>
                                        <Button onClick={addBlogPost} className="bg-purple-600 hover:bg-purple-700">
                                            <IconPlus className="size-4 mr-2" />
                                            Add New Blog
                                        </Button>
                                    </CardTitle>
                                    <CardDescription>Create and manage blog posts related to your courses</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {data.blogPosts.map((blog, index) => (
                                        <div key={blog.id} className="border rounded-lg p-4 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Blog Title</Label>
                                                    <Input
                                                        value={blog.title}
                                                        onChange={(e) => updateBlogPost(index, 'title', e.target.value)}
                                                        placeholder="e.g., Learning Hiragana: A Beginner's Guide"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Author</Label>
                                                    <Input
                                                        value={blog.author}
                                                        onChange={(e) => updateBlogPost(index, 'author', e.target.value)}
                                                        placeholder="e.g., John Doe"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label>Blog Excerpt</Label>
                                                <Textarea
                                                    value={blog.excerpt}
                                                    onChange={(e) => updateBlogPost(index, 'excerpt', e.target.value)}
                                                    placeholder="Brief description of the blog post..."
                                                    rows={2}
                                                />
                                            </div>

                                            <div>
                                                <Label>Blog Content</Label>
                                                <Textarea
                                                    value={blog.content}
                                                    onChange={(e) => updateBlogPost(index, 'content', e.target.value)}
                                                    placeholder="Write your full blog content here..."
                                                    rows={6}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Featured Image URL</Label>
                                                    <Input
                                                        type="url"
                                                        value={blog.featuredImage}
                                                        onChange={(e) => updateBlogPost(index, 'featuredImage', e.target.value)}
                                                        placeholder="https://example.com/image.jpg"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Publish Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={blog.publishDate instanceof Date ? blog.publishDate.toISOString().split('T')[0] : blog.publishDate}
                                                        onChange={(e) => updateBlogPost(index, 'publishDate', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label>Tags (comma-separated)</Label>
                                                <Input
                                                    value={blog.tags.join(', ')}
                                                    onChange={(e) => {
                                                        const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                                                        updateBlogPost(index, 'tags', tags);
                                                    }}
                                                    placeholder="e.g., japanese, hiragana, learning, beginner"
                                                />
                                            </div>

                                            <div className="flex justify-between items-center pt-3 border-t">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`blog-published-${blog.id}`}
                                                        checked={blog.isPublished}
                                                        onCheckedChange={(checked) => updateBlogPost(index, 'isPublished', checked)}
                                                    />
                                                    <Label htmlFor={`blog-published-${blog.id}`}>Published</Label>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeBlogPost(index)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <IconTrash className="size-4 mr-2" />
                                                    Remove Blog
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    {data.blogPosts.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>No blog posts yet. Click "Add New Blog" to create your first post.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Enrolled Students Tab */}
                        <TabsContent value="students" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <IconUsers className="size-5" />
                                        Enrolled Students Info
                                    </CardTitle>
                                    <CardDescription>Manage enrolled students for this course</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {data.enrolledStudents.map((student, index) => (
                                        <div key={student.id} className="border rounded-lg p-4 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <Label>Student Name</Label>
                                                    <Input
                                                        value={student.name}
                                                        onChange={(e) => updateStudent(index, 'name', e.target.value)}
                                                        placeholder="e.g., John Doe"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Email</Label>
                                                    <Input
                                                        type="email"
                                                        value={student.email}
                                                        onChange={(e) => updateStudent(index, 'email', e.target.value)}
                                                        placeholder="student@example.com"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Enrollment Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={student.enrollmentDate instanceof Date ? student.enrollmentDate.toISOString().split('T')[0] : student.enrollmentDate}
                                                        onChange={(e) => updateStudent(index, 'enrollmentDate', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Progress (%)</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={student.progress}
                                                        onChange={(e) => updateStudent(index, 'progress', parseInt(e.target.value) || 0)}
                                                        placeholder="0-100"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Status</Label>
                                                    <select
                                                        value={student.status}
                                                        onChange={(e) => updateStudent(index, 'status', e.target.value as 'active' | 'inactive')}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                    >
                                                        <option value="active">Active</option>
                                                        <option value="inactive">Inactive</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeStudent(index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <IconTrash className="size-4 mr-2" />
                                                Remove Student
                                            </Button>
                                        </div>
                                    ))}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addStudent}
                                    >
                                        <IconPlus className="size-4 mr-2" />
                                        Add Student
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Summary Tab */}
                        <TabsContent value="summary" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Summary</CardTitle>
                                    <CardDescription>Overview of your course management data</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {data.weeklyContent.reduce((total, week) => total + week.videoLinks.length, 0)}
                                            </div>
                                            <div className="text-sm text-blue-600">Total Videos</div>
                                        </div>
                                        <div className="text-center p-4 bg-green-50 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">
                                                {data.weeklyContent.reduce((total, week) => total + week.documents.length, 0)}
                                            </div>
                                            <div className="text-sm text-green-600">Total Documents</div>
                                        </div>
                                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                                            <div className="text-2xl font-bold text-purple-600">{data.classLinks.length}</div>
                                            <div className="text-sm text-purple-600">Class Links</div>
                                        </div>
                                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                                            <div className="text-2xl font-bold text-orange-600">{data.enrolledStudents.length}</div>
                                            <div className="text-sm text-orange-600">Enrolled Students</div>
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        <p><strong>Course:</strong> {courseName}</p>
                                        <p><strong>Blog Posts:</strong> {data.blogPosts.length} ({data.blogPosts.filter(b => b.isPublished).length} published)</p>
                                        <p><strong>Active Students:</strong> {data.enrolledStudents.filter(s => s.status === 'active').length}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center p-6 border-t bg-gray-50">
                    <div className="text-sm text-gray-600">
                        <span className="font-medium">1</span> course ready to submit
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                            {isSaving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <IconDeviceFloppy className="size-4 mr-2" />
                                    Save & Continue
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}