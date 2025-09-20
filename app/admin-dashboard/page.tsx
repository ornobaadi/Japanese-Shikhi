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
import { Badge } from "@/components/ui/badge"
import { IconPlus, IconEye, IconEdit, IconTrash, IconCalendar, IconUsers, IconBook, IconVideo } from "@tabler/icons-react"

import data from "./admin-data.json"

export default function Page() {
  // Calculate summary data from the course data
  const totalCourses = data.length
  const activeCourses = data.filter(course => course.status === "Active").length
  const totalEnrolled = data.reduce((sum, course) => sum + course.enrolled, 0)
  const totalRevenue = data.reduce((sum, course) => sum + course.revenue, 0)
  const recentCourses = data.slice(0, 4) // Show first 4 courses as recent

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
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Overview of your Japanese language courses</p>
                  </div>
                  <Button className="gap-2">
                    <IconPlus className="size-4" />
                    Add New Course
                  </Button>
                </div>
              </div>
              
              <SectionCards />
              
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>

              {/* Quick Actions Section */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common administrative tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button variant="outline" className="flex flex-col h-20 gap-2">
                        <IconBook className="size-5" />
                        <span className="text-sm">Manage All Courses</span>
                      </Button>
                      <Button variant="outline" className="flex flex-col h-20 gap-2">
                        <IconUsers className="size-5" />
                        <span className="text-sm">View Students</span>
                      </Button>
                      <Button variant="outline" className="flex flex-col h-20 gap-2">
                        <IconVideo className="size-5" />
                        <span className="text-sm">Class Schedule</span>
                      </Button>
                      <Button variant="outline" className="flex flex-col h-20 gap-2">
                        <IconCalendar className="size-5" />
                        <span className="text-sm">Schedule Live Class</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Courses Section */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Recent Courses</CardTitle>
                        <CardDescription>Recently created courses</CardDescription>
                      </div>
                      <Button variant="outline" size="sm">View All</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentCourses.map((course) => (
                        <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{course.courseName}</h3>
                              <Badge variant={course.status === "Active" ? "default" : course.status === "Draft" ? "secondary" : "outline"}>
                                {course.status}
                              </Badge>
                              <Badge variant="outline">{course.level}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{course.instructor} • {course.category}</p>
                            <p className="text-sm text-muted-foreground">
                              {course.enrolled} enrolled • {course.completed} completed • ${course.revenue.toFixed(2)} revenue
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <IconEye className="size-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <IconEdit className="size-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <IconTrash className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
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
