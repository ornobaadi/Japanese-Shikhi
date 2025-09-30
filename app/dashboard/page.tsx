'use client';

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
<<<<<<< HEAD
import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
=======
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BookOpen, 
  GraduationCap,
  Target,
  Flame
} from "lucide-react";
>>>>>>> 8ceb6c0639d86c7249a82bd4243d1f4ef37c9262
import { Loader2 } from "lucide-react";

interface UserStats {
  totalCourses: number;
  completedLessons: number;
  studyStreak: number;
  studyTime: number;
  level: string;
  wordsLearned: number;
}

export default function DashboardPage() {
<<<<<<< HEAD
  const { isLoaded, isSignedIn } = useUser();
  const { t } = useLanguage();
=======
  const { isLoaded, isSignedIn, user } = useUser();
>>>>>>> 8ceb6c0639d86c7249a82bd4243d1f4ef37c9262
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push('/sign-in');
      } else {
        setIsChecking(false);
      }
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isSignedIn) return;
      
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

    if (isSignedIn) {
      fetchUserData();
    }
  }, [isSignedIn]);

  if (!isLoaded || isChecking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // Will redirect via useEffect
  }

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
                    <h1 className="text-2xl font-bold">Welcome back, {user?.firstName}! 👋</h1>
                    <p className="text-muted-foreground">Continue your Japanese learning journey</p>
                  </div>
                  <Button className="gap-2" asChild>
                    <a href="/courses">
                      <BookOpen className="size-4" />
                      Browse Courses
                    </a>
                  </Button>
                </div>
              </div>
              
              {/* Dashboard Stats Cards */}
              <div className="px-4 lg:px-6">
                <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                  <Card className="@container/card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardDescription>Study Streak</CardDescription>
                      <Flame className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {userStats?.studyStreak || 0}
                      </CardTitle>
                      <div className="text-muted-foreground text-sm">
                        days in a row
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="@container/card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardDescription>Total Courses</CardDescription>
                      <BookOpen className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {userStats?.totalCourses || 0}
                      </CardTitle>
                      <div className="text-muted-foreground text-sm">
                        enrolled courses
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="@container/card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardDescription>Lessons Completed</CardDescription>
                      <GraduationCap className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {userStats?.completedLessons || 0}
                      </CardTitle>
                      <div className="text-muted-foreground text-sm">
                        lessons finished
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="@container/card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardDescription>Words Learned</CardDescription>
                      <Target className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {userStats?.wordsLearned || 0}
                      </CardTitle>
                      <div className="text-muted-foreground text-sm">
                        vocabulary mastered
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest learning progress and achievements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="text-muted-foreground">
                        No recent activity to display. Start learning to see your progress here!
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
  );
}