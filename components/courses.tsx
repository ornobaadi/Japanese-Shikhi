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
  const [pendingCourseIds, setPendingCourseIds] = React.useState<string[]>([]);
  const { isSignedIn, user } = useUser();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const router = useRouter();
  
  const fetchCourses = React.useCallback(async () => {
    setLoading(true);
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
  }, []);

  const fetchEnrollmentStatus = React.useCallback(async () => {
    if (!isSignedIn) return;

    // Check if user is admin
    const adminCheck = user?.publicMetadata?.role === 'admin';
    setIsAdmin(!!adminCheck);

    try {
      // Check enrolled courses
      const coursesRes = await fetch('/api/users/me/courses');
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        const enrolled = coursesData.data?.map((c: any) => c._id) || [];
        setEnrolledCourseIds(enrolled);
      }

      // Check pending enrollments
      const enrollRes = await fetch('/api/enrollments');
      if (enrollRes.ok) {
        const enrollData = await enrollRes.json();
        const pending = enrollData.data
          ?.filter((req: any) => req.status === 'pending')
          .map((req: any) => req.courseId?._id || req.courseId) || [];
        setPendingCourseIds(pending);
      }
    } catch (error) {
      console.error('Failed to fetch enrollment status:', error);
    }
  }, [isSignedIn, user]);

  React.useEffect(() => {
    fetchCourses();
    fetchEnrollmentStatus();
    
    // Listen for course creation events to auto-refresh
    const handleCourseCreated = () => {
      console.log('Course created event received, refreshing courses...');
      fetchCourses();
    };
    
    window.addEventListener('courseCreated', handleCourseCreated);
    
    return () => {
      window.removeEventListener('courseCreated', handleCourseCreated);
    };
  }, [fetchCourses, fetchEnrollmentStatus]);

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
                  <div className="space-y-4">
                    <Badge variant="outline">{course.level}</Badge>
                    <h3 className="text-2xl font-bold">{course.title}</h3>
                    <div className="space-y-2 text-sm text-gray-600">
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
                    {isAdmin ? (
                      <>
                        <Badge className="text-center py-2 bg-purple-100 text-purple-800">
                          👑 Admin
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => router.push(`/courses/${course._id}/curriculum`)}
                        >
                          View Curriculum
                        </Button>
                      </>
                    ) : enrolledCourseIds.includes(course._id || '') ? (
                      <>
                        <Badge className="text-center py-2 bg-green-100 text-green-800">
                          ✓ Enrolled
                        </Badge>
                        <Button 
                          className={`bg-gradient-to-r from-green-500 to-teal-500 hover:opacity-90`}
                          onClick={() => router.push(`/dashboard/courses/${course._id}/curriculum`)}
                        >
                          Continue Learning
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </>
                    ) : pendingCourseIds.includes(course._id || '') ? (
                      <>
                        <Badge className="text-center py-2 bg-yellow-100 text-yellow-800">
                          ⏳ Pending Approval
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => router.push(`/courses/${course._id}`)}
                        >
                          View Details
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          className={`bg-gradient-to-r from-green-500 to-teal-500 hover:opacity-90`}
                          onClick={() => router.push(`/courses/${course._id}`)}
                        >
                          Start Course
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => router.push(`/courses/${course._id}/curriculum`)}
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