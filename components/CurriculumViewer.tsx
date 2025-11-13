'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  Clock, 
  Users, 
  Calendar,
  Star,
  BookOpen,
  DollarSign,
  CheckCircle,
  PlayCircle,
  Target,
  Award,
  Globe,
  Lock,
  Unlock,
  Video,
  FileText,
  Youtube,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

interface CurriculumItem {
  _id?: string;
  type: 'live-class' | 'announcement' | 'resource' | 'assignment' | 'quiz';
  title: string;
  description?: string;
  scheduledDate: Date;
  meetingLink?: string;
  meetingPlatform?: 'zoom' | 'google-meet' | 'other';
  duration?: number;
  resourceType?: 'pdf' | 'video' | 'youtube' | 'recording' | 'drive' | 'other';
  resourceUrl?: string;
  resourceFile?: string;
  hasAccess: boolean;
  isLocked: boolean;
  requiresEnrollment: boolean;
  isFreePreview?: boolean;
}

interface Module {
  _id?: string;
  name: string;
  description: string;
  items: CurriculumItem[];
  isPublished: boolean;
  order: number;
}

interface AccessInfo {
  isEnrolled: boolean;
  hasAccess: boolean;
  canPreview: boolean;
  freePreviewCount: number;
  isLoggedIn: boolean;
}

interface CurriculumData {
  modules: Module[];
}

interface Course {
  _id: string;
  title: string;
  description: string;
  curriculum: CurriculumData;
  accessInfo: AccessInfo;
}

interface CurriculumViewerProps {
  courseId: string;
}

const CurriculumViewer = ({ courseId }: CurriculumViewerProps) => {
  const router = useRouter();
  const { user } = useUser();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) {
        console.log('No course ID provided');
        return;
      }

      try {
        setLoading(true);
        
        // Check if user is admin
        const adminCheck = user?.publicMetadata?.role === 'admin';
        setIsAdmin(!!adminCheck);
        
        const apiUrl = `/api/courses/${courseId}/curriculum`;
        console.log('Fetching curriculum for course ID:', courseId);
        console.log('API URL:', apiUrl);
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', { status: response.status, error: errorText });
          throw new Error(`Failed to fetch course data: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        if (data.success) {
          setCourse({
            _id: courseId,
            title: data.title || 'Course',
            description: data.description || '',
            curriculum: data.curriculum,
            accessInfo: data.accessInfo
          });
        } else {
          throw new Error(data.error || 'Failed to load curriculum');
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, user]);

  const handleEnrollClick = () => {
    if (!user) {
      router.push('/sign-in');
      return;
    }
    // Navigate to enrollment/payment page
    router.push(`/payment/${courseId}`);
  };

  const handleItemClick = (item: CurriculumItem) => {
    if (!item.hasAccess) {
      // Show enrollment prompt with toast
      if (!user) {
        toast.error('Please sign in to access more content', {
          description: 'You can preview the first 2 items (videos, PDFs, quizzes, assignments) for free',
          action: {
            label: 'Sign In',
            onClick: () => router.push('/sign-in')
          }
        });
      } else {
        toast.error('This content is locked', {
          description: 'Enroll in the course to unlock all content',
          action: {
            label: 'Enroll Now',
            onClick: () => router.push(`/payment/${courseId}`)
          }
        });
      }
      return;
    }

    // Handle different resource types
    if (item.resourceUrl) {
      if (item.resourceType === 'youtube') {
        window.open(item.resourceUrl, '_blank');
      } else if (item.resourceType === 'drive') {
        window.open(item.resourceUrl, '_blank');
      } else {
        // Handle other video types
        window.open(item.resourceUrl, '_blank');
      }
    }
  };

  const getItemIcon = (item: CurriculumItem) => {
    if (item.isLocked) {
      return <Lock className="h-4 w-4 text-gray-400" />;
    }

    switch (item.type) {
      case 'resource':
        switch (item.resourceType) {
          case 'video':
          case 'recording':
            return <Video className="h-4 w-4 text-blue-600" />;
          case 'youtube':
            return <Youtube className="h-4 w-4 text-red-600" />;
          case 'drive':
            return <ExternalLink className="h-4 w-4 text-green-600" />;
          case 'pdf':
            return <FileText className="h-4 w-4 text-orange-600" />;
          default:
            return <BookOpen className="h-4 w-4 text-gray-600" />;
        }
      case 'live-class':
        return <Calendar className="h-4 w-4 text-purple-600" />;
      case 'quiz':
        return <Target className="h-4 w-4 text-indigo-600" />;
      case 'assignment':
        return <CheckCircle className="h-4 w-4 text-teal-600" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Failed to load course data'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>
        
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          {isAdmin && (
            <Badge className="bg-purple-100 text-purple-800 border-purple-300">
              👑 Admin Access - Full Course Access
            </Badge>
          )}
        </div>
        
        {/* Access Status */}
        {!isAdmin && !course.accessInfo.isEnrolled && course.accessInfo.canPreview && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>🎁 Free Preview Available!</strong> You can access the first {course.accessInfo.freePreviewCount} items (videos, PDFs, quizzes, or assignments) completely free. 
              {!course.accessInfo.isLoggedIn ? (
                <> <strong>Sign in and enroll</strong> to get full access to all {course.curriculum.modules.reduce((acc: number, m: Module) => acc + m.items.length, 0)} course items!</>
              ) : (
                <> <strong>Enroll now</strong> to unlock all {course.curriculum.modules.reduce((acc: number, m: Module) => acc + m.items.length, 0)} course materials!</>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {!isAdmin && course.accessInfo.isEnrolled && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>✓ Enrolled!</strong> You have full access to all course content.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Curriculum Content */}
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {course.curriculum.modules.length > 0 ? (
            <Accordion type="multiple" className="space-y-4">
              {course.curriculum.modules.map((module, moduleIndex) => (
                <AccordionItem 
                  key={module._id || moduleIndex} 
                  value={`module-${moduleIndex}`}
                  className="border rounded-lg"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                      <div className="text-left">
                        <h3 className="font-semibold text-lg">{module.name}</h3>
                        {module.description && (
                          <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                        )}
                      </div>
                      <Badge variant="secondary">
                        {module.items.length} items
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="space-y-3">
                      {module.items.map((item, itemIndex) => (
                        <Card 
                          key={item._id || itemIndex}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            item.hasAccess 
                              ? 'hover:border-blue-300' 
                              : 'opacity-75 bg-gray-50'
                          }`}
                          onClick={() => handleItemClick(item)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {getItemIcon(item)}
                                <div>
                                  <h4 className={`font-medium ${
                                    item.isLocked ? 'text-gray-500' : 'text-gray-900'
                                  }`}>
                                    {item.title}
                                  </h4>
                                  {item.description && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      {item.description}
                                    </p>
                                  )}
                                  {item.duration && (
                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {item.duration} min
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {item.isFreePreview && (
                                  <Badge variant="outline" className="text-green-600">
                                    Free
                                  </Badge>
                                )}
                                
                                {item.isLocked ? (
                                  <Lock className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Unlock className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Content Available</h3>
                <p className="text-gray-600">This course curriculum is being prepared.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {isAdmin ? (
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>👑 Admin Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-purple-700">
                    <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
                    Full course access as admin
                  </div>
                  <div className="flex items-center text-sm text-purple-700">
                    <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
                    View all content without enrollment
                  </div>
                  <div className="flex items-center text-sm text-purple-700">
                    <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
                    Manage course settings
                  </div>
                </div>
                
                <Button 
                  onClick={() => router.push(`/admin-dashboard/courses/${courseId}`)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  Edit Course
                </Button>
              </CardContent>
            </Card>
          ) : !course.accessInfo.isEnrolled && (
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Get Full Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Access to all videos
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Downloadable resources
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Lifetime access
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Certificate of completion
                  </div>
                </div>
                
                <Button 
                  onClick={handleEnrollClick}
                  className="w-full"
                  size="lg"
                >
                  Enroll Now
                </Button>
                
                {!course.accessInfo.isLoggedIn && (
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/sign-in')}
                    className="w-full"
                  >
                    Sign In
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurriculumViewer;