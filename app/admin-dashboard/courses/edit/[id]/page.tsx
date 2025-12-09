'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import CourseForm from "@/components/admin/CourseForm";
import { IconLoader } from "@tabler/icons-react";

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const [courseId, setCourseId] = useState<string>('');
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        setCourse(data.course);
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [courseId]);

  if (loading) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <IconLoader className="animate-spin w-8 h-8" />
              <p>Loading course...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!course) {
    notFound();
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold">Update Course</h1>
                  <p className="text-muted-foreground">Edit and update your course details</p>
                </div>
              </div>
            </div>
            <CourseForm initialCourse={course} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
