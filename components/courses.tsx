"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface Course {
  _id?: string;
  title: string;
  description?: string;
  level: string;
  estimatedDuration?: number;
  lessons?: Array<any>;
  learningObjectives?: string[];
  averageRating?: number;
  totalRatings?: number;
  thumbnailUrl?: string;
}

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  BookOpen,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default function Courses() {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [enrolledCourseIds, setEnrolledCourseIds] = React.useState<string[]>([]);
  const [courseRatings, setCourseRatings] = React.useState<Record<string, { avg: number; count: number }>>({});
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');

        // Check if response is ok
        if (!res.ok) {
          console.error('API response not ok:', res.status, res.statusText);
          // Try to get error message from response
          const errorText = await res.text();
          console.error('Error response body:', errorText);
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }

        // Check content type
        const contentType = res.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          const responseText = await res.text();
          console.error('Non-JSON response:', responseText);
          throw new Error(`API did not return JSON. Content-Type: ${contentType}`);
        }

        const json = await res.json();
        console.log('API response:', json);

        if (json.success && Array.isArray(json.data)) {
          setCourses(json.data);
        } else {
          console.warn('Unexpected API response structure:', json);
          setCourses([]);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Fetch ratings for all courses
  React.useEffect(() => {
    const fetchRatings = async () => {
      if (courses.length === 0) return;

      try {
        const ratings: Record<string, { avg: number; count: number }> = {};
        
        for (const course of courses) {
          if (!course._id) continue;
          
          const res = await fetch(`/api/ratings?courseId=${course._id}`);
          if (res.ok) {
            const data = await res.json();
            const courseRatings = data.data || [];
            
            if (courseRatings.length > 0) {
              const avgRating = courseRatings.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / courseRatings.length;
              ratings[course._id] = {
                avg: Math.round(avgRating * 10) / 10,
                count: courseRatings.length
              };
            }
          }
        }
        
        setCourseRatings(ratings);
      } catch (error) {
        console.error('Failed to fetch ratings:', error);
      }
    };

    fetchRatings();
  }, [courses]);

  // Fetch user's enrolled courses
  React.useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!isSignedIn || !user) return;

      try {
        const res = await fetch('/api/users/me');
        if (res.ok) {
          const result = await res.json();
          const userData = result.data || result;
          const enrolledIds = userData.enrolledCourses?.map((c: any) => {
            const id = c.courseId?._id || c.courseId?.toString() || c.courseId || c._id;
            return id;
          }) || [];
          setEnrolledCourseIds(enrolledIds);
        }
      } catch (error) {
        console.error('Failed to fetch enrolled courses:', error);
      }
    };

    fetchEnrolledCourses();
  }, [isSignedIn, user]);

  const isEnrolled = (courseId: string) => {
    return enrolledCourseIds.includes(courseId);
  };

  const handleStartCourse = (courseId: string) => {
    router.push(`/courses/${courseId}/curriculum`);
  };

  const handleViewCurriculum = (courseId: string) => {
    // If enrolled, go to dashboard curriculum; otherwise preview
    if (isEnrolled(courseId)) {
      router.push(`/dashboard/courses/${courseId}/curriculum`);
    } else {
      router.push(`/courses/${courseId}/curriculum`);
    }
  };

  const handleContinueLearning = (courseId: string) => {
    router.push(`/dashboard/courses/${courseId}/curriculum`);
  };

  return (
    <section id="courses" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Complete Learning Path
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Master Japanese step by step with our carefully crafted curriculum
          </p>
        </div>

        <div className="space-y-8">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No courses found.</div>
          ) : (
            courses.map((course, index) => (
              <Card key={course._id || index} className="overflow-hidden">
                <div className={`h-2 bg-gradient-to-r from-green-500 to-teal-500`}></div>
                <div className="grid md:grid-cols-4 gap-6 p-8">
                  {course.thumbnailUrl && (
                    <div className="md:col-span-1 flex items-center justify-center">
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-auto rounded-lg object-cover max-h-48"
                      />
                    </div>
                  )}
                  <div className={`space-y-4 ${course.thumbnailUrl ? 'md:col-span-1' : 'md:col-span-1'}`}>
                    <Badge variant="outline">{course.level}</Badge>
                    <h3 className="text-2xl font-bold">{course.title}</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      {courseRatings[course._id || ''] && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-lg ${
                                  i < Math.round(courseRatings[course._id || ''].avg)
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="font-semibold">
                            {courseRatings[course._id || ''].avg.toFixed(1)}
                          </span>
                          <span className="text-gray-500">
                            ({courseRatings[course._id || ''].count} {courseRatings[course._id || ''].count === 1 ? 'review' : 'reviews'})
                          </span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {course.estimatedDuration ? `${Math.floor(course.estimatedDuration / 60)}h ${course.estimatedDuration % 60}m` : ''}
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-2" />
                        {course.lessons ? `${course.lessons.length} lessons` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="font-semibold mb-4">What you'll learn:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {course.learningObjectives?.map((topic, topicIndex) => (
                        <div key={topicIndex} className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-sm">{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col justify-center space-y-3">
                    {isEnrolled(course._id || '') ? (
                      <>
                        <Button 
                          className="bg-gradient-to-r from-green-500 to-teal-500 hover:opacity-90"
                          onClick={() => handleContinueLearning(course._id || '')}
                        >
                          Continue Learning
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewCurriculum(course._id || '')}
                        >
                          View Curriculum
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          className="bg-gradient-to-r from-green-500 to-teal-500 hover:opacity-90"
                          onClick={() => handleStartCourse(course._id || '')}
                        >
                          Start Course
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewCurriculum(course._id || '')}
                        >
                          View Curriculum
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
}