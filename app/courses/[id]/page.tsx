'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoPlayer } from '@/components/video-player';
import { toast } from 'sonner';
import { 
  Clock, BookOpen, CheckCircle, Video, FileText, 
  Calendar, Link as LinkIcon, GraduationCap, ArrowLeft 
} from 'lucide-react';

interface Course {
  _id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  estimatedDuration: number;
  difficulty: number;
  isPremium: boolean;
  isPublished: boolean;
  learningObjectives: string[];
  thumbnailUrl?: string;
  instructorNotes?: string;
  weeklyContent?: WeeklyContent[];
  classLinks?: ClassLink[];
  blogPosts?: BlogPost[];
}

interface WeeklyContent {
  week: number;
  videoLinks: { title: string; url: string; description: string }[];
  documents: { title: string; fileName: string; fileUrl: string; fileType: string }[];
  comments: string;
}

interface ClassLink {
  title: string;
  meetingUrl: string;
  schedule: string;
  description: string;
}

interface BlogPost {
  title: string;
  author: string;
  excerpt: string;
  publishDate: string;
  tags: string[];
  publishImmediately: boolean;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${params?.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch course');
        }
        const data = await response.json();
        setCourse(data.data);
      } catch (error) {
        console.error('Error fetching course:', error);
        toast.error('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchCourse();
    }
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <Button onClick={() => router.push('/courses')}>Back to Courses</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.push('/')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Badge variant="outline" className="mb-2">{course.level}</Badge>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{course.title}</h1>
              <p className="text-lg text-gray-600">{course.description}</p>
            </div>
            {course.isPremium && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                Premium
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-6 text-sm text-gray-600 mt-6">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {Math.floor(course.estimatedDuration / 60)}h {course.estimatedDuration % 60}m
            </div>
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              {course.category}
            </div>
            <div className="flex items-center">
              <GraduationCap className="w-4 h-4 mr-2" />
              Difficulty: {course.difficulty}/5
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-green-500 to-teal-500"
              onClick={() => router.push(`/courses/${course._id}/curriculum`)}
            >
              Start Learning
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => {
                // Handle enrollment
                toast.success('Enrollment feature coming soon!');
              }}
            >
              Enroll Now
            </Button>
          </div>
        </div>

        {/* Tabs for Additional Content */}
        <Tabs defaultValue="objectives" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white">
            <TabsTrigger value="objectives">Learning Objectives</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Content</TabsTrigger>
            <TabsTrigger value="classes">Live Classes</TabsTrigger>
            <TabsTrigger value="blogs">Related Blogs</TabsTrigger>
          </TabsList>

          {/* Learning Objectives Tab */}
          <TabsContent value="objectives">
            <Card>
              <CardHeader>
                <CardTitle>What You'll Learn</CardTitle>
                <CardDescription>Key learning objectives for this course</CardDescription>
              </CardHeader>
              <CardContent>
                {course.learningObjectives && course.learningObjectives.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {course.learningObjectives.map((objective, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span>{objective}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No learning objectives specified.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weekly Content Tab */}
          <TabsContent value="weekly">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Content</CardTitle>
                <CardDescription>Course materials organized by week</CardDescription>
              </CardHeader>
              <CardContent>
                {course.weeklyContent && course.weeklyContent.length > 0 ? (
                  <div className="space-y-6">
                    {course.weeklyContent.map((week, index) => (
                      <div key={index} className="border rounded-lg p-6">
                        <h3 className="text-xl font-semibold mb-4">Week {week.week}</h3>
                        
                        {/* Videos */}
                        {week.videoLinks && week.videoLinks.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2 flex items-center">
                              <Video className="w-4 h-4 mr-2" />
                              Videos ({week.videoLinks.length})
                            </h4>
                            <div className="space-y-3">
                              {week.videoLinks.map((video, vIndex) => (
                                <VideoPlayer
                                  key={vIndex}
                                  title={video.title}
                                  url={video.url}
                                  description={video.description}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Documents */}
                        {week.documents && week.documents.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2 flex items-center">
                              <FileText className="w-4 h-4 mr-2" />
                              Documents ({week.documents.length})
                            </h4>
                            <div className="space-y-2">
                              {week.documents.map((doc, dIndex) => (
                                <div key={dIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                  <div>
                                    <p className="font-medium">{doc.title}</p>
                                    <p className="text-sm text-gray-600">{doc.fileName}</p>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => window.open(doc.fileUrl, '_blank')}
                                  >
                                    Download
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Comments */}
                        {week.comments && (
                          <div className="mt-4 p-3 bg-blue-50 rounded">
                            <p className="text-sm text-gray-700">{week.comments}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No weekly content available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Classes Tab */}
          <TabsContent value="classes">
            <Card>
              <CardHeader>
                <CardTitle>Live Class Schedule</CardTitle>
                <CardDescription>Join our instructor-led sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {course.classLinks && course.classLinks.length > 0 ? (
                  <div className="space-y-4">
                    {course.classLinks.map((classLink, index) => (
                      <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-semibold mb-2">{classLink.title}</h3>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Calendar className="w-4 h-4 mr-2" />
                          {classLink.schedule}
                        </div>
                        {classLink.description && (
                          <p className="text-gray-700 mb-4">{classLink.description}</p>
                        )}
                        <Button 
                          onClick={() => window.open(classLink.meetingUrl, '_blank')}
                          className="w-full"
                        >
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Join Class
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No live classes scheduled.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Related Blogs Tab */}
          <TabsContent value="blogs">
            <Card>
              <CardHeader>
                <CardTitle>Related Blog Posts</CardTitle>
                <CardDescription>Additional resources and articles</CardDescription>
              </CardHeader>
              <CardContent>
                {course.blogPosts && course.blogPosts.length > 0 ? (
                  <div className="space-y-4">
                    {course.blogPosts
                      .filter(blog => blog.publishImmediately)
                      .map((blog, index) => (
                        <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                          <h3 className="text-lg font-semibold mb-2">{blog.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">By {blog.author}</p>
                          <p className="text-gray-700 mb-3">{blog.excerpt}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                              {blog.tags.map((tag, tIndex) => (
                                <Badge key={tIndex} variant="outline">{tag}</Badge>
                              ))}
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => router.push('/blog')}
                            >
                              Read More
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No blog posts available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Instructor Notes */}
        {course.instructorNotes && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Instructor Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{course.instructorNotes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
