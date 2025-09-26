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
} from "@tabler/icons-react"
import { useUser } from "@clerk/nextjs"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import LanguageToggle from "@/components/ui/language-toggle"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useLanguage } from '@/contexts/LanguageContext'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()
  const { t } = useLanguage()

  const navMain = [
    {
      title: t('admin.dashboard'),
      url: "/admin-dashboard",
      icon: IconDashboard,
    },
    {
      title: t('admin.allCourses'),
      url: "/admin-dashboard/courses",
      icon: IconBook,
    },
    {
      title: t('admin.addCourse'),
      url: "/admin-dashboard/courses/add",
      icon: IconPlus,
    },
    {
      title: t('admin.users'),
      url: "/admin-dashboard/users",
      icon: IconUsers,
    },
    {
      title: t('admin.analytics'),
      url: "/admin-dashboard/analytics",
      icon: IconChartBar,
    },
  ]

  const userData = {
    name: user?.fullName || user?.firstName || "Admin",
    email: user?.primaryEmailAddress?.emailAddress || "admin@japanese-shikhi.com",
    avatar: user?.imageUrl || "/avatars/admin.jpg",
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
              <a href="/admin-dashboard" className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <IconInnerShadowTop className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{t('admin.japaneseShikhi')}</span>
                  <span className="text-xs text-muted-foreground">{t('admin.adminPanel')}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-0 py-4">
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter className="border-t border-border/40 p-4 space-y-2">
        <div className="flex justify-center">
          <LanguageToggle />
        </div>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
