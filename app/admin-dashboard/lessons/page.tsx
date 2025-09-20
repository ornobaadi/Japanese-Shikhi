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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IconPlus, IconEdit, IconTrash, IconGripVertical, IconVideo, IconFileText, IconMicrophone, IconEye } from "@tabler/icons-react"

export default function LessonsPage() {
  // Sample lesson data
  const lessons = [
    {
      id: 1,
      title: "Introduction to Hiragana",
      course: "Japan101 - Hiragana Basics",
      type: "Video",
      duration: "15 min",
      order: 1,
      status: "Published",
      views: 45,
      completions: 32,
      hasRecording: true,
      hasLiveClass: false
    },
    {
      id: 2,
      title: "Hiragana Characters A-O",
      course: "Japan101 - Hiragana Basics",
      type: "Interactive",
      duration: "20 min",
      order: 2,
      status: "Published",
      views: 38,
      completions: 25,
      hasRecording: true,
      hasLiveClass: true
    },
    {
      id: 3,
      title: "Hiragana Practice Exercises",
      course: "Japan101 - Hiragana Basics",
      type: "Exercise",
      duration: "30 min",
      order: 3,
      status: "Draft",
      views: 0,
      completions: 0,
      hasRecording: false,
      hasLiveClass: false
    },
    {
      id: 4,
      title: "Basic Grammar Particles",
      course: "Japanese Grammar Fundamentals",
      type: "Video",
      duration: "25 min",
      order: 1,
      status: "Published",
      views: 52,
      completions: 28,
      hasRecording: true,
      hasLiveClass: true
    }
  ]

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
                <h1 className="text-2xl font-bold">Lessons & Curriculum</h1>
                <p className="text-muted-foreground">Manage lessons and organize course curriculum ({lessons.length} lessons)</p>
              </div>
              <Button className="gap-2">
                <IconPlus className="size-4" />
                Add New Lesson
              </Button>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filter Lessons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div>
                    <Label>Course</Label>
                    <Select>
                      <SelectTrigger className="w-60">
                        <SelectValue placeholder="All Courses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        <SelectItem value="japan101">Japan101 - Hiragana Basics</SelectItem>
                        <SelectItem value="grammar">Japanese Grammar Fundamentals</SelectItem>
                        <SelectItem value="kanji">Kanji for Beginners</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="interactive">Interactive</SelectItem>
                        <SelectItem value="exercise">Exercise</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lessons List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Lessons</CardTitle>
                    <CardDescription>Drag and drop to reorder lessons within each course</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    Bulk Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
                      {/* Drag Handle */}
                      <div className="cursor-move text-muted-foreground">
                        <IconGripVertical className="size-4" />
                      </div>

                      {/* Order */}
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                        {lesson.order}
                      </div>

                      {/* Lesson Info */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{lesson.title}</h3>
                          <Badge variant={lesson.status === "Published" ? "default" : "secondary"}>
                            {lesson.status}
                          </Badge>
                          <Badge variant="outline">{lesson.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{lesson.course}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Duration: {lesson.duration}</span>
                          <span>Views: {lesson.views}</span>
                          <span>Completions: {lesson.completions}</span>
                        </div>
                      </div>

                      {/* Class Links */}
                      <div className="flex items-center gap-2">
                        {lesson.hasRecording && (
                          <Button variant="outline" size="sm" className="gap-1">
                            <IconVideo className="size-4" />
                            Recording
                          </Button>
                        )}
                        {lesson.hasLiveClass && (
                          <Button variant="outline" size="sm" className="gap-1">
                            <IconMicrophone className="size-4" />
                            Live
                          </Button>
                        )}
                        {!lesson.hasRecording && !lesson.hasLiveClass && (
                          <Button variant="outline" size="sm" className="gap-1" disabled>
                            <IconFileText className="size-4" />
                            Text Only
                          </Button>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
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

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Lessons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{lessons.length}</div>
                  <p className="text-sm text-muted-foreground">Across all courses</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Published Lessons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{lessons.filter(l => l.status === "Published").length}</div>
                  <p className="text-sm text-muted-foreground">Live and accessible to students</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Avg. Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {Math.round(
                      lessons
                        .filter(l => l.views > 0)
                        .reduce((acc, l) => acc + (l.completions / l.views), 0) / 
                      lessons.filter(l => l.views > 0).length * 100
                    )}%
                  </div>
                  <p className="text-sm text-muted-foreground">Student completion rate</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}