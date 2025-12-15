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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  AlertCircle,
  Download,
  Eye,
  X,
  Link as LinkIcon
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
  driveLinks?: Array<{ title: string; link: string }>;
  attachments?: Array<{ name: string; url: string; type?: string }>;
  dueDate?: Date;
  quizData?: any;
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
  const [selectedResource, setSelectedResource] = useState<CurriculumItem | null>(null);

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
          description: 'You can preview one of each content type (Live Class, Quiz, Assignment, Announcement, Resource) from the first section for free',
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

    // Handle live class - open meeting link directly
    if (item.type === 'live-class' && item.meetingLink) {
      window.open(item.meetingLink, '_blank');
      toast.success('Opening meeting link');
      return;
    }

    // Handle resource type or assignment - show dialog with all resources/attachments
    if (item.type === 'resource' || item.type === 'assignment') {
      console.log('Opening resource/assignment viewer:', {
        title: item.title,
        type: item.type,
        driveLinks: item.driveLinks,
        attachments: item.attachments,
        resourceUrl: item.resourceUrl,
        resourceFile: item.resourceFile,
        fullItem: item
      });
      setSelectedResource(item);
      return;
    }

    // For other types, show info
    if (item.description) {
      toast.info(item.title, {
        description: item.description
      });
    } else {
      toast.info('Content available', {
        description: 'This ' + item.type + ' is unlocked!'
      });
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
              <strong>🎁 Free Preview Available!</strong> You can preview one of each content type (Live Class, Quiz, Assignment, Announcement, Resource) from the first section completely free. 
              {!course.accessInfo.isLoggedIn ? (
                <> <strong>Sign in and enroll</strong> to get full access to all course sections and materials!</>
              ) : (
                <> <strong>Enroll now</strong> to unlock all course sections and materials!</>
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
                          className={`transition-all relative ${
                            item.hasAccess 
                              ? 'cursor-pointer hover:shadow-lg hover:border-blue-400 hover:scale-[1.02] border-2 border-blue-200 bg-white' 
                              : 'opacity-60 bg-gray-50 cursor-not-allowed'
                          }`}
                          onClick={() => handleItemClick(item)}
                        >
                          <CardContent className="p-4">
                            {/* Lock/Unlock Indicator */}
                            <div className="absolute top-3 right-3 z-10">
                              <div className={`p-1.5 rounded-full shadow-sm border-2 ${
                                item.hasAccess 
                                  ? 'bg-green-50 border-green-200' 
                                  : 'bg-gray-100 border-gray-300'
                              }`}>
                                {item.isLocked ? (
                                  <Lock className="h-3.5 w-3.5 text-gray-400" />
                                ) : (
                                  <Unlock className="h-3.5 w-3.5 text-green-500" />
                                )}
                              </div>
                            </div>

                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start space-x-3 flex-1">
                                {getItemIcon(item)}
                                <div className="flex-1">
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
                                  
                                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    {item.duration && (
                                      <Badge variant="outline" className="text-xs">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {item.duration} min
                                      </Badge>
                                    )}
                                    
                                    {item.isFreePreview && (
                                      <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                                        🎁 Free Preview
                                      </Badge>
                                    )}
                                    
                                    {item.type === 'live-class' && item.meetingLink && item.hasAccess && (
                                      <Badge variant="secondary" className="text-xs">
                                        <LinkIcon className="h-3 w-3 mr-1" />
                                        {item.meetingPlatform === 'zoom' ? 'Zoom' : item.meetingPlatform === 'google-meet' ? 'Google Meet' : 'Meeting'}
                                      </Badge>
                                    )}
                                    
                                    {item.type === 'resource' && item.hasAccess && (
                                      <>
                                        <Badge variant="outline" className="text-xs">
                                          {item.resourceType && <span className="capitalize">{item.resourceType}</span>}
                                          {!item.resourceType && 'Resource'}
                                        </Badge>
                                        {((item as any).driveLinks?.length > 0 || (item as any).attachments?.length > 0) && (
                                          <div className="text-xs text-green-700 flex items-center gap-2">
                                            {(item as any).driveLinks?.length > 0 && (
                                              <span>🔗 {(item as any).driveLinks.length} Link(s)</span>
                                            )}
                                            {(item as any).attachments?.length > 0 && (
                                              <span>📁 {(item as any).attachments.length} File(s)</span>
                                            )}
                                          </div>
                                        )}
                                      </>
                                    )}
                                    
                                    {item.type === 'assignment' && item.hasAccess && (
                                      <>
                                        <Badge variant="outline" className="text-xs">
                                          Assignment
                                        </Badge>
                                        {(item.resourceUrl || item.resourceFile || (item as any).attachments?.length > 0) && (
                                          <div className="text-xs text-purple-700 flex items-center gap-2">
                                            <span>📎 Attached File(s)</span>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Action Buttons */}
                              {item.hasAccess && (
                                <div className="flex items-center gap-2">
                                  {item.type === 'live-class' && item.meetingLink && (
                                    <Button 
                                      variant="default" 
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(item.meetingLink, '_blank');
                                        toast.success('Opening meeting link');
                                      }}
                                    >
                                      <LinkIcon className="h-3 w-3 mr-1" />
                                      Join
                                    </Button>
                                  )}
                                  
                                  {(item.type === 'resource' || item.type === 'assignment') && (
                                    <Button 
                                      variant="default" 
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedResource(item);
                                      }}
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      View
                                    </Button>
                                  )}
                                </div>
                              )}
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

      {/* Resource Dialog - Display drive links and attachments */}
      <Dialog open={!!selectedResource} onOpenChange={() => setSelectedResource(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedResource && getItemIcon(selectedResource)}
              {selectedResource?.title}
            </DialogTitle>
            {selectedResource?.description && (
              <DialogDescription>{selectedResource.description}</DialogDescription>
            )}
          </DialogHeader>
          
          {selectedResource && (
            <div className="space-y-6 mt-4">
              {/* Assignment Info Badge */}
              {selectedResource.type === 'assignment' && (
                <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-semibold text-purple-900">Assignment</p>
                    <p className="text-xs text-purple-700">Download the files below to complete your assignment</p>
                  </div>
                </div>
              )}
              
              {/* Drive Links */}
              {(selectedResource as any).driveLinks && (selectedResource as any).driveLinks.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Google Drive Links ({(selectedResource as any).driveLinks.length})
                  </h3>
                  <div className="space-y-4">
                    {(selectedResource as any).driveLinks.map((driveLink: any, idx: number) => (
                      <div key={idx} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <p className="text-sm font-medium text-green-800">{driveLink.title}</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // Extract URL from iframe HTML if it's an iframe
                              const match = driveLink.link.match(/src=["']([^"']+)["']/);
                              const url = match ? match[1] : driveLink.link;
                              window.open(url, '_blank');
                            }}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Open
                          </Button>
                        </div>
                        <div 
                          className="w-full aspect-video rounded border border-green-300 overflow-hidden bg-white"
                          dangerouslySetInnerHTML={{ __html: driveLink.link }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {(selectedResource as any).attachments && (selectedResource as any).attachments.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Uploaded Files ({(selectedResource as any).attachments.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(selectedResource as any).attachments.map((attachment: any, idx: number) => (
                      <div key={idx} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex flex-col gap-3">
                          {/* Preview */}
                          {attachment.url?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                            <div className="w-full h-32 rounded border border-blue-300 overflow-hidden bg-white">
                              <img src={attachment.url} alt={attachment.name || ''} className="w-full h-full object-cover" />
                            </div>
                          ) : attachment.url?.endsWith('.pdf') ? (
                            <div className="w-full h-32 rounded bg-red-100 flex items-center justify-center">
                              <FileText className="h-12 w-12 text-red-600" />
                            </div>
                          ) : (
                            <div className="w-full h-32 rounded bg-blue-100 flex items-center justify-center">
                              <FileText className="h-12 w-12 text-blue-600" />
                            </div>
                          )}
                          
                          {/* File Info */}
                          <div>
                            <p className="text-sm font-medium text-blue-800 truncate mb-2">{attachment.name}</p>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 text-xs"
                                asChild
                              >
                                <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </a>
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="flex-1 text-xs"
                                asChild
                              >
                                <a href={attachment.url} download={attachment.name}>
                                  <Download className="h-3 w-3 mr-1" />
                                  Download
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legacy single file support */}
              {(selectedResource.resourceUrl || selectedResource.resourceFile) && 
               !(selectedResource as any).driveLinks?.length && 
               !(selectedResource as any).attachments?.length && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {selectedResource.type === 'assignment' ? 'Assignment File' : 'Resource File'}
                  </h3>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    {/* Preview for images */}
                    {selectedResource.resourceUrl?.startsWith('data:image/') && (
                      <div className="mb-4">
                        <img 
                          src={selectedResource.resourceUrl} 
                          alt={selectedResource.title}
                          className="max-w-full h-auto rounded border border-gray-300"
                        />
                      </div>
                    )}
                    
                    {/* Preview for PDFs */}
                    {selectedResource.resourceUrl?.startsWith('data:application/pdf') && (
                      <div className="mb-4 flex items-center justify-center p-8 bg-red-50 border border-red-200 rounded">
                        <FileText className="h-16 w-16 text-red-600" />
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        asChild
                        className="flex-1"
                      >
                        <a
                          href={selectedResource.resourceUrl || selectedResource.resourceFile}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </a>
                      </Button>
                      <Button 
                        variant="default" 
                        asChild
                        className="flex-1"
                      >
                        <a
                          href={selectedResource.resourceUrl || selectedResource.resourceFile}
                          download={selectedResource.resourceFile || selectedResource.title}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    </div>
                    
                    {selectedResource.resourceFile && (
                      <p className="text-xs text-gray-600 mt-2 text-center">
                        {selectedResource.resourceFile}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* No content message */}
              {!(selectedResource as any).driveLinks?.length && 
               !(selectedResource as any).attachments?.length && 
               !selectedResource.resourceUrl && 
               !selectedResource.resourceFile && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No files or links attached to this resource yet.</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CurriculumViewer;