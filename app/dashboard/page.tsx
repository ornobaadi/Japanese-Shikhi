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
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  GraduationCap,
  Target,
  Flame,
  CheckCircle2,
  Trophy,
  TrendingUp,
  Clock
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";

interface UserStats {
  totalCourses: number;
  completedLessons: number;
  studyStreak: number;
  studyTime: number;
  level: string;
  wordsLearned: number;
}

interface RecentActivity {
  id: string;
  type: 'quiz' | 'lesson' | 'enrollment' | 'achievement';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: {
    score?: number;
    courseName?: string;
    lessonName?: string;
  };
}

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { t } = useLanguage();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
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
        // Fetch user profile data
        const profileResponse = await fetch('/api/users/me');
        let userData = null;
        if (profileResponse.ok) {
          const result = await profileResponse.json();
          userData = result.data || result;
        }

        // Fetch actual enrolled courses (this filters out invalid enrollments)
        const coursesResponse = await fetch('/api/users/me/courses');
        let enrolledCoursesCount = 0;
        if (coursesResponse.ok) {
          const coursesResult = await coursesResponse.json();
          enrolledCoursesCount = coursesResult.data?.length || 0;
          console.log('Enrolled courses count:', enrolledCoursesCount);
        }

        setUserStats({
          totalCourses: enrolledCoursesCount, // Use actual enrolled courses count
          completedLessons: userData?.statistics?.lessonsCompleted || 0,
          studyStreak: userData?.learningStreak || 0,
          studyTime: userData?.totalStudyTime || 0,
          level: userData?.currentLevel || 'beginner',
          wordsLearned: userData?.statistics?.wordsLearned || 0
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

  // Load recent activities from localStorage
  useEffect(() => {
    if (!user) return;

    const loadRecentActivities = () => {
      const activities: RecentActivity[] = [];

      // Get all localStorage keys
      const keys = Object.keys(localStorage);

      // Filter keys related to user activities
      const userActivityKeys = keys.filter(key =>
        key.startsWith('quiz_') ||
        key.startsWith('lesson_') ||
        key.startsWith('enrollment_')
      );

      console.log('Found activity keys:', userActivityKeys);

      userActivityKeys.forEach(key => {
        try {
          const data = localStorage.getItem(key);
          if (!data) return;

          const parsedData = JSON.parse(data);
          console.log('Parsing activity:', key, parsedData);

          // Quiz activity - check if key contains user ID or if parsedData has userId
          if (key.startsWith('quiz_')) {
            const isUserQuiz = key.includes(user.id) || parsedData.userId === user.id;
            if (isUserQuiz) {
              activities.push({
                id: key,
                type: 'quiz',
                title: 'Quiz Completed',
                description: `Scored ${parsedData.score?.percentage || parsedData.score || 0}% on "${parsedData.quizTitle}"`,
                timestamp: new Date(parsedData.completedAt),
                metadata: {
                  score: parsedData.score?.percentage || parsedData.score || 0,
                  courseName: parsedData.courseName || 'Course'
                }
              });
            }
          }

          // Lesson activity
          if (key.startsWith('lesson_')) {
            const isUserLesson = key.includes(user.id) || parsedData.userId === user.id;
            if (isUserLesson) {
              activities.push({
                id: key,
                type: 'lesson',
                title: 'Lesson Completed',
                description: parsedData.lessonName || 'Lesson',
                timestamp: new Date(parsedData.completedAt),
                metadata: {
                  courseName: parsedData.courseName,
                  lessonName: parsedData.lessonName
                }
              });
            }
          }

          // Enrollment activity
          if (key.startsWith('enrollment_')) {
            const isUserEnrollment = key.includes(user.id) || parsedData.userId === user.id;
            if (isUserEnrollment) {
              activities.push({
                id: key,
                type: 'enrollment',
                title: 'Enrolled in Course',
                description: parsedData.courseName || 'New Course',
                timestamp: new Date(parsedData.enrolledAt),
                metadata: {
                  courseName: parsedData.courseName
                }
              });
            }
          }
        } catch (error) {
          console.error('Error parsing activity:', key, error);
        }
      });

      console.log('Loaded activities:', activities);

      // Sort by timestamp (newest first) and take latest 10
      const sortedActivities = activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);

      console.log('Sorted activities:', sortedActivities);
      setRecentActivities(sortedActivities);
    };

    loadRecentActivities();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadRecentActivities();
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events (for same-tab updates)
    const handleCustomStorage = () => {
      loadRecentActivities();
    };
    window.addEventListener('storage', handleCustomStorage);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage', handleCustomStorage);
    };
  }, [user]);

  // Function to create demo activities for testing
  const createDemoActivities = () => {
    if (!user) return;

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Demo quiz activity
    localStorage.setItem(`quiz_demo_${user.id}_hiragana_basics`, JSON.stringify({
      userId: user.id,
      quizTitle: 'Hiragana Basics Quiz',
      courseName: 'Japanese N5 Foundation',
      score: 85,
      completedAt: oneHourAgo.toISOString()
    }));

    // Demo lesson activity
    localStorage.setItem(`lesson_demo_${user.id}_intro_to_katakana_${Date.now()}`, JSON.stringify({
      userId: user.id,
      lessonName: 'Introduction to Katakana',
      courseName: 'Japanese Writing System',
      completedAt: threeDaysAgo.toISOString()
    }));

    // Demo enrollment activity
    localStorage.setItem(`enrollment_${user.id}_jlpt_prep_${Date.now()}`, JSON.stringify({
      userId: user.id,
      courseName: 'JLPT N4 Preparation Course',
      enrolledAt: oneWeekAgo.toISOString()
    }));

    // Trigger reload
    window.dispatchEvent(new Event('storage'));
  };

  if (!isLoaded || isChecking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={createDemoActivities}
                      className="gap-2"
                    >
                      <Trophy className="size-4" />
                      Load Demo Activities
                    </Button>
                    <Button className="gap-2" asChild>
                      <a href="/courses">
                        <BookOpen className="size-4" />
                        Browse Courses
                      </a>
                    </Button>
                  </div>
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
                    {recentActivities.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-muted-foreground">
                          No recent activity to display. Start learning to see your progress here!
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentActivities.map((activity) => {
                          const getActivityIcon = () => {
                            switch (activity.type) {
                              case 'quiz':
                                return <Trophy className="h-5 w-5 text-yellow-500" />;
                              case 'lesson':
                                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
                              case 'enrollment':
                                return <BookOpen className="h-5 w-5 text-blue-500" />;
                              case 'achievement':
                                return <TrendingUp className="h-5 w-5 text-purple-500" />;
                              default:
                                return <Clock className="h-5 w-5 text-gray-500" />;
                            }
                          };

                          const getActivityBadge = () => {
                            switch (activity.type) {
                              case 'quiz':
                                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Quiz</Badge>;
                              case 'lesson':
                                return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Lesson</Badge>;
                              case 'enrollment':
                                return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Enrollment</Badge>;
                              case 'achievement':
                                return <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Achievement</Badge>;
                              default:
                                return null;
                            }
                          };

                          const getTimeAgo = (date: Date) => {
                            const now = new Date();
                            const diffMs = now.getTime() - date.getTime();
                            const diffMins = Math.floor(diffMs / 60000);
                            const diffHours = Math.floor(diffMs / 3600000);
                            const diffDays = Math.floor(diffMs / 86400000);

                            if (diffMins < 1) return 'Just now';
                            if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
                            if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
                            if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
                            return date.toLocaleDateString();
                          };

                          return (
                            <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                              <div className="flex-shrink-0 mt-1">
                                {getActivityIcon()}
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{activity.title}</p>
                                  {getActivityBadge()}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {activity.description}
                                </p>
                                {activity.metadata?.courseName && (
                                  <p className="text-xs text-muted-foreground">
                                    in {activity.metadata.courseName}
                                  </p>
                                )}
                              </div>
                              <div className="flex-shrink-0 text-xs text-muted-foreground">
                                {getTimeAgo(activity.timestamp)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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