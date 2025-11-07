'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
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
  MoreVertical,
  Award,
  Download
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
  completedAt?: string;
  certificateId?: string;
  nextClass?: {
    date: string;
    meetingLink: string;
    title: string;
  };
}

export default function EnrolledCourses() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingCert, setDownloadingCert] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const res = await fetch('/api/users/me/courses');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCourses(json.data);
        } else {
          setCourses([]);
        }
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrolledCourses();
  }, []);

  const handleDownloadCertificate = async (courseId: string) => {
    try {
      setDownloadingCert(courseId);
      const response = await fetch(`/api/certificates/${courseId}`);
      
      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to download certificate');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${courseId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate');
    } finally {
      setDownloadingCert(null);
    }
  };

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
          <CardTitle>{t('courses.myEnrolledCourses')}</CardTitle>
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
          <CardTitle>{t('courses.myEnrolledCourses')}</CardTitle>
          <CardDescription>
            {t('courses.continueLearning')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {t('courses.noCourses')}
            </p>
            <Button asChild>
              <a href="/">{t('courses.browseCourses')}</a>
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
                    <span>{course.enrolledStudents.toLocaleString()} {t('courses.students')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.totalLessons} {t('courses.lessons')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(course.estimatedDuration)}</span>
                  </div>
                  {course.progress && (
                    <div className="flex items-center space-x-2">
                      <Play className="h-4 w-4" />
                      <span>{course.progress.completedLessons} {t('courses.completed')}</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {course.progress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t('courses.progress')}</span>
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
                          <span className="text-sm font-medium">{t('courses.nextClass')}</span>
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
                          {t('courses.joinClass')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Button className="w-full" variant="default">
                    {t('courses.continueStudying')}
                  </Button>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href={`/dashboard/courses/${course._id}/curriculum`}>
                      {t('courses.viewCurriculum')}
                    </Link>
                  </Button>
                  {course.progress && course.progress.progressPercentage === 100 && (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700" 
                      onClick={() => handleDownloadCertificate(course._id)}
                      disabled={downloadingCert === course._id}
                    >
                      {downloadingCert === course._id ? (
                        <>
                          <Download className="h-4 w-4 mr-2 animate-pulse" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Award className="h-4 w-4 mr-2" />
                          Download Certificate
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}