"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { 
  Grid3X3, 
  List, 
  Clock, 
  Users, 
  Calendar,
  Star,
  BookOpen,
  DollarSign
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Navbar5 } from '@/components/navbar-5';

interface Course {
  _id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
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
  formattedDuration: string;
  difficultyLabel: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses?limit=50');
        const data = await res.json();
        if (data.success) {
          setCourses(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEnrollClick = (courseId: string) => {
    if (isSignedIn) {
      router.push(`/payment/${courseId}`);
    } else {
      // Store the course ID in localStorage to redirect after login
      localStorage.setItem('pendingCourseEnrollment', courseId);
      router.push('/sign-in');
    }
  };

  const handleViewCurriculum = (courseId: string) => {
    router.push(`/courses/${courseId}/curriculum`);
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

  const CourseCard = ({ course }: { course: Course }) => {
    const daysLeft = getDaysLeft(course.enrollmentDeadline);
    
    return (
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
        {course.thumbnailUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <img 
              src={course.thumbnailUrl} 
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <CardHeader className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <Badge className={`${getLevelColor(course.level)} text-xs`}>
              {course.level}
            </Badge>
            {course.isPremium && (
              <Badge variant="outline" className="text-xs">
                Premium
              </Badge>
            )}
          </div>
          
          <h3 className="text-lg font-semibold line-clamp-2 mb-2">
            {course.title}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {course.description}
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center text-xs text-muted-foreground">
              <Users className="w-3 h-3 mr-1" />
              <span>{course.enrolledStudents} students</span>
            </div>
            
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="w-3 h-3 mr-1" />
              <span>{course.formattedDuration}</span>
            </div>
            
            <div className="flex items-center text-xs text-muted-foreground">
              <BookOpen className="w-3 h-3 mr-1" />
              <span>{course.totalLessons} lessons</span>
            </div>
            
            {course.averageRating > 0 && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                <span>{course.averageRating.toFixed(1)} ({course.totalRatings} reviews)</span>
              </div>
            )}
            
            {daysLeft !== null && (
              <div className="flex items-center text-xs text-orange-600">
                <Calendar className="w-3 h-3 mr-1" />
                <span>{daysLeft} days left to enroll</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardFooter className="pt-0 flex flex-col gap-3">
          {(course.actualPrice || course.discountedPrice) && (
            <div className="flex items-center gap-2 w-full">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              {course.discountedPrice && course.actualPrice ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-green-600">
                    ${course.discountedPrice}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    ${course.actualPrice}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold">
                  ${course.actualPrice || course.discountedPrice}
                </span>
              )}
            </div>
          )}
          
          <div className="flex gap-2 w-full">
            <Button 
              onClick={() => handleEnrollClick(course._id)}
              className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 hover:opacity-90"
            >
              Enroll Now
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleViewCurriculum(course._id)}
              className="flex-1"
            >
              View Curriculum
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  };

  const CourseListItem = ({ course }: { course: Course }) => {
    const daysLeft = getDaysLeft(course.enrollmentDeadline);
    
    return (
      <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
        <div className="flex gap-6">
          {course.thumbnailUrl && (
            <div className="w-48 aspect-video overflow-hidden rounded-lg flex-shrink-0">
              <img 
                src={course.thumbnailUrl} 
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <div className="flex gap-2">
                <Badge className={`${getLevelColor(course.level)} text-xs`}>
                  {course.level}
                </Badge>
                {course.isPremium && (
                  <Badge variant="outline" className="text-xs">
                    Premium
                  </Badge>
                )}
              </div>
              
              {(course.actualPrice || course.discountedPrice) && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  {course.discountedPrice && course.actualPrice ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-green-600">
                        ${course.discountedPrice}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        ${course.actualPrice}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xl font-bold">
                      ${course.actualPrice || course.discountedPrice}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
            <p className="text-muted-foreground mb-4 line-clamp-2">{course.description}</p>
            
            <div className="flex items-center gap-6 mb-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>{course.enrolledStudents} students</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{course.formattedDuration}</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                <span>{course.totalLessons} lessons</span>
              </div>
              {course.averageRating > 0 && (
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                  <span>{course.averageRating.toFixed(1)} ({course.totalRatings})</span>
                </div>
              )}
              {daysLeft !== null && (
                <div className="flex items-center text-orange-600">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{daysLeft} days left</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-auto">
              <Button 
                onClick={() => handleEnrollClick(course._id)}
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:opacity-90"
              >
                Enroll Now
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleViewCurriculum(course._id)}
              >
                View Curriculum
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const LoadingSkeleton = () => (
    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="p-6">
          <Skeleton className="h-48 w-full mb-4" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar5 />
      
      {/* Top spacing for floating navbar */}
      <div className="h-24" />
      
      {/* Page Header */}
      <div className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Courses</h1>
              <p className="mt-2 text-lg text-gray-600">
                Discover the perfect course to advance your Japanese learning journey
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">View:</span>
              <ToggleGroup 
                type="single" 
                value={viewMode} 
                onValueChange={(value) => value && setViewMode(value as 'grid' | 'list')}
                className="border rounded-lg p-1"
              >
                <ToggleGroupItem value="grid" aria-label="Grid view">
                  <Grid3X3 className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="List view">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>
      </div>
      
      {/* Courses Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <LoadingSkeleton />
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Check back later for new courses!</p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-6'
          }>
            {courses.map((course) => (
              viewMode === 'grid' ? (
                <CourseCard key={course._id} course={course} />
              ) : (
                <CourseListItem key={course._id} course={course} />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}