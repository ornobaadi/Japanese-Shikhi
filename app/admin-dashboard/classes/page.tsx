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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IconPlus, IconVideo, IconMicrophone, IconCalendar, IconClock, IconEye, IconEdit, IconTrash, IconExternalLink, IconCopy } from "@tabler/icons-react"

export default function ClassesPage() {
  // Sample class data
  const liveClasses = [
    {
      id: 1,
      title: "Interactive Hiragana Practice",
      course: "Japan101 - Hiragana Basics",
      instructor: "Tanaka Sensei",
      scheduledDate: "2025-09-25",
      scheduledTime: "10:00 AM",
      duration: "60 min",
      meetingLink: "https://zoom.us/j/123456789",
      passcode: "japanese123",
      status: "Scheduled",
      attendees: 12,
      maxAttendees: 20
    },
    {
      id: 2,
      title: "Grammar Q&A Session",
      course: "Japanese Grammar Fundamentals",
      instructor: "Sato Sensei",
      scheduledDate: "2025-09-27",
      scheduledTime: "2:00 PM",
      duration: "45 min",
      meetingLink: "https://meet.google.com/abc-defg-hij",
      passcode: "",
      status: "Scheduled",
      attendees: 8,
      maxAttendees: 15
    },
    {
      id: 3,
      title: "Business Japanese Workshop",
      course: "Business Japanese Conversation",
      instructor: "Suzuki Sensei",
      scheduledDate: "2025-09-23",
      scheduledTime: "6:00 PM",
      duration: "90 min",
      meetingLink: "https://zoom.us/j/987654321",
      passcode: "business789",
      status: "Completed",
      attendees: 6,
      maxAttendees: 10
    }
  ]

  const recordedClasses = [
    {
      id: 1,
      title: "Introduction to Hiragana Characters",
      course: "Japan101 - Hiragana Basics",
      instructor: "Tanaka Sensei",
      recordedDate: "2025-09-15",
      duration: "45 min",
      videoUrl: "https://vimeo.com/example123",
      downloadUrl: "https://example.com/download/hiragana-intro.mp4",
      views: 87,
      status: "Published",
      fileSize: "524 MB"
    },
    {
      id: 2,
      title: "Basic Grammar Particles Explained",
      course: "Japanese Grammar Fundamentals",
      instructor: "Sato Sensei",
      recordedDate: "2025-09-12",
      duration: "52 min",
      videoUrl: "https://youtube.com/watch?v=example456",
      downloadUrl: "https://example.com/download/grammar-particles.mp4",
      views: 134,
      status: "Published",
      fileSize: "687 MB"
    },
    {
      id: 3,
      title: "Kanji Writing Practice Session",
      course: "Kanji for Beginners",
      instructor: "Watanabe Sensei",
      recordedDate: "2025-09-10",
      duration: "38 min",
      videoUrl: "https://vimeo.com/example789",
      downloadUrl: "",
      views: 56,
      status: "Processing",
      fileSize: "412 MB"
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
                <h1 className="text-2xl font-bold">Class Management</h1>
                <p className="text-muted-foreground">Manage live classes and recorded sessions for your courses</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <IconVideo className="size-4" />
                  Add Recording
                </Button>
                <Button className="gap-2">
                  <IconPlus className="size-4" />
                  Schedule Live Class
                </Button>
              </div>
            </div>

            <Tabs defaultValue="live" className="space-y-6">
              <TabsList>
                <TabsTrigger value="live" className="gap-2">
                  <IconMicrophone className="size-4" />
                  Live Classes
                </TabsTrigger>
                <TabsTrigger value="recorded" className="gap-2">
                  <IconVideo className="size-4" />
                  Recorded Classes
                </TabsTrigger>
                <TabsTrigger value="schedule" className="gap-2">
                  <IconCalendar className="size-4" />
                  Schedule New
                </TabsTrigger>
              </TabsList>

              {/* Live Classes Tab */}
              <TabsContent value="live" className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Upcoming Classes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{liveClasses.filter(c => c.status === "Scheduled").length}</div>
                      <p className="text-xs text-muted-foreground">Next 7 days</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{liveClasses.reduce((sum, c) => sum + c.attendees, 0)}</div>
                      <p className="text-xs text-muted-foreground">Registered for upcoming</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">89%</div>
                      <p className="text-xs text-muted-foreground">Average attendance</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Live Classes List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Live Classes</CardTitle>
                    <CardDescription>Scheduled and completed live classes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {liveClasses.map((liveClass) => (
                        <div key={liveClass.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`p-2 rounded-full ${liveClass.status === "Scheduled" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}>
                              <IconMicrophone className="size-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{liveClass.title}</h3>
                                <Badge variant={liveClass.status === "Scheduled" ? "default" : "secondary"}>
                                  {liveClass.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{liveClass.course} • {liveClass.instructor}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <IconCalendar className="size-3" />
                                  {liveClass.scheduledDate}
                                </span>
                                <span className="flex items-center gap-1">
                                  <IconClock className="size-3" />
                                  {liveClass.scheduledTime} ({liveClass.duration})
                                </span>
                                <span>{liveClass.attendees}/{liveClass.maxAttendees} attendees</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {liveClass.meetingLink && (
                              <Button variant="outline" size="sm" className="gap-1">
                                <IconExternalLink className="size-4" />
                                Join/View
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <IconCopy className="size-4" />
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
              </TabsContent>

              {/* Recorded Classes Tab */}
              <TabsContent value="recorded" className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Recordings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{recordedClasses.length}</div>
                      <p className="text-xs text-muted-foreground">Published videos</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{recordedClasses.reduce((sum, c) => sum + c.views, 0)}</div>
                      <p className="text-xs text-muted-foreground">All time views</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">1.6 GB</div>
                      <p className="text-xs text-muted-foreground">Video storage</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recorded Classes List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recorded Classes</CardTitle>
                    <CardDescription>Manage your recorded class sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recordedClasses.map((recording) => (
                        <div key={recording.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`p-2 rounded-full ${recording.status === "Published" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>
                              <IconVideo className="size-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{recording.title}</h3>
                                <Badge variant={recording.status === "Published" ? "default" : "secondary"}>
                                  {recording.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{recording.course} • {recording.instructor}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span>Recorded: {recording.recordedDate}</span>
                                <span>Duration: {recording.duration}</span>
                                <span>{recording.views} views</span>
                                <span>{recording.fileSize}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {recording.videoUrl && (
                              <Button variant="outline" size="sm" className="gap-1">
                                <IconExternalLink className="size-4" />
                                Watch
                              </Button>
                            )}
                            {recording.downloadUrl && (
                              <Button variant="outline" size="sm" className="gap-1">
                                <IconVideo className="size-4" />
                                Download
                              </Button>
                            )}
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
              </TabsContent>

              {/* Schedule New Class Tab */}
              <TabsContent value="schedule" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Schedule Live Class</CardTitle>
                      <CardDescription>Set up a new live class session</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="class-title">Class Title *</Label>
                        <Input id="class-title" placeholder="e.g., Interactive Hiragana Practice" />
                      </div>
                      
                      <div>
                        <Label htmlFor="course-select">Course *</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="japan101">Japan101 - Hiragana Basics</SelectItem>
                            <SelectItem value="grammar">Japanese Grammar Fundamentals</SelectItem>
                            <SelectItem value="kanji">Kanji for Beginners</SelectItem>
                            <SelectItem value="business">Business Japanese Conversation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="class-date">Date *</Label>
                          <Input id="class-date" type="date" />
                        </div>
                        <div>
                          <Label htmlFor="class-time">Time *</Label>
                          <Input id="class-time" type="time" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="duration">Duration (minutes)</Label>
                          <Input id="duration" type="number" placeholder="60" />
                        </div>
                        <div>
                          <Label htmlFor="max-attendees">Max Attendees</Label>
                          <Input id="max-attendees" type="number" placeholder="20" />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="meeting-link">Meeting Link *</Label>
                        <Input id="meeting-link" placeholder="https://zoom.us/j/..." />
                      </div>

                      <div>
                        <Label htmlFor="passcode">Meeting Passcode</Label>
                        <Input id="passcode" placeholder="Optional passcode" />
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Class description and agenda..." rows={3} />
                      </div>

                      <Button className="w-full">
                        <IconCalendar className="size-4 mr-2" />
                        Schedule Class
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Add Recorded Video</CardTitle>
                      <CardDescription>Upload or link to a recorded class</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="video-title">Video Title *</Label>
                        <Input id="video-title" placeholder="e.g., Introduction to Hiragana Characters" />
                      </div>
                      
                      <div>
                        <Label htmlFor="video-course">Course *</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="japan101">Japan101 - Hiragana Basics</SelectItem>
                            <SelectItem value="grammar">Japanese Grammar Fundamentals</SelectItem>
                            <SelectItem value="kanji">Kanji for Beginners</SelectItem>
                            <SelectItem value="business">Business Japanese Conversation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="video-url">Video URL *</Label>
                        <Input id="video-url" placeholder="https://vimeo.com/... or https://youtube.com/..." />
                      </div>

                      <div>
                        <Label htmlFor="download-url">Download URL (Optional)</Label>
                        <Input id="download-url" placeholder="Direct download link" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="recorded-date">Recorded Date</Label>
                          <Input id="recorded-date" type="date" />
                        </div>
                        <div>
                          <Label htmlFor="video-duration">Duration</Label>
                          <Input id="video-duration" placeholder="45 min" />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="video-description">Description</Label>
                        <Textarea id="video-description" placeholder="Video content description..." rows={3} />
                      </div>

                      <Button className="w-full">
                        <IconVideo className="size-4 mr-2" />
                        Add Recording
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}