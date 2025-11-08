'use client';

import { useState, useEffect } from 'react';
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { IconPlus } from "@tabler/icons-react"
import CourseList from "@/components/admin/CourseList"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"

export default function CoursesPage() {
  const { t } = useLanguage();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Listen for course creation events
  useEffect(() => {
    const handleCourseCreated = () => {
      setRefreshTrigger(prev => prev + 1);
    };

    // Listen for custom events
    window.addEventListener('courseCreated', handleCourseCreated);

    return () => {
      window.removeEventListener('courseCreated', handleCourseCreated);
    };
  }, []);

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
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{t('admin.allCourses')}</h1>
                <p className="text-muted-foreground">{t('admin.manageCourses')}</p>
              </div>
              <Button className="gap-2" asChild>
                <Link href="/admin-dashboard/courses/add">
                  <IconPlus className="size-4" />
                  {t('admin.addNewCourse')}
                </Link>
              </Button>
            </div>

            <CourseList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}