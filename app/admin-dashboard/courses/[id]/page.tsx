'use client';

import { notFound } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useLanguage } from '@/contexts/LanguageContext';
import {
  IconEdit,
  IconArrowLeft,
  IconClock,
  IconUsers,
  IconStar,
  IconEye,
  IconCalendar,
  IconTag,
  IconBook,
  IconAward,
  IconTarget
} from "@tabler/icons-react"; export default function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useLanguage();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState<string>('');

  useEffect(() => {
    const fetchParams = async () => {
      const resolvedParams = await params;
      setCourseId(resolvedParams.id);

      try {
        const response = await fetch(`/api/admin/courses/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error('Course not found');
        }
        const data = await response.json();
        setCourse(data.course);
      } catch (error) {
        console.error('Error fetching course:', error);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    fetchParams();
  }, [params]);

  const translateLevel = (level: string) => {
    switch (level) {
      case 'beginner': return t('courses.beginner');
      case 'intermediate': return t('courses.intermediate');
      case 'advanced': return t('courses.advanced');
      default: return level;
    }
  };

  const translateCategory = (category: string) => {
    switch (category) {
      case 'vocabulary': return t('admin.vocabulary');
      case 'grammar': return t('admin.grammar');
      case 'kanji': return t('admin.kanji');
      case 'conversation': return t('admin.conversation');
      case 'culture': return t('admin.culture');
      case 'reading': return t('admin.reading');
      case 'writing': return t('admin.writing');
      default: return category;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!course) {
    return notFound();
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin-dashboard/courses">
                    <IconArrowLeft className="size-4 mr-2" />
                    {t('admin.backToCourses')}
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">{course.title}</h1>
                  <p className="text-muted-foreground">{t('admin.courseDetails')}</p>
                </div>
              </div>
              <Button asChild>
                <Link href={`/admin-dashboard/courses/edit/${courseId}`}>
                  <IconEdit className="size-4 mr-2" />
                  {t('admin.editCourse')}
                </Link>
              </Button>
            </div>

            {/* Course Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Course Overview */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <IconBook className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{t('admin.courseOverview')}</CardTitle>
                        <CardDescription>{t('admin.essentialInfo')}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">{t('admin.description')}</label>
                      <div className="p-3 rounded-md border bg-muted/20">
                        <p className="text-sm leading-relaxed">{course.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Course Details */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <IconTag className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{t('admin.courseDetailsSection')}</CardTitle>
                        <CardDescription>{t('admin.technicalSpecs')}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-2">
                            <IconAward className="size-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{t('admin.level')}</span>
                          </div>
                          <Badge variant="secondary" className="capitalize">{translateLevel(course.level)}</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-2">
                            <IconBook className="size-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{t('admin.category')}</span>
                          </div>
                          <Badge variant="outline" className="capitalize">{translateCategory(course.category)}</Badge>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-2">
                            <IconStar className="size-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{t('admin.difficulty')}</span>
                          </div>
                          <Badge variant="outline">{course.difficulty}/10</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-2">
                            <IconClock className="size-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{t('form.duration')}</span>
                          </div>
                          <Badge variant="outline">{course.estimatedDuration} {t('admin.minutes')}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Learning Objectives */}
                {course.learningObjectives && course.learningObjectives.length > 0 && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <IconUsers className="size-5" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{t('admin.learningObjectivesSection')}</CardTitle>
                          <CardDescription>{t('admin.whatStudentsAchieve')}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {course.learningObjectives.map((objective: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                            <div className="mt-0.5">
                              <div className="size-2 rounded-full bg-primary" />
                            </div>
                            <span className="text-sm leading-relaxed">{objective}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Prerequisites */}
                {course.prerequisites && course.prerequisites.length > 0 && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <IconAward className="size-5" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{t('admin.prerequisites')}</CardTitle>
                          <CardDescription>{t('admin.prerequisitesDesc')}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {course.prerequisites.map((prerequisite: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                            <div className="mt-0.5">
                              <div className="size-2 rounded-full bg-orange-500" />
                            </div>
                            <span className="text-sm leading-relaxed">{prerequisite}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Course Goals */}
                {course.courseGoals && course.courseGoals.length > 0 && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <IconTarget className="size-5" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Course Goals</CardTitle>
                          <CardDescription>Main achievements students will reach</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {course.courseGoals.map((goal: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                            <div className="mt-0.5">
                              <div className="size-2 rounded-full bg-green-500" />
                            </div>
                            <span className="text-sm leading-relaxed">{goal}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Target Audience */}
                {course.targetAudience && course.targetAudience.length > 0 && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <IconUsers className="size-5" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Target Audience</CardTitle>
                          <CardDescription>Who this course is designed for</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {course.targetAudience.map((audience: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                            <div className="mt-0.5">
                              <div className="size-2 rounded-full bg-blue-500" />
                            </div>
                            <span className="text-sm leading-relaxed">{audience}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Requirements */}
                {course.requirements && course.requirements.length > 0 && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <IconBook className="size-5" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Requirements</CardTitle>
                          <CardDescription>What students need to complete this course</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {course.requirements.map((requirement: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                            <div className="mt-0.5">
                              <div className="size-2 rounded-full bg-purple-500" />
                            </div>
                            <span className="text-sm leading-relaxed">{requirement}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Tags */}
                {course.tags && course.tags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <IconTag className="size-4" />
                        {t('admin.courseTags')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {course.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                {/* Status & Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <IconEye className="size-4" />
                      {t('admin.statusSettings')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-sm font-medium">{t('admin.publication')}</span>
                      <Badge variant={course.isPublished ? "default" : "secondary"}>
                        {course.isPublished ? t('admin.published') : t('admin.draft')}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-sm font-medium">{t('admin.access')}</span>
                      <Badge variant={course.isPremium ? "default" : "outline"}>
                        {course.isPremium ? t('admin.premium') : t('admin.free')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Course Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <IconCalendar className="size-4" />
                      {t('admin.timeline')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                        <IconCalendar className="size-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{t('admin.created')}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(course.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t('admin.quickActions')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <IconEye className="size-4 mr-2" />
                      {t('admin.previewCourse')}
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <IconUsers className="size-4 mr-2" />
                      {t('admin.viewStudents')}
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <IconTag className="size-4 mr-2" />
                      {t('admin.duplicateCourse')}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}