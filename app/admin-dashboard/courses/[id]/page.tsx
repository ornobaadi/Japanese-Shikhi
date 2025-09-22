import { notFound } from 'next/navigation';
import React from 'react';
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IconEdit, IconArrowLeft } from "@tabler/icons-react";

async function getCourse(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/admin/courses/${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.course || null;
}

export default async function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const course = await getCourse(resolvedParams.id);
  if (!course) return notFound();
  
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
                  <h1 className="text-2xl font-bold">{course.title}</h1>
                  <p className="text-muted-foreground">Course Details</p>
                </div>
              </div>
              <Button asChild>
                <Link href={`/admin-dashboard/courses/edit/${resolvedParams.id}`}>
                  <IconEdit className="size-4 mr-2" />
                  Edit Course
                </Link>
              </Button>
            </div>

            {/* Course Information */}
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
                <CardDescription>Basic details about your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{course.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Level</h3>
                    <Badge variant="outline" className="capitalize">{course.level}</Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Category</h3>
                    <Badge variant="outline" className="capitalize">{course.category}</Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Difficulty</h3>
                    <Badge variant="outline">{course.difficulty}/10</Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Duration</h3>
                    <Badge variant="outline">{course.estimatedDuration} minutes</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Published</h3>
                    <Badge variant={course.isPublished ? "default" : "secondary"}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Premium</h3>
                    <Badge variant={course.isPremium ? "default" : "outline"}>
                      {course.isPremium ? 'Premium' : 'Free'}
                    </Badge>
                  </div>
                </div>

                {course.learningObjectives && course.learningObjectives.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Learning Objectives</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {course.learningObjectives.map((objective: string, index: number) => (
                        <li key={index}>{objective}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Created</h3>
                  <p className="text-muted-foreground">{new Date(course.createdAt).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
