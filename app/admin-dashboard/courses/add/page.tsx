import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";
import CourseForm from "@/components/admin/CourseForm";
import Link from "next/link";

export default function AddCoursePage() {
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
                  <h1 className="text-2xl font-bold">Add New Course</h1>
                  <p className="text-muted-foreground">Create a new Japanese language course</p>
                </div>
              </div>
            </div>
            <CourseForm />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
