'use client';

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useLanguage } from "@/contexts/LanguageContext";
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
import LanguageToggle from "@/components/ui/language-toggle";
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
  const { t } = useLanguage();
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
        <div className="animate-pulse">{t('dashboard.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">日</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Japanese Shikhi
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <LanguageToggle />

              <Link href="/">
                <Button variant="ghost" size="sm" className="hover:bg-gray-100/80">
                  <Home className="h-4 w-4 mr-2" />
                  {t('dashboard.home')}
                </Button>
              </Link>

              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8 ring-2 ring-orange-200">
                  <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                  <AvatarFallback className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">
                  {user?.fullName}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t('dashboard.signOut')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with enhanced design */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                {t('dashboard.welcomeBack')},
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 ml-2">
                  {user?.firstName}!
                </span>
                <span className="ml-2">👋</span>
              </h2>
              <p className="text-xl text-gray-600">
                {t('dashboard.continueJourney')}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg">
                <BookOpen className="h-4 w-4 mr-2" />
                {t('dashboard.continueLearning')}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.studyStreak')}</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.studyStreak || 0}</div>
              <p className="text-xs text-muted-foreground">{t('dashboard.daysInRow')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.totalCourses')}</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.totalCourses || 0}</div>
              <p className="text-xs text-muted-foreground">{t('dashboard.enrolledCourses')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.lessonsCompleted')}</CardTitle>
              <GraduationCap className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.completedLessons || 0}</div>
              <p className="text-xs text-muted-foreground">{t('dashboard.lessonsFinished')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.wordsLearned')}</CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.wordsLearned || 0}</div>
              <p className="text-xs text-muted-foreground">{t('dashboard.vocabularyMastered')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="courses" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>{t('dashboard.myCourses')}</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{t('dashboard.schedule')}</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>{t('dashboard.profile')}</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>{t('dashboard.progress')}</span>
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
                  <CardTitle>{t('dashboard.learningProgress')}</CardTitle>
                  <CardDescription>
                    {t('dashboard.trackJourney')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{t('dashboard.currentLevel')}</span>
                        <Badge variant="secondary">
                          {userStats?.level ? t(`dashboard.${userStats.level}`) : t('dashboard.beginner')}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{t('dashboard.studyTime')}</span>
                          <span>{Math.floor((userStats?.studyTime || 0) / 60)}h {(userStats?.studyTime || 0) % 60}m</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{t('dashboard.accuracyRate')}</span>
                          <span>--% ({t('dashboard.comingSoon')})</span>
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