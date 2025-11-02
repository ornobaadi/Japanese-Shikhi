"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  IconBook,
  IconChartBar,
  IconDashboard,
  IconInnerShadowTop,
  IconPlus,
  IconSettings,
  IconUsers,
  IconCalendar,
  IconUser,
  IconTrendingUp,
} from "@tabler/icons-react"
import { useUser } from "@clerk/nextjs"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useLanguage } from "@/contexts/LanguageContext"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()
  const pathname = usePathname()
  const { t } = useLanguage()
  
  // Determine if this is admin or student dashboard based on URL
  const isAdminDashboard = pathname?.startsWith('/admin-dashboard')
  const isStudentDashboard = pathname?.startsWith('/dashboard')

  // Admin navigation items
  const adminNavMain = [
    {
      title: "Dashboard",
      url: "/admin-dashboard",
      icon: IconDashboard,
    },
    {
      title: "All Courses",
      url: "/admin-dashboard/courses",
      icon: IconBook,
    },
    {
      title: "Add Course",
      url: "/admin-dashboard/courses/add",
      icon: IconPlus,
    },
    {
      title: "Users",
      url: "/admin-dashboard/users",
      icon: IconUsers,
    },
    {
      title: "Analytics",
      url: "/admin-dashboard/analytics",
      icon: IconChartBar,
    },
  ]

  // Student navigation items
  const studentNavMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "My Courses",
      url: "/dashboard/courses",
      icon: IconBook,
    },
    {
      title: "Schedule",
      url: "/dashboard/schedule",
      icon: IconCalendar,
    },
    {
      title: "Profile",
      url: "/dashboard/profile",
      icon: IconUser,
    },
    {
      title: "Progress",
      url: "/dashboard/progress",
      icon: IconTrendingUp,
    },
  ]

  // Choose navigation items based on context
  const navMain = isAdminDashboard ? adminNavMain : studentNavMain
  const dashboardUrl = isAdminDashboard ? "/admin-dashboard" : "/dashboard"
  const panelType = isAdminDashboard ? "Admin Panel" : "Student Dashboard"

  const userData = {
    name: user?.fullName || user?.firstName || (isAdminDashboard ? "Admin" : "Student"),
    email: user?.primaryEmailAddress?.emailAddress || (isAdminDashboard ? "admin@japanese-shikhi.com" : "student@japanese-shikhi.com"),
    avatar: user?.imageUrl || "/avatars/user.jpg",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props} className="">
      <SidebarHeader className="border-b border-border/40">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-12 px-3 hover:bg-muted transition-colors duration-200"
            >
              <a href={dashboardUrl} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <IconInnerShadowTop className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{t('admin.japaneseShikhi')}</span>
                  <span className="text-xs text-muted-foreground">{panelType}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-0 py-4">
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter className="border-t border-border/40 p-4">
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
