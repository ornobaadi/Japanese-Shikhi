"use client";
import React from "react";
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
  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        const contentType = res.headers.get('content-type');
        if (!res.ok || !contentType?.includes('application/json')) {
          throw new Error('API did not return JSON');
        }
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCourses(json.data);
        } else {
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
                        {course.estimatedDuration ? `${Math.floor(course.estimatedDuration/60)}h ${course.estimatedDuration%60}m` : ''}
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
                    <Button className={`bg-gradient-to-r from-green-500 to-teal-500 hover:opacity-90`}>
                      Start Course
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      View Curriculum
                    </Button>
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