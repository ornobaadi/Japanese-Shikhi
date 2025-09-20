"use client"

import { IconLogout } from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useClerk } from "@clerk/nextjs"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const clerk = useClerk()

  const openAccount = () => {
    ;(clerk as any).openUserProfile?.() || (clerk as any).openAccount?.()
  }

  const handleSignOut = async () => {
    await clerk.signOut()
    window.location.href = "/"
  }

  return (
    <SidebarMenu className="mt-4">
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={openAccount}
          className="h-12 px-3 rounded-lg hover:bg-muted transition-all duration-200 ease-in-out"
        >
          <Avatar className="h-9 w-9 rounded-lg ring-2 ring-background">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left ml-3">
            <div className="text-sm font-medium leading-tight">{user.name}</div>
            <div className="text-xs text-muted-foreground leading-tight mt-0.5">
              {user.email}
            </div>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem className="mt-2">
        <SidebarMenuButton 
          onClick={handleSignOut} 
          className="h-10 px-3 rounded-lg hover:bg-destructive hover:text-white transition-all duration-200 ease-in-out"
        >
          <IconLogout className="size-4 flex-shrink-0" />
          <span className="text-sm font-medium ml-3">Sign out</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
