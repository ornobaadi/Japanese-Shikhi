"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
  Globe
} from 'lucide-react';
import { Navbar5 } from '@/components/navbar-5';

interface Lesson {
  _id: string;
  title: string;
  estimatedDuration: number;
  type: 'video' | 'text' | 'quiz' | 'exercise';
}

interface Course {
  _id: string;
  title: string;
  titleJp?: string;
  description: string;
  descriptionJp?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  thumbnailUrl?: string;
  estimatedDuration: number;
  enrolledStudents: number;
  averageRating: number;
  totalRatings: number;
  totalLessons: number;
  actualPrice?: number;
  discountedPrice?: number;
  enrollmentDeadline?: string;
  isPremium: boolean;
  learningObjectives: string[];
  prerequisites: string[];
  lessons: Lesson[];
  formattedDuration: string;
  difficultyLabel: string;
  instructorNotes?: string;
  courseLanguage: {
    primary: string;
    secondary: string;
  };
}

export default function CourseCurriculumPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseId = params?.id;
        if (!courseId) {
          setError('Course ID not found');
          setLoading(false);
          return;
        }
        
        const res = await fetch(`/api/courses/${courseId}`);
        const data = await res.json();
        
        if (data.success) {
          setCourse(data.data);
        } else {
          setError(data.error || 'Course not found');
        }
      } catch (error) {
        console.error('Failed to fetch course:', error);
        setError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchCourse();
    }
  }, [params?.id]);

  const handleEnrollClick = () => {
    if (!course) return;
    
    if (isSignedIn) {
      router.push(`/payment/${course._id}`);
    } else {
      localStorage.setItem('pendingCourseEnrollment', course._id);
      router.push('/sign-in');
    }
  };

  const getDaysLeft = (deadline?: string) => {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayCircle className="w-4 h-4" />;
      case 'quiz': return <Target className="w-4 h-4" />;
      case 'exercise': return <Award className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-24" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full mb-6" />
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-20 w-full mb-6" />
              <Skeleton className="h-40 w-full" />
            </div>
            <div>
              <Skeleton className="h-80 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/courses')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const daysLeft = getDaysLeft(course.enrollmentDeadline);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar5 />
      
      {/* Top spacing for floating navbar */}
      <div className="h-24" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          onClick={() => router.push('/courses')} 
          variant="ghost" 
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
              {course.thumbnailUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-lg mb-6">
                  <img 
                    src={course.thumbnailUrl} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-2">
                  <Badge className={`${getLevelColor(course.level)}`}>
                    {course.level}
                  </Badge>
                  <Badge variant="outline">{course.category}</Badge>
                  {course.isPremium && (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                      Premium
                    </Badge>
                  )}
                </div>
                
                {course.averageRating > 0 && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                    <span>{course.averageRating.toFixed(1)} ({course.totalRatings} reviews)</span>
                  </div>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {course.title}
              </h1>
              
              {course.titleJp ? (
                <h2 className="text-xl text-gray-600 mb-4 font-japanese">
                  {course.titleJp}
                </h2>
              ) : (
                <div className="text-xl text-gray-400 mb-4">-</div>
              )}
              
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                {course.description || '-'}
              </p>
              
              {course.descriptionJp ? (
                <p className="text-gray-600 mb-6 font-japanese leading-relaxed">
                  {course.descriptionJp}
                </p>
              ) : (
                <p className="text-gray-400 mb-6">-</p>
              )}

              {/* Course Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{course.enrolledStudents || 0}</div>
                  <div className="text-sm text-gray-600">Students</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{course.formattedDuration || '-'}</div>
                  <div className="text-sm text-gray-600">Duration</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <BookOpen className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{course.totalLessons || 0}</div>
                  <div className="text-sm text-gray-600">Lessons</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Globe className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{course.difficultyLabel || '-'}</div>
                  <div className="text-sm text-gray-600">Difficulty</div>
                </div>
              </div>
            </div>

            {/* Learning Objectives */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-500" />
                  What You'll Learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                {course.learningObjectives && course.learningObjectives.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-3">
                    {course.learningObjectives.map((objective, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{objective}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">No learning objectives specified</div>
                )}
              </CardContent>
            </Card>

            {/* Prerequisites */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-orange-500" />
                  Prerequisites
                </CardTitle>
              </CardHeader>
              <CardContent>
                {course.prerequisites && course.prerequisites.length > 0 ? (
                  <ul className="space-y-2">
                    {course.prerequisites.map((prerequisite, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{prerequisite}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-500 italic">No prerequisites required</div>
                )}
              </CardContent>
            </Card>

            {/* Course Curriculum */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-purple-500" />
                  Course Curriculum
                </CardTitle>
              </CardHeader>
              <CardContent>
                {course.lessons && course.lessons.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {course.lessons.map((lesson, index) => (
                      <AccordionItem key={lesson._id} value={`lesson-${index}`}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-center justify-between w-full mr-4">
                            <div className="flex items-center">
                              {getLessonIcon(lesson.type)}
                              <span className="ml-3 font-medium">
                                Lesson {index + 1}: {lesson.title}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="w-3 h-3 mr-1" />
                              {lesson.estimatedDuration ? `${Math.floor(lesson.estimatedDuration / 60)}h ${lesson.estimatedDuration % 60}m` : '-'}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-7 pt-2 text-muted-foreground">
                            This {lesson.type || 'lesson'} covers important concepts and will take approximately {lesson.estimatedDuration || 'N/A'} minutes to complete.
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-muted-foreground">Curriculum details will be available soon.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-32">
              <CardContent className="p-6">
                {/* Pricing */}
                {(course.actualPrice || course.discountedPrice) && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-600">Price</span>
                    </div>
                    {course.discountedPrice && course.actualPrice ? (
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-green-600">
                          ${course.discountedPrice}
                        </span>
                        <span className="text-lg text-gray-500 line-through">
                          ${course.actualPrice}
                        </span>
                        <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                          {Math.round((1 - course.discountedPrice / course.actualPrice) * 100)}% OFF
                        </span>
                      </div>
                    ) : (
                      <div className="text-3xl font-bold text-gray-900">
                        ${course.actualPrice || course.discountedPrice}
                      </div>
                    )}
                  </div>
                )}

                {/* Enrollment Deadline */}
                {daysLeft !== null && (
                  <div className="mb-6 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center text-orange-800">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="font-medium">
                        {daysLeft > 0 ? `${daysLeft} days left to enroll` : 'Enrollment closing soon!'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Enroll Button */}
                <Button 
                  onClick={handleEnrollClick}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:opacity-90 text-lg py-6 mb-4"
                  size="lg"
                >
                  Enroll Now
                </Button>

                {/* Course Tags */}
                {course.tags && course.tags.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Course Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {course.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                <div className="pt-4 border-t mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Languages</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>Primary: {course.courseLanguage?.primary || '-'}</div>
                    <div>Secondary: {course.courseLanguage?.secondary || '-'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}