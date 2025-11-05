'use client';

import { notFound } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { IconArrowLeft, IconPlus, IconTrash, IconSettings } from "@tabler/icons-react";
import { toast } from "sonner";
import { useLanguage } from '@/contexts/LanguageContext';

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useLanguage();
  const [courseId, setCourseId] = useState<string>('');
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'beginner',
    category: 'vocabulary',
    estimatedDuration: 60,
    difficulty: 5,
    learningObjectives: [''],
    links: [''],
    thumbnailUrl: '',
    instructorNotes: '',
    whatYoullLearn: '',
    courseLessonModule: '',
    actualPrice: '',
    discountedPrice: '',
    enrollmentLastDate: '',
    isPremium: false,
    isPublished: false,
    weeklyContent: [],
    classLinks: [],
    blogPosts: [],
    enrolledStudentsInfo: []
  });
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);

  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params;
      setCourseId(resolvedParams.id);
    }
    getParams();
  }, [params]);

  useEffect(() => {
    if (!courseId) return;

    async function loadCourse() {
      try {
        const res = await fetch(`/api/admin/courses/${courseId}`);
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        const courseData = data.course;

        console.log('📚 Loaded course data:', courseData);
        console.log('📝 Course fields:', {
          title: courseData.title,
          description: courseData.description,
          learningObjectives: courseData.learningObjectives,
          links: courseData.links,
          weeklyContent: courseData.weeklyContent,
          classLinks: courseData.classLinks,
          blogPosts: courseData.blogPosts
        });

        setCourse(courseData);
        setFormData({
          title: courseData.title || '',
          description: courseData.description || '',
          level: courseData.level || 'beginner',
          category: courseData.category || 'vocabulary',
          estimatedDuration: courseData.estimatedDuration || 60,
          difficulty: courseData.difficulty || 5,
          learningObjectives: courseData.learningObjectives?.length > 0 ? courseData.learningObjectives : [''],
          links: courseData.links?.length > 0 ? courseData.links : [''],
          thumbnailUrl: courseData.thumbnailUrl || '',
          instructorNotes: courseData.instructorNotes || '',
          whatYoullLearn: courseData.whatYoullLearn || '',
          courseLessonModule: courseData.courseLessonModule || '',
          actualPrice: courseData.actualPrice || '',
          discountedPrice: courseData.discountedPrice || '',
          enrollmentLastDate: courseData.enrollmentLastDate || '',
          isPremium: courseData.isPremium || false,
          isPublished: courseData.isPublished || false,
          weeklyContent: courseData.weeklyContent || [],
          classLinks: courseData.classLinks || [],
          blogPosts: courseData.blogPosts || [],
          enrolledStudentsInfo: courseData.enrolledStudentsInfo || []
        });
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [courseId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addObjective = () => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: [...prev.learningObjectives, '']
    }));
  };

  const removeObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.filter((_, i) => i !== index)
    }));
  };

  const updateObjective = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  // Helper functions for other array fields
  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev as any)[field], '']
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev as any)[field].filter((_: any, i: number) => i !== index)
    }));
  };

  const updateArrayItem = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev as any)[field].map((item: string, i: number) => i === index ? value : item)
    }));
  };

  const handleSubmit = async (isPublished: boolean) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isPublished,
          learningObjectives: formData.learningObjectives.filter(obj => obj.trim() !== ''),
          links: formData.links.filter(link => link.trim() !== '')
        })
      });

      if (response.ok) {
        toast.success('Course updated successfully!');
      } else {
        toast.error('Failed to update course');
      }
    } catch (error) {
      toast.error('Error updating course');
    }
  };

  // Helper functions for Links
  const addLink = () => {
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, '']
    }));
  };

  const removeLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  const updateLink = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.map((link, i) => i === index ? value : link)
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">{t('common.loading')}</div>;
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
                  <h1 className="text-2xl font-bold">{t('admin.updateCourse')}</h1>
                  <p className="text-muted-foreground">{t('admin.updateJapaneseLanguageCourse')}</p>
                </div>
              </div>
            </div>

            {/* Course Form */}
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.courseInformation')}</CardTitle>
                <CardDescription>{t('admin.basicDetails')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div>
                  <Label htmlFor="title">{t('admin.courseTitle')} *</Label>
                  <Input
                    id="title"
                    placeholder={t('admin.courseTitlePlaceholder')}
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">{t('admin.description')} *</Label>
                  <Textarea
                    id="description"
                    placeholder={t('admin.descriptionPlaceholder')}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>

                {/* What You'll Learn */}
                <div>
                  <Label htmlFor="whatYoullLearn">{t('admin.whatYoullLearn')}</Label>
                  <Textarea
                    id="whatYoullLearn"
                    placeholder={t('admin.whatYoullLearnPlaceholder')}
                    value={formData.whatYoullLearn}
                    onChange={(e) => handleInputChange('whatYoullLearn', e.target.value)}
                  />
                </div>

                {/* Course Lesson / Module / Curriculum */}
                <div>
                  <Label htmlFor="courseLessonModule">{t('admin.courseLessonModule')}</Label>
                  <Textarea
                    id="courseLessonModule"
                    placeholder={t('admin.courseLessonModulePlaceholder')}
                    value={formData.courseLessonModule}
                    onChange={(e) => handleInputChange('courseLessonModule', e.target.value)}
                  />
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="actualPrice">{t('admin.actualPrice')}</Label>
                    <Input
                      id="actualPrice"
                      placeholder="৳৯৯.৯৯"
                      value={formData.actualPrice}
                      onChange={(e) => handleInputChange('actualPrice', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="discountedPrice">{t('admin.discountedPrice')}</Label>
                    <Input
                      id="discountedPrice"
                      placeholder="৳৪৯.৯৯"
                      value={formData.discountedPrice}
                      onChange={(e) => handleInputChange('discountedPrice', e.target.value)}
                    />
                  </div>
                </div>

                {/* Enrollment Last Date */}
                <div>
                  <Label htmlFor="enrollmentLastDate">{t('admin.enrollmentLastDate')}</Label>
                  <Input
                    id="enrollmentLastDate"
                    placeholder="December 31, 2025"
                    value={formData.enrollmentLastDate}
                    onChange={(e) => handleInputChange('enrollmentLastDate', e.target.value)}
                  />
                </div>

                {/* Level and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>{t('admin.jlptLevel')} *</Label>
                    <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">{t('admin.beginner')}</SelectItem>
                        <SelectItem value="intermediate">{t('admin.intermediate')}</SelectItem>
                        <SelectItem value="advanced">{t('admin.advanced')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('admin.category')} *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vocabulary">{t('admin.vocabulary')}</SelectItem>
                        <SelectItem value="grammar">{t('admin.grammar')}</SelectItem>
                        <SelectItem value="kanji">{t('admin.kanji')}</SelectItem>
                        <SelectItem value="conversation">{t('admin.conversation')}</SelectItem>
                        <SelectItem value="reading">{t('admin.reading')}</SelectItem>
                        <SelectItem value="writing">{t('admin.writing')}</SelectItem>
                        <SelectItem value="culture">{t('admin.culture')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Duration and Difficulty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">{t('admin.estimatedDuration')} *</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.estimatedDuration}
                      onChange={(e) => handleInputChange('estimatedDuration', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="difficulty">{t('admin.difficulty')} (1-10)</Label>
                    <Input
                      id="difficulty"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.difficulty}
                      onChange={(e) => handleInputChange('difficulty', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                {/* Learning Objectives */}
                <div>
                  <Label>{t('admin.learningObjectives')} *</Label>
                  <p className="text-sm text-muted-foreground mb-2">{t('admin.learningObjectivesDesc')}</p>
                  <div className="space-y-2">
                    {formData.learningObjectives.map((objective, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`${t('admin.learningObjectivePlaceholder')} ${index + 1}`}
                          value={objective}
                          onChange={(e) => updateObjective(index, e.target.value)}
                        />
                        {formData.learningObjectives.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeObjective(index)}
                          >
                            <IconTrash className="size-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addObjective}
                    >
                      <IconPlus className="size-4 mr-2" />
                      {t('admin.addObjective')}
                    </Button>
                  </div>
                </div>

                {/* Links */}
                <div>
                  <Label>{t('admin.links')}</Label>
                  <p className="text-sm text-muted-foreground mb-2">{t('admin.linksDesc')}</p>
                  <div className="space-y-2">
                    {formData.links.map((link, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Link ${index + 1}`}
                          value={link}
                          onChange={(e) => updateLink(index, e.target.value)}
                        />
                        {formData.links.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeLink(index)}
                          >
                            <IconTrash className="size-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addLink}
                    >
                      <IconPlus className="size-4 mr-2" />
                      {t('admin.addLink')}
                    </Button>
                  </div>
                </div>

                {/* Thumbnail URL */}
                <div>
                  <Label htmlFor="thumbnail">{t('admin.thumbnailUrl')}</Label>
                  <Input
                    id="thumbnail"
                    placeholder="https://example.com/image.jpg"
                    value={formData.thumbnailUrl}
                    onChange={(e) => handleInputChange('thumbnailUrl', e.target.value)}
                  />
                </div>

                {/* Instructor Notes */}
                <div>
                  <Label htmlFor="notes">{t('admin.instructorNotes')}</Label>
                  <Textarea
                    id="notes"
                    placeholder={t('admin.instructorNotesPlaceholder')}
                    value={formData.instructorNotes}
                    onChange={(e) => handleInputChange('instructorNotes', e.target.value)}
                  />
                </div>

                {/* Premium Course */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="premium"
                    checked={formData.isPremium}
                    onCheckedChange={(checked) => handleInputChange('isPremium', checked)}
                  />
                  <Label htmlFor="premium">{t('admin.premiumCourse')}</Label>
                </div>

                {/* Advanced Course Management Button */}
                <div className="border-t pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowAdvancedModal(true)}
                  >
                    <IconSettings className="size-4 mr-2" />
                    Advanced Course Management
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Manage weekly content, class links, blog posts, and enrolled students
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleSubmit(false)}
                    className="flex-1"
                  >
                    {t('admin.saveAsDraft')}
                  </Button>
                  <Button
                    onClick={() => handleSubmit(true)}
                    className="flex-1"
                  >
                    {t('admin.saveAndPublish')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Advanced Course Management Modal */}
        {showAdvancedModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center p-6 border-b">
                <div>
                  <h2 className="text-2xl font-bold">Advanced Course Management</h2>
                  <p className="text-gray-600">Edit weekly content, class links, and blog posts</p>
                </div>
                <Button variant="outline" onClick={() => setShowAdvancedModal(false)}>
                  ✕
                </Button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                {/* Summary Card */}
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Weekly Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formData.weeklyContent?.length || 0}</div>
                      <p className="text-xs text-muted-foreground">Weeks configured</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Class Links</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formData.classLinks?.length || 0}</div>
                      <p className="text-xs text-muted-foreground">Live classes</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formData.blogPosts?.length || 0}</div>
                      <p className="text-xs text-muted-foreground">Articles published</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formData.enrolledStudentsInfo?.length || 0}</div>
                      <p className="text-xs text-muted-foreground">Enrolled</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Info Message */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <span className="text-yellow-600 mr-2">ℹ️</span>
                    <div>
                      <h4 className="font-medium text-yellow-900">Advanced Features View</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        You can view your advanced course features here. This course has:
                      </p>
                      <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
                        <li>{formData.weeklyContent?.length || 0} weeks of content with videos and documents</li>
                        <li>{formData.classLinks?.length || 0} scheduled live classes</li>
                        <li>{formData.blogPosts?.length || 0} related blog posts</li>
                        <li>{formData.enrolledStudentsInfo?.length || 0} enrolled students</li>
                      </ul>
                      <p className="text-sm text-yellow-700 mt-2">
                        These advanced features are currently view-only in edit mode. To modify them, please create a new course version or contact support.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Display Weekly Content */}
                {formData.weeklyContent && formData.weeklyContent.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Weekly Content Overview</h3>
                    <div className="space-y-3">
                      {formData.weeklyContent.map((week: any, index: number) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="text-base">Week {week.week}</CardTitle>
                            <CardDescription>{week.comments || 'No description'}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Videos:</span> {week.videoLinks?.length || 0}
                              </div>
                              <div>
                                <span className="font-medium">Documents:</span> {week.documents?.length || 0}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Display Class Links */}
                {formData.classLinks && formData.classLinks.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Class Links Overview</h3>
                    <div className="space-y-3">
                      {formData.classLinks.map((classLink: any, index: number) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="text-base">{classLink.title}</CardTitle>
                            <CardDescription>{classLink.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm space-y-1">
                              <div><span className="font-medium">Schedule:</span> {classLink.schedule}</div>
                              <div><span className="font-medium">Meeting URL:</span> {classLink.meetingUrl}</div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Display Blog Posts */}
                {formData.blogPosts && formData.blogPosts.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Blog Posts Overview</h3>
                    <div className="space-y-3">
                      {formData.blogPosts.map((blog: any, index: number) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="text-base">{blog.title}</CardTitle>
                            <CardDescription>By {blog.author}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600">{blog.excerpt}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {blog.tags?.map((tag: string, tagIndex: number) => (
                                <span key={tagIndex} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t flex justify-end">
                <Button onClick={() => setShowAdvancedModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

      </SidebarInset>
    </SidebarProvider>
  );
}
