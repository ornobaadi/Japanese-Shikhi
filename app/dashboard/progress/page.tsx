'use client';

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, TrendingUp } from "lucide-react";

interface UserStats {
  totalCourses: number;
  completedLessons: number;
  studyStreak: number;
  studyTime: number;
  level: string;
  wordsLearned: number;
  quizzesTaken: number;
  averageScore: number;
  accuracyRate: number;
}

export default function DashboardProgressPage() {
  const { isLoaded, isSignedIn, user } = useUser();
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
        // Fetch user data
        const userResponse = await fetch('/api/users/me');
        if (!userResponse.ok) throw new Error('Failed to fetch user data');
        const userData = await userResponse.json();
        
        // Fetch quiz submissions for accuracy rate
        const quizResponse = await fetch('/api/quizzes/submissions');
        let quizStats = {
          quizzesTaken: 0,
          averageScore: 0,
          accuracyRate: 0
        };
        
        if (quizResponse.ok) {
          const quizData = await quizResponse.json();
          const submissions = quizData.submissions || [];
          
          if (submissions.length > 0) {
            const totalScore = submissions.reduce((sum: number, sub: any) => sum + (sub.percentage || 0), 0);
            quizStats = {
              quizzesTaken: submissions.length,
              averageScore: Math.round(totalScore / submissions.length),
              accuracyRate: Math.round(totalScore / submissions.length)
            };
          }
        }
        
        setUserStats({
          totalCourses: userData.enrolledCourses?.length || 0,
          completedLessons: userData.statistics?.lessonsCompleted || 0,
          studyStreak: userData.learningStreak || 0,
          studyTime: userData.totalStudyTime || 0,
          level: userData.currentLevel || 'beginner',
          wordsLearned: userData.statistics?.wordsLearned || 0,
          ...quizStats
        });
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
          <p className="text-muted-foreground">Loading progress...</p>
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
                    <h1 className="text-2xl font-bold">Learning Progress</h1>
                    <p className="text-muted-foreground">Track your Japanese learning journey and achievements</p>
                  </div>
                </div>
              </div>
              
              <div className="px-4 lg:px-6">
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
                              <span className="font-semibold text-green-600">
                                {userStats?.accuracyRate ? `${userStats.accuracyRate}%` : '--% (No quizzes yet)'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Quizzes Taken</span>
                              <span className="font-semibold">{userStats?.quizzesTaken || 0}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Average Score</span>
                              <span className="font-semibold">
                                {userStats?.averageScore ? `${userStats.averageScore}%` : '--'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}