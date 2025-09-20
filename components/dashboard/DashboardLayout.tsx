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
  Flame
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import Link from "next/link";
import EnrolledCourses from "./EnrolledCourses";
import UserProfile from "./UserProfile";
import ClassSchedule from "./ClassSchedule";

interface UserStats {
  totalCourses: number;
  completedLessons: number;
  studyStreak: number;
  studyTime: number;
  level: string;
  wordsLearned: number;
}

export default function DashboardLayout() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
          const userData = await response.json();
          setUserStats({
            totalCourses: userData.enrolledCourses?.length || 0,
            completedLessons: userData.statistics?.lessonsCompleted || 0,
            studyStreak: userData.learningStreak || 0,
            studyTime: userData.totalStudyTime || 0,
            level: userData.currentLevel || 'beginner',
            wordsLearned: userData.statistics?.wordsLearned || 0
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
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
                Japanese Shikhi
              </h1>
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
                  <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
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
            Welcome back, {user?.firstName}! 👋
          </h2>
          <p className="text-gray-600">
            Continue your Japanese learning journey
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.studyStreak || 0}</div>
              <p className="text-xs text-muted-foreground">days in a row</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.totalCourses || 0}</div>
              <p className="text-xs text-muted-foreground">enrolled courses</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
              <GraduationCap className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.completedLessons || 0}</div>
              <p className="text-xs text-muted-foreground">lessons finished</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Words Learned</CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.wordsLearned || 0}</div>
              <p className="text-xs text-muted-foreground">vocabulary mastered</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="courses" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>My Courses</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Progress</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses">
            <EnrolledCourses />
          </TabsContent>
          
          <TabsContent value="schedule">
            <ClassSchedule />
          </TabsContent>
          
          <TabsContent value="profile">
            <UserProfile userStats={userStats} />
          </TabsContent>
          
          <TabsContent value="progress">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Progress</CardTitle>
                  <CardDescription>
                    Track your Japanese learning journey and achievements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Current Level</span>
                        <Badge variant="secondary">
                          {userStats?.level ? userStats.level.charAt(0).toUpperCase() + userStats.level.slice(1) : 'Beginner'}
                        </Badge>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Study Time</span>
                          <span>{Math.floor((userStats?.studyTime || 0) / 60)}h {(userStats?.studyTime || 0) % 60}m</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Accuracy Rate</span>
                          <span>--% (Coming Soon)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}