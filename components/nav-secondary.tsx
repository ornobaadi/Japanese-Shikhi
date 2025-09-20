"use client"

import * as React from "react"
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

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: Icon
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const pathname = usePathname() || "/"

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent className="px-2">
        <SidebarMenu className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.url
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
                    <item.icon className="size-5 flex-shrink-0" />
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
