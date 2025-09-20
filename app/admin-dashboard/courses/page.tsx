import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { IconPlus, IconEye, IconEdit, IconTrash, IconSearch, IconFilter, IconDownload } from "@tabler/icons-react"

import adminData from "../admin-data.json"

export default function CoursesPage() {
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
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">All Courses</h1>
                <p className="text-muted-foreground">Manage your Japanese language courses ({adminData.length} total)</p>
              </div>
              <Button className="gap-2">
                <IconPlus className="size-4" />
                Add New Course
              </Button>
            </div>

            {/* Filters and Search */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filter & Search</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Search courses</Label>
                    <div className="relative">
                      <IconSearch className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Input id="search" placeholder="Search by course name, instructor..." className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="coming-soon">Coming Soon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Level</Label>
                    <Select>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="All Levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="n5">N5</SelectItem>
                        <SelectItem value="n4">N4</SelectItem>
                        <SelectItem value="n3">N3</SelectItem>
                        <SelectItem value="n2">N2</SelectItem>
                        <SelectItem value="n1">N1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="vocabulary">Vocabulary</SelectItem>
                        <SelectItem value="grammar">Grammar</SelectItem>
                        <SelectItem value="kanji">Kanji</SelectItem>
                        <SelectItem value="conversation">Conversation</SelectItem>
                        <SelectItem value="culture">Culture</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {adminData.map((course) => (
                <Card key={course.id} className="h-fit">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg line-clamp-2">{course.courseName}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={course.status === "Active" ? "default" : course.status === "Draft" ? "secondary" : "outline"}>
                            {course.status}
                          </Badge>
                          <Badge variant="outline">{course.level}</Badge>
                          <Badge variant="outline">{course.category}</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <IconEdit className="size-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Instructor</p>
                        <p className="font-medium">{course.instructor}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Enrolled</p>
                          <p className="font-medium text-lg">{course.enrolled}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Completed</p>
                          <p className="font-medium text-lg">{course.completed}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Revenue</p>
                          <p className="font-medium text-lg">${course.revenue.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Completion Rate</p>
                          <p className="font-medium text-lg">
                            {course.enrolled > 0 ? Math.round((course.completed / course.enrolled) * 100) : 0}%
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Last Updated: {course.lastUpdated}</p>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <IconEye className="size-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <IconEdit className="size-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <IconTrash className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Bulk Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bulk Actions</CardTitle>
                <CardDescription>Select multiple courses to perform bulk operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Checkbox id="select-all" />
                  <Label htmlFor="select-all" className="text-sm">Select all courses</Label>
                  <div className="flex gap-2 ml-auto">
                    <Button variant="outline" size="sm" disabled>
                      <IconDownload className="size-4 mr-2" />
                      Export Selected
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      Bulk Edit
                    </Button>
                    <Button variant="outline" size="sm" disabled className="text-destructive">
                      Delete Selected
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}