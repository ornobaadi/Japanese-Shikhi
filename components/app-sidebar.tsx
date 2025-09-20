"use client"

import * as React from "react"
import {
  IconBook,
  IconCalendar,
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSchool,
  IconSearch,
  IconSettings,
  IconUsers,
  IconVideo,
  IconWorldWww,
} from "@tabler/icons-react"

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

const data = {
  user: {
    name: "Admin",
    email: "admin@japanese-shikhi.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
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
      title: "Analytics",
      url: "/admin-dashboard/analytics",
      icon: IconChartBar,
    },
    {
      title: "Users",
      url: "/admin-dashboard/users",
      icon: IconUsers,
    },
    {
      title: "Classes",
      url: "/admin-dashboard/classes",
      icon: IconSchool,
    },
  ],
  navCourses: [
    {
      title: "Course Management",
      icon: IconBook,
      isActive: true,
      url: "/admin-dashboard/courses",
      items: [
        {
          title: "All Courses",
          url: "/admin-dashboard/courses",
        },
        {
          title: "Add New Course",
          url: "/admin-dashboard/courses/add",
        },
        {
          title: "Course Categories",
          url: "/admin-dashboard/courses/categories",
        },
      ],
    },
    {
      title: "Lessons & Curriculum",
      icon: IconListDetails,
      url: "/admin-dashboard/lessons",
      items: [
        {
          title: "All Lessons",
          url: "/admin-dashboard/lessons",
        },
        {
          title: "Add New Lesson",
          url: "/admin-dashboard/lessons/add",
        },
        {
          title: "Lesson Order",
          url: "/admin-dashboard/lessons/order",
        },
      ],
    },
    {
      title: "Class Links",
      icon: IconVideo,
      url: "/admin-dashboard/classes",
      items: [
        {
          title: "Live Classes",
          url: "/admin-dashboard/classes/live",
        },
        {
          title: "Recorded Classes",
          url: "/admin-dashboard/classes/recorded",
        },
        {
          title: "Schedule Classes",
          url: "/admin-dashboard/classes/schedule",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin-dashboard/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "/admin-dashboard/help",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "/admin-dashboard/search",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Student Database",
      url: "/admin-dashboard/users",
      icon: IconDatabase,
    },
    {
      name: "Course Reports",
      url: "/admin-dashboard/reports",
      icon: IconReport,
    },
    {
      name: "Class Calendar",
      url: "/admin-dashboard/classes/calendar",
      icon: IconCalendar,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/admin-dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Japanese Shikhi Admin</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavMain items={data.navCourses} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
