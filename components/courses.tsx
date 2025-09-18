'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { courseStorage, Course } from "@/lib/courseStorage";
import {
  Clock,
  BookOpen,
  CheckCircle,
  ArrowRight,
  Users,
  Star,
  Play,
  Eye,
  TrendingUp,
  Award,
} from "lucide-react";

export default function Courses() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCourses();
    // Add a listener for storage changes to refresh when courses are added
    const handleStorageChange = () => {
      loadCourses();
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also check periodically in case storage event doesn't fire
    const interval = setInterval(loadCourses, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const loadCourses = () => {
    try {
      const allCourses = courseStorage.getAllCourses();
      console.log('Loaded courses:', allCourses); // Debug log
      // Only show active courses on the landing page
      const activeCourses = allCourses.filter(course => course.isActive);
      setCourses(activeCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    const colors = {
      'N5': 'bg-emerald-500',
      'N4': 'bg-blue-500',
      'N3': 'bg-amber-500',
      'N2': 'bg-orange-500',
      'N1': 'bg-red-500',
      'Beginner': 'bg-emerald-500',
      'Intermediate': 'bg-blue-500',
      'Advanced': 'bg-purple-500',
    };
    return colors[level as keyof typeof colors] || 'bg-gray-500';
  };

  const getLevelGradient = (level: string) => {
    const gradients = {
      'N5': 'from-emerald-500 to-teal-500',
      'N4': 'from-blue-500 to-cyan-500',
      'N3': 'from-amber-500 to-orange-500',
      'N2': 'from-orange-500 to-red-500',
      'N1': 'from-red-500 to-pink-500',
      'Beginner': 'from-emerald-500 to-teal-500',
      'Intermediate': 'from-blue-500 to-indigo-500',
      'Advanced': 'from-purple-500 to-pink-500',
    };
    return gradients[level as keyof typeof gradients] || 'from-gray-500 to-gray-600';
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free';
    const symbols = { USD: '$', EUR: '€', JPY: '¥', GBP: '£' };
    return `${symbols[currency as keyof typeof symbols] || currency}${price}`;
  };

  const handleStartCourse = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

  const handleViewCurriculum = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

  // Force a refresh button for debugging
  const handleRefresh = () => {
    loadCourses();
  };

  // Fallback content when no courses are available
  const fallbackCourses = [
    {
      id: 'fallback-1',
      level: 'Beginner',
      title: 'Foundation Course',
      description: 'Start your Japanese journey with hiragana, katakana, and basic grammar',
      duration: '8 weeks',
      lessons: 32,
      topics: ["Hiragana & Katakana", "Basic Grammar", "Numbers & Time", "Daily Conversations"],
      color: "from-green-500 to-teal-500",
      price: 0,
      currency: 'USD',
      enrolledStudents: 150
    },
    {
      id: 'fallback-2',
      level: 'Intermediate',
      title: 'Building Fluency',
      description: 'Advance your skills with kanji, complex grammar, and practical conversations',
      duration: '12 weeks',
      lessons: 48,
      topics: ["Kanji Basics", "Verb Conjugations", "Complex Sentences", "Business Japanese"],
      color: "from-blue-500 to-indigo-500",
      price: 99,
      currency: 'USD',
      enrolledStudents: 89
    },
    {
      id: 'fallback-3',
      level: 'Advanced',
      title: 'Native Proficiency',
      description: 'Master advanced Japanese with literature, keigo, and JLPT preparation',
      duration: '16 weeks',
      lessons: 64,
      topics: ["Advanced Kanji", "Keigo (Honorifics)", "Literature", "JLPT Preparation"],
      color: "from-purple-500 to-pink-500",
      price: 149,
      currency: 'USD',
      enrolledStudents: 45
    }
  ];

  const coursesToDisplay = courses.length > 0 ? courses : (isLoading ? [] : fallbackCourses);

  if (isLoading) {
    return (
      <section id="courses" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Complete Learning Path
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Loading our amazing courses...
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="overflow-hidden border-0 shadow-lg animate-pulse">
                <div className="h-2 bg-gradient-to-r from-gray-300 to-gray-400"></div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-300 rounded-full w-16"></div>
                      <div className="h-6 bg-gray-300 rounded-full w-12"></div>
                    </div>
                    <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-16 bg-gray-300 rounded"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-300 rounded w-20"></div>
                      <div className="h-4 bg-gray-300 rounded w-16"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-10 bg-gray-300 rounded"></div>
                      <div className="h-8 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="courses" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Complete Learning Path
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {courses.length > 0 
              ? "Master Japanese step by step with our carefully crafted curriculum"
              : "Discover our comprehensive Japanese language courses"
            }
          </p>
          {/* Debug info and refresh button */}
          <div className="flex justify-center items-center gap-4 text-sm text-gray-500">
            <span>Found {courses.length} active courses</span>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Refresh Courses
            </Button>
          </div>
        </div>

        {/* Display courses in modern card grid */}
        {courses.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => {
              const levelColor = getLevelColor(course.level);
              const levelGradient = getLevelGradient(course.level);
              
              return (
                <Card key={course.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white">
                  {/* Header with gradient */}
                  <div className={`h-32 bg-gradient-to-br ${levelGradient} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      <Badge className={`${levelColor} text-white border-0 shadow-lg`}>
                        {course.level}
                      </Badge>
                      <Badge variant="secondary" className="bg-white/90 text-gray-900 font-semibold">
                        {formatPrice(course.price, course.currency)}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="flex items-center gap-3 text-sm font-medium">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {course.enrolledStudents}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-current" />
                          4.8
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-4">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {course.name}
                      </CardTitle>
                      <CardDescription className="text-gray-600 line-clamp-3 leading-relaxed">
                        {course.description}
                      </CardDescription>
                    </div>

                    {/* Course stats */}
                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-100">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-500 text-sm">
                          <Clock className="w-4 h-4" />
                          Duration
                        </div>
                        <div className="font-semibold text-gray-900">{course.duration}</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-500 text-sm">
                          <BookOpen className="w-4 h-4" />
                          Lessons
                        </div>
                        <div className="font-semibold text-gray-900">{course.lessons.length}</div>
                      </div>
                    </div>

                    {/* Course highlights */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Course Highlights:</div>
                      <div className="space-y-1">
                        {course.lessons.slice(0, 3).map((lesson, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                            <span className="line-clamp-1">{lesson.title || `Lesson ${index + 1}`}</span>
                          </div>
                        ))}
                        {course.lessons.length > 3 && (
                          <div className="text-xs text-gray-500 pl-5">
                            +{course.lessons.length - 3} more lessons
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2 pt-2">
                      <Button 
                        className={`w-full bg-gradient-to-r ${levelGradient} hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group`}
                        onClick={() => handleStartCourse(course.id)}
                      >
                        <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                        Start Learning
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full border-gray-200 hover:bg-gray-50 transition-colors"
                        onClick={() => handleViewCurriculum(course.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Curriculum
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          // Fallback courses when no admin courses exist
          <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {fallbackCourses.map((course) => (
              <Card key={course.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white">
                <div className={`h-32 bg-gradient-to-br ${course.color} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <Badge className="bg-white/90 text-gray-900 border-0 shadow-lg font-semibold">
                      {course.level}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/90 text-gray-900 font-semibold">
                      {formatPrice(course.price, course.currency)}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="flex items-center gap-3 text-sm font-medium">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.enrolledStudents}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current" />
                        4.8
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {course.description}
                    </CardDescription>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-100">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-500 text-sm">
                        <Clock className="w-4 h-4" />
                        Duration
                      </div>
                      <div className="font-semibold text-gray-900">{course.duration}</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-500 text-sm">
                        <BookOpen className="w-4 h-4" />
                        Lessons
                      </div>
                      <div className="font-semibold text-gray-900">{course.lessons}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">What you'll learn:</div>
                    <div className="space-y-1">
                      {course.topics.slice(0, 3).map((topic: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                          <span>{topic}</span>
                        </div>
                      ))}
                      {course.topics.length > 3 && (
                        <div className="text-xs text-gray-500 pl-5">
                          +{course.topics.length - 3} more topics
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <Button 
                      className={`w-full bg-gradient-to-r ${course.color} hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group`}
                      onClick={() => handleStartCourse(course.id)}
                    >
                      <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                      Start Learning
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-gray-200 hover:bg-gray-50 transition-colors"
                      onClick={() => handleViewCurriculum(course.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Curriculum
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state message */}
        {courses.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6">
              <TrendingUp className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Amazing Courses Coming Soon!
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Our team is working hard to bring you the best Japanese learning experience. 
              Check back soon for exciting new courses!
            </p>
            <p className="text-sm text-gray-500">
              In the meantime, explore our demo courses above to see what's coming.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}