'use client';

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Calendar, 
  Users, 
  Clock, 
  Award, 
  TrendingUp, 
  Home, 
  LogOut, 
  User,
  VideoIcon,
  GraduationCap,
  Target,
  Flame,
  Settings,
  Plus,
  Edit,
  Eye,
  UserCheck,
  BookOpenCheck,
  Link2,
  PlayCircle
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import Link from "next/link";
import CourseManagement from "@/components/admin/CourseManagement";

interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  activeUsers: number;
  completedLessons: number;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  level: string;
  difficulty: string;
  isPublished: boolean;
  enrolledStudents: string[];
  createdAt: string;
}

export default function AdminDashboard() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // These endpoints would need to be created
        const [usersRes, coursesRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/courses')
        ]);
        
        if (usersRes.ok && coursesRes.ok) {
          const usersData = await usersRes.json();
          const coursesData = await coursesRes.json();
          
          setAdminStats({
            totalUsers: usersData.total || 0,
            totalCourses: coursesData.total || 0,
            totalEnrollments: usersData.totalEnrollments || 0,
            activeUsers: usersData.activeUsers || 0,
            completedLessons: coursesData.completedLessons || 0
          });
          
          setCourses(coursesData.recentCourses || []);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
        // Set default values on error
        setAdminStats({
          totalUsers: 0,
          totalCourses: 0,
          totalEnrollments: 0,
          activeUsers: 0,
          completedLessons: 0
        });
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleCourseCreate = (newCourse: Partial<Course>) => {
    setCourses(prev => [newCourse as Course, ...prev]);
    setAdminStats(prev => prev ? { ...prev, totalCourses: prev.totalCourses + 1 } : null);
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                Admin
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.imageUrl} alt={user?.fullName || "Admin"} />
                  <AvatarFallback>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">
                  {user?.fullName}
                </span>
              </div>
              
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}! 🔧
          </h2>
          <p className="text-gray-600">
            Manage your Japanese learning platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">registered users</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats?.totalCourses || 0}</div>
              <p className="text-xs text-muted-foreground">available courses</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
              <UserCheck className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats?.totalEnrollments || 0}</div>
              <p className="text-xs text-muted-foreground">total enrollments</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats?.activeUsers || 0}</div>
              <p className="text-xs text-muted-foreground">last 30 days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Lessons</CardTitle>
              <Award className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats?.completedLessons || 0}</div>
              <p className="text-xs text-muted-foreground">total completions</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="courses" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Courses</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="lessons" className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4" />
              <span>Lessons</span>
            </TabsTrigger>
            <TabsTrigger value="classes" className="flex items-center space-x-2">
              <VideoIcon className="h-4 w-4" />
              <span>Classes</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses">
            <CourseManagement courses={courses} onCourseCreate={handleCourseCreate} />
          </TabsContent>
          
          <TabsContent value="users">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">User Management</h3>
                  <p className="text-gray-600">View and manage registered users</p>
                </div>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>
                    View user profiles, enrollments, and progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    Loading user data...
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="lessons">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Lesson Management</h3>
                  <p className="text-gray-600">Create and organize course content</p>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Lesson
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Course Curriculum</CardTitle>
                  <CardDescription>
                    Organize lessons, quizzes, and learning materials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    No lessons found. Add lessons to your courses.
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="classes">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Class Management</h3>
                  <p className="text-gray-600">Manage live and recorded classes</p>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule New Class
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PlayCircle className="h-5 w-5 text-red-500" />
                      <span>Live Classes</span>
                    </CardTitle>
                    <CardDescription>
                      Manage live streaming sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      No live classes scheduled
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <VideoIcon className="h-5 w-5 text-blue-500" />
                      <span>Recorded Classes</span>
                    </CardTitle>
                    <CardDescription>
                      Upload and manage recorded content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      No recorded classes available
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Platform Analytics</h3>
                <p className="text-gray-600">Track platform performance and user engagement</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Engagement</CardTitle>
                    <CardDescription>
                      Daily active users and session data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      Analytics coming soon...
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Course Performance</CardTitle>
                    <CardDescription>
                      Completion rates and popular courses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      Analytics coming soon...
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}