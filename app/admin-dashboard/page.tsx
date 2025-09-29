'use client';

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconPlus, IconBook, IconUsers, IconChartBar } from "@tabler/icons-react"
import { useLanguage } from '@/contexts/LanguageContext'

export default function Page() {
  const { t } = useLanguage();
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
                    <h1 className="text-2xl font-bold">{t('admin.dashboard')}</h1>
                    <p className="text-muted-foreground">{t('admin.dashboardOverview')}</p>
                  </div>
                  <Button className="gap-2" asChild>
                    <a href="/admin-dashboard/courses/add">
                      <IconPlus className="size-4" />
                      {t('admin.addNewCourse')}
                    </a>
                  </Button>
                </div>
              </div>

              <SectionCards />

              {/* Empty State for Recent Activity */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('admin.recentActivity')}</CardTitle>
                    <CardDescription>{t('admin.latestActivity')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="text-muted-foreground">
                        {t('admin.noRecentActivity')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}