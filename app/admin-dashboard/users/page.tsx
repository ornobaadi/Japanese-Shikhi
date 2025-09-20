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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IconSearch, IconDownload, IconMail, IconEye, IconEdit, IconTrash, IconUser, IconTrophy, IconClock } from "@tabler/icons-react"

export default function UsersPage() {
  // Sample user data
  const users = [
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      avatar: "/avatars/alice.jpg",
      joinDate: "2025-08-15",
      lastActive: "2025-09-19",
      enrolledCourses: ["Japan101 - Hiragana Basics", "Japanese Grammar Fundamentals"],
      completedCourses: 1,
      totalProgress: 75,
      currentStreak: 12,
      status: "Active",
      subscription: "Premium",
      totalSpent: 89.97
    },
    {
      id: 2,
      name: "David Chen",
      email: "david.chen@example.com",
      avatar: "/avatars/david.jpg",
      joinDate: "2025-09-01",
      lastActive: "2025-09-18",
      enrolledCourses: ["Kanji for Beginners"],
      completedCourses: 0,
      totalProgress: 45,
      currentStreak: 7,
      status: "Active",
      subscription: "Free",
      totalSpent: 0
    },
    {
      id: 3,
      name: "Sarah Williams",
      email: "sarah.w@example.com",
      avatar: "/avatars/sarah.jpg",
      joinDate: "2025-07-22",
      lastActive: "2025-09-17",
      enrolledCourses: ["Business Japanese Conversation", "Japanese Culture & Etiquette"],
      completedCourses: 2,
      totalProgress: 90,
      currentStreak: 25,
      status: "Active",
      subscription: "Premium",
      totalSpent: 159.94
    },
    {
      id: 4,
      name: "Mike Rodriguez",
      email: "mike.r@example.com",
      avatar: "/avatars/mike.jpg",
      joinDate: "2025-06-10",
      lastActive: "2025-09-05",
      enrolledCourses: ["Japan101 - Hiragana Basics"],
      completedCourses: 0,
      totalProgress: 20,
      currentStreak: 0,
      status: "Inactive",
      subscription: "Free",
      totalSpent: 19.99
    },
    {
      id: 5,
      name: "Emma Thompson",
      email: "emma.t@example.com",
      avatar: "/avatars/emma.jpg",
      joinDate: "2025-08-30",
      lastActive: "2025-09-19",
      enrolledCourses: ["Japanese Reading Comprehension", "Kanji for Beginners"],
      completedCourses: 1,
      totalProgress: 65,
      currentStreak: 15,
      status: "Active",
      subscription: "Premium",
      totalSpent: 119.95
    }
  ]

  const totalUsers = users.length
  const activeUsers = users.filter(u => u.status === "Active").length
  const premiumUsers = users.filter(u => u.subscription === "Premium").length
  const totalRevenue = users.reduce((sum, u) => sum + u.totalSpent, 0)

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
                <h1 className="text-2xl font-bold">Students & Users</h1>
                <p className="text-muted-foreground">Manage enrolled students and track their progress ({totalUsers} total users)</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <IconDownload className="size-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline">
                  <IconMail className="size-4 mr-2" />
                  Send Notification
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <IconUser className="size-4" />
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalUsers}</div>
                  <p className="text-xs text-muted-foreground">All registered users</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <IconTrophy className="size-4" />
                    Active Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeUsers}</div>
                  <p className="text-xs text-muted-foreground">{Math.round((activeUsers/totalUsers)*100)}% of total users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{premiumUsers}</div>
                  <p className="text-xs text-muted-foreground">{Math.round((premiumUsers/totalUsers)*100)}% conversion rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">From all users</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Search & Filter Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Search users</Label>
                    <div className="relative">
                      <IconSearch className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Input id="search" placeholder="Search by name or email..." className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Subscription</Label>
                    <Select>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Users List */}
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Student enrollment and progress tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
                      {/* Avatar & Basic Info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar>
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium truncate">{user.name}</h3>
                            <Badge variant={user.status === "Active" ? "default" : "secondary"}>
                              {user.status}
                            </Badge>
                            <Badge variant={user.subscription === "Premium" ? "default" : "outline"}>
                              {user.subscription}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                          <p className="text-xs text-muted-foreground">Joined: {user.joinDate} • Last active: {user.lastActive}</p>
                        </div>
                      </div>

                      {/* Progress Info */}
                      <div className="hidden md:block space-y-2 w-48">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{user.totalProgress}%</span>
                        </div>
                        <Progress value={user.totalProgress} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          {user.completedCourses} completed, {user.enrolledCourses.length} enrolled
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="hidden lg:flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-medium flex items-center gap-1">
                            <IconClock className="size-3" />
                            {user.currentStreak}
                          </div>
                          <div className="text-xs text-muted-foreground">Day Streak</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">${user.totalSpent.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">Spent</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <IconEye className="size-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <IconMail className="size-4" />
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

            {/* Enrollment Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Enrollments</CardTitle>
                  <CardDescription>Latest course enrollments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-8">
                          <AvatarFallback>ET</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">Emma Thompson</p>
                          <p className="text-xs text-muted-foreground">Kanji for Beginners</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">2 days ago</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-8">
                          <AvatarFallback>DC</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">David Chen</p>
                          <p className="text-xs text-muted-foreground">Kanji for Beginners</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">5 days ago</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-8">
                          <AvatarFallback>AJ</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">Alice Johnson</p>
                          <p className="text-xs text-muted-foreground">Japanese Grammar Fundamentals</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">1 week ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Course Completion Stats</CardTitle>
                  <CardDescription>Completion rates by course</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Japan101 - Hiragana Basics</span>
                        <span>67%</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Kanji for Beginners</span>
                        <span>58%</span>
                      </div>
                      <Progress value={58} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Business Japanese</span>
                        <span>37%</span>
                      </div>
                      <Progress value={37} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Japanese Culture & Etiquette</span>
                        <span>75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}