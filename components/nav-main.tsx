"use client"

import { type Icon } from "@tabler/icons-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const pathname = usePathname() || "/"

  return (
    <SidebarGroup>
      <SidebarGroupContent className="px-2">
        <SidebarMenu className="space-y-1">
          {items.map((item) => {
            // Enhanced active detection for both admin and student dashboards
            let isActive = false
            
            if (pathname === item.url) {
              isActive = true
            } else if (item.url === "/admin-dashboard/courses" && pathname.startsWith("/admin-dashboard/courses") && pathname !== "/admin-dashboard/courses/add") {
              isActive = true
            } else if (item.url === "/admin-dashboard/courses/add" && pathname === "/admin-dashboard/courses/add") {
              isActive = true
            } else if (item.url.startsWith("/dashboard/") && pathname.startsWith(item.url)) {
              isActive = true
            }
            
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  className={`
                    h-10 px-3 rounded-lg transition-all duration-200 ease-in-out
                    ${isActive 
                      ? "bg-primary text-primary-foreground shadow-sm font-medium" 
                      : "hover:bg-muted hover:text-foreground text-muted-foreground"
                    }
                  `}
                >
                  <Link href={item.url} className="flex items-center gap-3">
                    {item.icon && <item.icon className="size-5 flex-shrink-0" />}
                    <span className="text-sm font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
