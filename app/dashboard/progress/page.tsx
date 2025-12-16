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

interface QuizSubmission {
  _id: string;
  courseId: string;
  courseTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
}

interface CourseProgress {
  courseId: string;
  courseTitle: string;
  totalItems: number;
  completedItems: number;
  totalResources: number;
  totalQuizzes: number;
  totalAssignments: number;
  totalAnnouncements: number;
  completedQuizzes: number;
  completedAssignments: number;
  progressPercentage: number;
}

export default function DashboardProgressPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [quizSubmissions, setQuizSubmissions] = useState<QuizSubmission[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  // Fetch activity feed from backend
  useEffect(() => {
    if (!user) return;
    const fetchActivities = async () => {
      try {
        const res = await fetch('/api/users/activity');
        if (!res.ok) throw new Error('Failed to fetch activities');
        const data = await res.json();
        setActivityFeed((data.activities || []).slice(0, 10));
      } catch (err) {
        setActivityFeed([]);
      }
    };
    fetchActivities();
  }, [user]);

  // Per-course activity and rank
  const [perCourseActivity, setPerCourseActivity] = useState<any[]>([]);
  const [courseRanks, setCourseRanks] = useState<Record<string, { rank: number, total: number }>>({});
  useEffect(() => {
    if (!user) return;
    const fetchPerCourse = async () => {
      try {
        const res = await fetch('/api/users/course-activity');
        if (!res.ok) throw new Error('Failed to fetch per-course activity');
        const data = await res.json();
        setPerCourseActivity(data.perCourse || []);
        // Fetch rank for each course
        for (const c of data.perCourse || []) {
          try {
            const rankRes = await fetch(`/api/users/course-rank?courseId=${c.courseId}`);
            if (rankRes.ok) {
              const rankData = await rankRes.json();
              setCourseRanks(prev => ({ ...prev, [c.courseId]: { rank: rankData.rank, total: rankData.total } }));
            }
          } catch {}
        }
      } catch {}
    };
    fetchPerCourse();
  }, [user]);

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
        
        let allSubmissions: any[] = [];
        
        if (quizResponse.ok) {
          const quizData = await quizResponse.json();
          const submissions = quizData.submissions || [];
          allSubmissions = submissions;
          setQuizSubmissions(submissions);
          
          if (submissions.length > 0) {
            const totalScore = submissions.reduce((sum: number, sub: any) => sum + (sub.percentage || 0), 0);
            quizStats = {
              quizzesTaken: submissions.length,
              averageScore: Math.round(totalScore / submissions.length),
              accuracyRate: Math.round(totalScore / submissions.length)
            };
          }
        }
        
        // Fetch course progress with curriculum breakdown
        const enrolledCourses = userData.enrolledCourses || [];
        const progressData: CourseProgress[] = [];
        
        for (const enrollment of enrolledCourses) {
          try {
            const courseId = enrollment.courseId?._id || enrollment.courseId;
            const curriculumResponse = await fetch(`/api/courses/${courseId}/curriculum`);
            if (curriculumResponse.ok) {
              const curriculumData = await curriculumResponse.json();
              const modules = curriculumData.curriculum?.modules || [];
              let totalItems = 0;
              let totalResources = 0;
              let totalQuizzes = 0;
              let totalAssignments = 0;
              let totalAnnouncements = 0;
              modules.forEach((module: any) => {
                module.items?.forEach((item: any) => {
                  totalItems++;
                  switch (item.type) {
                    case 'resource': totalResources++; break;
                    case 'quiz': totalQuizzes++; break;
                    case 'assignment': totalAssignments++; break;
                    case 'announcement': totalAnnouncements++; break;
                  }
                });
              });
              const completedQuizzes = allSubmissions.filter((sub: any) => sub.courseId === courseId).length;
              
              // Calculate progress (for now, based on quiz completion)
              const completedItems = completedQuizzes;
              const progressPercentage = totalItems > 0 
                ? Math.round((completedItems / totalItems) * 100) 
                : 0;
              
              progressData.push({
                courseId,
                courseTitle: curriculumData.title,
                totalItems,
                completedItems,
                totalResources,
                totalQuizzes,
                totalAssignments,
                totalAnnouncements,
                completedQuizzes,
                completedAssignments: 0, // TODO: Add assignment tracking
                progressPercentage
              });
            }
          } catch (error) {
            console.error('Error fetching course curriculum:', error);
          }
        }
        
        setCourseProgress(progressData);
        
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


              {/* Activity Feed */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Feed</CardTitle>
                    <CardDescription>Your latest enrollments, quiz completions, and assignments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activityFeed.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-muted-foreground">
                          No recent activity to display.
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activityFeed.map((activity, idx) => {
                          let icon = '📚';
                          let title = '';
                          let desc = '';
                          let date = '';
                          if (activity.type === 'enrollment') {
                            icon = '📚';
                            title = 'Enrolled in Course';
                            desc = activity.courseName || 'New Course';
                            date = activity.enrolledAt ? new Date(activity.enrolledAt).toLocaleDateString() : '';
                          } else if (activity.type === 'quiz') {
                            icon = '📝';
                            title = 'Quiz Completed';
                            desc = `Scored ${activity.score || 0}% on "${activity.quizTitle || 'Quiz'}"`;
                            date = activity.submittedAt ? new Date(activity.submittedAt).toLocaleDateString() : '';
                          } else if (activity.type === 'assignment') {
                            icon = '✍️';
                            title = 'Assignment Submitted';
                            desc = activity.assignmentTitle ? `Submitted "${activity.assignmentTitle}"${typeof activity.grade === 'number' ? ` (${activity.grade}% graded)` : ''}` : 'Assignment submitted';
                            date = activity.submittedAt ? new Date(activity.submittedAt).toLocaleDateString() : '';
                          }
                          return (
                            <div key={idx} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                              <div className="flex-shrink-0 mt-1 text-xl">{icon}</div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{title}</p>
                                </div>
                                <p className="text-sm text-muted-foreground">{desc}</p>
                              </div>
                              <div className="flex-shrink-0 text-xs text-muted-foreground">{date}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Per-course Activity Breakdown & Rank */}
              <div className="px-4 lg:px-6">
                <div className="space-y-6">
                  {perCourseActivity.length > 0 && perCourseActivity.map((course) => (
                    <Card key={course.courseId}>
                      <CardHeader>
                        <CardTitle>{course.courseTitle}</CardTitle>
                        <CardDescription>
                          {courseRanks[course.courseId] ? (
                            <span>
                              <b>Rank:</b> {courseRanks[course.courseId].rank} / {courseRanks[course.courseId].total}
                            </span>
                          ) : (
                            <span>Calculating rank...</span>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-2">
                          <b>Quizzes:</b>
                          {course.quizzes.length === 0 ? (
                            <span className="ml-2 text-muted-foreground">No quizzes completed yet.</span>
                          ) : (
                            <ul className="ml-4 list-disc">
                              {course.quizzes.map((q: any, idx: number) => (
                                <li key={idx}>
                                  {q.quizTitle || 'Quiz'} — <b>{q.score}%</b> {q.passed ? <span className="text-green-600">(Passed)</span> : <span className="text-red-600">(Failed)</span>} <span className="text-xs text-muted-foreground">[{q.submittedAt ? new Date(q.submittedAt).toLocaleDateString() : ''}]</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="mb-2">
                          <b>Assignments:</b>
                          {course.assignments.length === 0 ? (
                            <span className="ml-2 text-muted-foreground">No assignments submitted yet.</span>
                          ) : (
                            <ul className="ml-4 list-disc">
                              {course.assignments.map((a: any, idx: number) => (
                                <li key={idx}>
                                  {a.assignmentTitle || 'Assignment'} — <b>{typeof a.grade === 'number' ? `${a.grade}%` : 'Ungraded'}</b> {a.isLate ? <span className="text-orange-600">(Late)</span> : ''} <span className="text-xs text-muted-foreground">[{a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : ''}]</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div className="px-4 lg:px-6">
                <div className="space-y-6">
                  {/* Course-wise Progress */}
                  {courseProgress.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Course Progress</CardTitle>
                        <CardDescription>
                          Track your progress across all enrolled courses
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {courseProgress.map((course) => (
                            <div key={course.courseId} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-semibold">{course.courseTitle}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {course.completedItems} of {course.totalItems} items completed
                                  </p>
                                </div>
                                <Badge variant="outline" className="ml-2">
                                  {course.progressPercentage}%
                                </Badge>
                              </div>
                              
                              {/* Progress bar */}
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                <div
                                  className="bg-green-500 h-2 rounded-full transition-all"
                                  style={{ width: `${course.progressPercentage}%` }}
                                />
                              </div>
                              
                              {/* Item breakdown */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">📚 Resources:</span>
                                  <span className="font-medium">{course.totalResources}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">📝 Quizzes:</span>
                                  <span className="font-medium">{course.completedQuizzes}/{course.totalQuizzes}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">✍️ Assignments:</span>
                                  <span className="font-medium">{course.completedAssignments}/{course.totalAssignments}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">📢 Announcements:</span>
                                  <span className="font-medium">{course.totalAnnouncements}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
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
                  
                  {/* Quiz History */}
                  {quizSubmissions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Quiz Results
                        </CardTitle>
                        <CardDescription>
                          Your recent quiz attempts and scores
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {quizSubmissions.slice(0, 5).map((submission) => (
                            <div
                              key={submission._id}
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                            >
                              <div className="flex-1">
                                <h4 className="font-medium">{submission.courseTitle}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-sm text-muted-foreground">Score</p>
                                  <p className="font-semibold">{submission.score}/{submission.totalQuestions}</p>
                                </div>
                                <Badge 
                                  variant={submission.passed ? "default" : "destructive"}
                                  className="min-w-[60px] justify-center"
                                >
                                  {submission.percentage}%
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                        {quizSubmissions.length > 5 && (
                          <p className="text-sm text-muted-foreground text-center mt-4">
                            Showing 5 most recent quizzes out of {quizSubmissions.length} total
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}