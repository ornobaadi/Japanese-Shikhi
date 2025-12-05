"use client"

import * as React from "react"
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
  IconInbox,
  IconMail,
  IconArticle,
} from "@tabler/icons-react"
import { useUser } from "@clerk/nextjs"
import { usePathname } from "next/navigation"

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
  const [mounted, setMounted] = React.useState(false)
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [adminUnreadCount, setAdminUnreadCount] = React.useState(0)
  
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  // Fetch unread message count for students
  React.useEffect(() => {
    if (mounted && user && pathname?.startsWith('/dashboard')) {
      const fetchUnreadCount = async () => {
        try {
          const response = await fetch('/api/messages?type=inbox')
          if (response.ok) {
            const data = await response.json()
            // Use the unreadCount from API instead of filtering client-side
            setUnreadCount(data.unreadCount || 0)
          }
        } catch (error) {
          console.error('Failed to fetch unread count:', error)
        }
      }
      fetchUnreadCount()
      // Refresh every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [mounted, user, pathname])

  // Fetch unread message count for admins
  React.useEffect(() => {
    if (mounted && user && pathname?.startsWith('/admin-dashboard')) {
      const fetchAdminUnreadCount = async () => {
        try {
          const response = await fetch('/api/messages?type=inbox')
          if (response.ok) {
            const data = await response.json()
            // Use the unreadCount from API instead of filtering client-side
            setAdminUnreadCount(data.unreadCount || 0)
          }
        } catch (error) {
          console.error('Failed to fetch admin unread count:', error)
        }
      }
      fetchAdminUnreadCount()
      // Refresh every 30 seconds
      const interval = setInterval(fetchAdminUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [mounted, user, pathname])
  
  // Determine if this is admin or student dashboard based on URL
  const isAdminDashboard = mounted && pathname?.startsWith('/admin-dashboard')
  const isStudentDashboard = mounted && pathname?.startsWith('/dashboard')

  // Admin navigation items
  const adminNavMain = [
    {
      title: "Dashboard",
      url: "/admin-dashboard",
      icon: IconDashboard,
    },
    {
      title: "Inbox",
      url: "/admin-dashboard/inbox",
      icon: IconInbox,
      badge: adminUnreadCount,
    },
    {
      title: "Student Progress",
      url: "/admin-dashboard/students/progress",
      icon: IconChartBar,
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
      title: "Enrollments",
      url: "/admin-dashboard/enrollments",
      icon: IconUsers,
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
    {
      title: "Blog",
      url: "/admin-dashboard/blog",
      icon: IconArticle,
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
      title: "Messages",
      url: "/dashboard/messages",
      icon: IconMail,
      badge: unreadCount,
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

  // Prevent hydration mismatch by not rendering dynamic content until mounted
  if (!mounted) {
    return (
      <Sidebar collapsible="offcanvas" {...props} className="">
        <SidebarHeader className="border-b border-border/40">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="h-12 px-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <IconInnerShadowTop className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">Japanese Shikhi</span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="px-0 py-4" />
        <SidebarFooter className="border-t border-border/40 p-4" />
      </Sidebar>
    )
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
                  <span className="text-sm font-semibold">Japanese Shikhi</span>
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
