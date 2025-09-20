import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IconPlus, IconSearch } from "@tabler/icons-react"

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
                <p className="text-muted-foreground">Manage your Japanese language courses</p>
              </div>
              <Button className="gap-2" asChild>
                <a href="/admin-dashboard/courses/add">
                  <IconPlus className="size-4" />
                  Add New Course
                </a>
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
                        <SelectItem value="published">Published</SelectItem>
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

            {/* Empty State */}
            <Card>
              <CardHeader>
                <CardTitle>Your Courses</CardTitle>
                <CardDescription>Create and manage your Japanese language courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-muted-foreground mb-4">
                    No courses created yet
                  </div>
                  <Button asChild>
                    <a href="/admin-dashboard/courses/add">
                      <IconPlus className="size-4 mr-2" />
                      Create Your First Course
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}