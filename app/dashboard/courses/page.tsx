'use client';

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Loader2, BookOpen } from "lucide-react";
import EnrolledCourses from "@/components/dashboard/EnrolledCourses";

export default function DashboardCoursesPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push('/sign-in');
      } else {
        setIsChecking(false);
      }
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // Will redirect via useEffect
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
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">My Courses</h1>
                    <p className="text-muted-foreground">Manage your enrolled Japanese language courses</p>
                  </div>
                </div>
              </div>
              
              <div className="px-4 lg:px-6">
                <EnrolledCourses />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}