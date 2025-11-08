"use client";

import React from "react";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useLanguage } from '@/contexts/LanguageContext'

export function SectionCards() {
  const { t } = useLanguage();
  const [stats, setStats] = React.useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    courseCompletion: 0,
    pendingEnrollments: 0,
    loading: true
  });

  React.useEffect(() => {
    async function fetchStats() {
      try {
        const courseRes = await fetch('/api/admin/courses');
        const userRes = await fetch('/api/admin/users');
        const enrollmentRes = await fetch('/api/admin/enrollments?status=pending');
        
        let totalCourses = 0;
        let totalStudents = 0;
        let totalRevenue = 0;
        let courseCompletion = 0;
        let pendingEnrollments = 0;
        
        if (courseRes.ok) {
          const courseJson = await courseRes.json();
          totalCourses = courseJson.stats?.total || courseJson.pagination?.totalCourses || 0;
          courseCompletion = courseJson.stats?.completion || 0;
        }
        if (userRes.ok) {
          const userJson = await userRes.json();
          totalStudents = userJson.total || userJson.totalUsers || 0;
        }
        if (enrollmentRes.ok) {
          const enrollmentJson = await enrollmentRes.json();
          pendingEnrollments = enrollmentJson.count || 0;
        }
        
        setStats({
          totalCourses,
          totalStudents,
          totalRevenue,
          courseCompletion,
          pendingEnrollments,
          loading: false
        });
      } catch (err) {
        setStats(s => ({ ...s, loading: false }));
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t('admin.totalCourses')}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.loading ? '...' : stats.totalCourses}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            {stats.loading ? t('common.loading') : (stats.totalCourses === 0 ? t('admin.noCoursesCreated') : `${stats.totalCourses} ${t('admin.coursesCreated')}`)}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t('admin.totalStudents')}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.loading ? '...' : stats.totalStudents}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            {stats.loading ? t('common.loading') : (stats.totalStudents === 0 ? t('admin.noEnrollments') : `${stats.totalStudents} ${t('admin.studentsEnrolled')}`)}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t('admin.totalRevenue')}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.loading ? '...' : `৳${stats.totalRevenue.toFixed(2)}`}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">{stats.loading ? t('common.loading') : (stats.totalRevenue === 0 ? t('admin.noRevenue') : `Revenue: ৳${stats.totalRevenue.toFixed(2)}`)}</div>
        </CardFooter>
      </Card>
      <Card className="@container/card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = '/admin-dashboard/enrollments'}>
        <CardHeader>
          <CardDescription>Pending Enrollments</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.loading ? '...' : stats.pendingEnrollments}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">{stats.loading ? 'Loading...' : (stats.pendingEnrollments === 0 ? 'No pending requests' : 'Awaiting admin approval')}</div>
        </CardFooter>
      </Card>
    </div>
  )
}
