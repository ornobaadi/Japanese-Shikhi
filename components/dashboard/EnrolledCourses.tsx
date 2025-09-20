'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Users, 
  Clock, 
  Calendar,
  ExternalLink,
  Play,
  MoreVertical
} from "lucide-react";

interface Course {
  _id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  estimatedDuration: number;
  enrolledStudents: number;
  totalLessons: number;
  thumbnailUrl?: string;
  progress?: {
    completedLessons: number;
    progressPercentage: number;
  };
  nextClass?: {
    date: string;
    meetingLink: string;
    title: string;
  };
}

export default function EnrolledCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        // This would fetch from your API
        // For now, using mock data
        const mockCourses: Course[] = [
          {
            _id: '1',
            title: 'Japanese for Beginners - Hiragana & Katakana',
            description: 'Master the fundamental writing systems of Japanese language',
            level: 'beginner',
            category: 'writing',
            estimatedDuration: 180,
            enrolledStudents: 1250,
            totalLessons: 24,
            progress: {
              completedLessons: 8,
              progressPercentage: 33
            },
            nextClass: {
              date: '2025-09-22T10:00:00Z',
              meetingLink: 'https://meet.google.com/abc-defg-hij',
              title: 'Katakana Practice Session'
            }
          },
          {
            _id: '2',
            title: 'Essential Japanese Vocabulary',
            description: 'Learn 1000+ most commonly used Japanese words',
            level: 'beginner',
            category: 'vocabulary',
            estimatedDuration: 240,
            enrolledStudents: 890,
            totalLessons: 30,
            progress: {
              completedLessons: 15,
              progressPercentage: 50
            }
          },
          {
            _id: '3',
            title: 'Japanese Grammar Fundamentals',
            description: 'Understand basic Japanese sentence structure and grammar rules',
            level: 'intermediate',
            category: 'grammar',
            estimatedDuration: 300,
            enrolledStudents: 567,
            totalLessons: 36,
            progress: {
              completedLessons: 3,
              progressPercentage: 8
            },
            nextClass: {
              date: '2025-09-25T14:00:00Z',
              meetingLink: 'https://zoom.us/j/123456789',
              title: 'Particle Usage Workshop'
            }
          }
        ];
        
        setCourses(mockCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatNextClass = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Enrolled Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (courses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Enrolled Courses</CardTitle>
          <CardDescription>
            Continue learning with your enrolled courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No courses found. Start your learning journey by enrolling in a course!
            </p>
            <Button asChild>
              <a href="/">Browse Courses</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {courses.map((course) => (
        <Card key={course._id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Course Info */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {course.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge className={getLevelColor(course.level)}>
                    {course.level}
                  </Badge>
                  <Badge variant="outline">
                    {course.category}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{course.enrolledStudents.toLocaleString()} students</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(course.estimatedDuration)}</span>
                  </div>
                  {course.progress && (
                    <div className="flex items-center space-x-2">
                      <Play className="h-4 w-4" />
                      <span>{course.progress.completedLessons} completed</span>
                    </div>
                  )}
                </div>
                
                {/* Progress Bar */}
                {course.progress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{course.progress.progressPercentage}%</span>
                    </div>
                    <Progress value={course.progress.progressPercentage} className="h-2" />
                  </div>
                )}
              </div>
              
              {/* Actions & Next Class */}
              <div className="space-y-4">
                {course.nextClass && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-blue-800">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm font-medium">Next Class</span>
                        </div>
                        <p className="text-sm text-blue-700 font-medium">
                          {course.nextClass.title}
                        </p>
                        <p className="text-xs text-blue-600">
                          {formatNextClass(course.nextClass.date)}
                        </p>
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => window.open(course.nextClass!.meetingLink, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Join Class
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <div className="space-y-2">
                  <Button className="w-full" variant="default">
                    Continue Learning
                  </Button>
                  <Button className="w-full" variant="outline">
                    View Curriculum
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}