'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { courseStorage, Course, Lesson } from '@/lib/courseStorage';
import {
  Clock,
  BookOpen,
  Users,
  Star,
  ArrowLeft,
  Play,
  CheckCircle,
  Award,
  Globe,
  Target,
  TrendingUp,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

export default function CourseDetails() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = () => {
    setIsLoading(true);
    try {
      // Check if it's a fallback course
      if (courseId?.startsWith('fallback-')) {
        // Handle fallback courses - you could redirect or show a message
        setIsLoading(false);
        return;
      }
      
      const foundCourse = courseStorage.getCourseById(courseId);
      setCourse(foundCourse);
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    const colors = {
      'N5': 'from-green-500 to-teal-500',
      'N4': 'from-blue-500 to-cyan-500',
      'N3': 'from-yellow-500 to-orange-500',
      'N2': 'from-orange-500 to-red-500',
      'N1': 'from-red-500 to-pink-500',
      'Beginner': 'from-green-500 to-teal-500',
      'Intermediate': 'from-blue-500 to-indigo-500',
      'Advanced': 'from-purple-500 to-pink-500',
    };
    return colors[level as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free';
    const symbols = { USD: '$', EUR: '€', JPY: '¥', GBP: '£' };
    return `${symbols[currency as keyof typeof symbols] || currency}${price}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTotalDuration = () => {
    if (!course) return 0;
    return course.lessons.reduce((total, lesson) => total + lesson.duration, 0);
  };

  const getTotalVocabulary = () => {
    if (!course) return 0;
    return course.lessons.reduce((total, lesson) => total + lesson.vocabulary.length, 0);
  };

  const getTotalGrammar = () => {
    if (!course) return 0;
    return course.lessons.reduce((total, lesson) => total + lesson.grammar.length, 0);
  };

  const handleStartCourse = () => {
    // In a real app, this would start the first lesson or show enrollment
    alert('Course enrollment functionality would be implemented here!');
  };

  const toggleLessonExpansion = (lessonId: string) => {
    setExpandedLesson(expandedLesson === lessonId ? null : lessonId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-300 rounded-lg"></div>
                <div className="h-32 bg-gray-300 rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-gray-300 rounded-lg"></div>
                <div className="h-32 bg-gray-300 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Course Not Found</h1>
            <p className="text-gray-600">
              {courseId?.startsWith('fallback-') 
                ? "This is a demo course. Please check back later for real courses!"
                : "The requested course could not be found."
              }
            </p>
            <Button onClick={() => router.push('/#courses')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const levelColor = getLevelColor(course.level);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/#courses')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={`bg-gradient-to-r ${levelColor} text-white`}>
                  {course.level}
                </Badge>
                <Badge variant="secondary">
                  {formatPrice(course.price, course.currency)}
                </Badge>
                <Badge variant={course.isActive ? 'default' : 'secondary'}>
                  {course.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold text-gray-900">{course.name}</h1>
              <p className="text-xl text-gray-600 max-w-3xl">{course.description}</p>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button 
                size="lg" 
                className={`bg-gradient-to-r ${levelColor} hover:opacity-90 text-white`}
                onClick={handleStartCourse}
              >
                <Play className="w-5 h-5 mr-2" />
                Start Learning
              </Button>
              <div className="text-sm text-gray-500 text-center">
                {course.enrolledStudents} students enrolled
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Course Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">{course.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Lessons</span>
                      <span className="font-medium">{course.lessons.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Time</span>
                      <span className="font-medium">{Math.floor(getTotalDuration() / 60)}h {getTotalDuration() % 60}m</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Vocabulary Words</span>
                      <span className="font-medium">{getTotalVocabulary()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Grammar Points</span>
                      <span className="font-medium">{getTotalGrammar()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Created</span>
                      <span className="font-medium">{formatDate(course.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Curriculum */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Course Curriculum
                </CardTitle>
                <CardDescription>
                  Detailed breakdown of lessons and learning materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                {course.lessons.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No lessons available yet.</p>
                    <p className="text-sm">The curriculum is being developed.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {course.lessons.map((lesson, index) => (
                      <div key={lesson.id} className="border rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleLessonExpansion(lesson.id)}
                          className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium">{lesson.title}</h4>
                              <p className="text-sm text-gray-500">{lesson.description}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {lesson.duration} min
                                </span>
                                <span>{lesson.vocabulary.length} vocabulary</span>
                                <span>{lesson.grammar.length} grammar</span>
                              </div>
                            </div>
                          </div>
                          {expandedLesson === lesson.id ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </button>
                        
                        {expandedLesson === lesson.id && (
                          <div className="px-4 pb-4 border-t bg-gray-50">
                            <div className="pt-4 space-y-6">
                              {/* Vocabulary Section */}
                              {lesson.vocabulary.length > 0 && (
                                <div>
                                  <h5 className="font-medium mb-3 flex items-center">
                                    <Globe className="w-4 h-4 mr-2" />
                                    Vocabulary ({lesson.vocabulary.length})
                                  </h5>
                                  <div className="grid gap-3">
                                    {lesson.vocabulary.slice(0, 3).map((vocab) => (
                                      <div key={vocab.id} className="bg-white p-3 rounded border">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <div className="font-medium">{vocab.word}</div>
                                            <div className="text-sm text-gray-500">{vocab.hiragana}</div>
                                          </div>
                                          <div className="text-right">
                                            <div className="font-medium text-sm">{vocab.meaning}</div>
                                            <div className="text-xs text-gray-500">{vocab.romaji}</div>
                                          </div>
                                        </div>
                                        {vocab.example && (
                                          <div className="mt-2 pt-2 border-t text-xs">
                                            <div className="text-gray-700">{vocab.example}</div>
                                            <div className="text-gray-500">{vocab.exampleTranslation}</div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                    {lesson.vocabulary.length > 3 && (
                                      <div className="text-center text-sm text-gray-500">
                                        And {lesson.vocabulary.length - 3} more vocabulary words...
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Grammar Section */}
                              {lesson.grammar.length > 0 && (
                                <div>
                                  <h5 className="font-medium mb-3 flex items-center">
                                    <Award className="w-4 h-4 mr-2" />
                                    Grammar ({lesson.grammar.length})
                                  </h5>
                                  <div className="grid gap-3">
                                    {lesson.grammar.slice(0, 2).map((grammar) => (
                                      <div key={grammar.id} className="bg-white p-3 rounded border">
                                        <div className="font-medium">{grammar.title}</div>
                                        <div className="text-sm text-gray-600 mt-1">{grammar.description}</div>
                                        {grammar.structure && (
                                          <div className="mt-2 text-xs">
                                            <span className="font-medium">Structure: </span>
                                            <code className="bg-gray-100 px-2 py-1 rounded">{grammar.structure}</code>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                    {lesson.grammar.length > 2 && (
                                      <div className="text-center text-sm text-gray-500">
                                        And {lesson.grammar.length - 2} more grammar points...
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Course Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="text-sm">Students</span>
                    </div>
                    <span className="font-semibold">{course.enrolledStudents}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-2 text-yellow-500" />
                      <span className="text-sm">Rating</span>
                    </div>
                    <span className="font-semibold">4.8/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      <span className="text-sm">Completion</span>
                    </div>
                    <span className="font-semibold">89%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleStartCourse}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Course
                </Button>
                <Button variant="outline" className="w-full">
                  Add to Wishlist
                </Button>
                <Button variant="ghost" className="w-full">
                  Share Course
                </Button>
              </CardContent>
            </Card>

            {/* Learning Path */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Path</CardTitle>
                <CardDescription>Recommended progression</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Complete all lessons
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Practice vocabulary daily
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Master grammar points
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-gray-300 mr-2" />
                    Take final assessment
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