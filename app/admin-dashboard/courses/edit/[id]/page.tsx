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
import { IconArrowLeft, IconPlus, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
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
    thumbnailUrl: '',
    instructorNotes: '',
    isPremium: false,
    isPublished: false
  });

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
        
        setCourse(courseData);
        setFormData({
          title: courseData.title || '',
          description: courseData.description || '',
          level: courseData.level || 'beginner',
          category: courseData.category || 'vocabulary',
          estimatedDuration: courseData.estimatedDuration || 60,
          difficulty: courseData.difficulty || 5,
          learningObjectives: courseData.learningObjectives?.length > 0 ? courseData.learningObjectives : [''],
          thumbnailUrl: courseData.thumbnailUrl || '',
          instructorNotes: courseData.instructorNotes || '',
          isPremium: courseData.isPremium || false,
          isPublished: courseData.isPublished || false
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

  const handleSubmit = async (isPublished: boolean) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isPublished,
          learningObjectives: formData.learningObjectives.filter(obj => obj.trim() !== '')
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

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
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
                    Back to Courses
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Edit Course</h1>
                  <p className="text-muted-foreground">Update your Japanese language course</p>
                </div>
              </div>
            </div>

            {/* Course Form */}
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
                <CardDescription>Basic details about your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Japan101 - Hiragana Basics"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what students will learn in this course..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>

                {/* Level and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>JLPT Level *</Label>
                    <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vocabulary">Vocabulary</SelectItem>
                        <SelectItem value="grammar">Grammar</SelectItem>
                        <SelectItem value="kanji">Kanji</SelectItem>
                        <SelectItem value="conversation">Conversation</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                        <SelectItem value="writing">Writing</SelectItem>
                        <SelectItem value="culture">Culture</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Duration and Difficulty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Estimated Duration (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.estimatedDuration}
                      onChange={(e) => handleInputChange('estimatedDuration', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Difficulty (1-10)</Label>
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
                  <Label>Learning Objectives *</Label>
                  <p className="text-sm text-muted-foreground mb-2">What will students learn from this course?</p>
                  <div className="space-y-2">
                    {formData.learningObjectives.map((objective, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Learning objective ${index + 1}`}
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
                      Add Objective
                    </Button>
                  </div>
                </div>

                {/* Thumbnail URL */}
                <div>
                  <Label htmlFor="thumbnail">Thumbnail URL (optional)</Label>
                  <Input
                    id="thumbnail"
                    placeholder="https://example.com/image.jpg"
                    value={formData.thumbnailUrl}
                    onChange={(e) => handleInputChange('thumbnailUrl', e.target.value)}
                  />
                </div>

                {/* Instructor Notes */}
                <div>
                  <Label htmlFor="notes">Instructor Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes for instructors..."
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
                  <Label htmlFor="premium">Premium Course</Label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleSubmit(false)}
                    className="flex-1"
                  >
                    Save as Draft
                  </Button>
                  <Button
                    onClick={() => handleSubmit(true)}
                    className="flex-1"
                  >
                    Save & Publish
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
