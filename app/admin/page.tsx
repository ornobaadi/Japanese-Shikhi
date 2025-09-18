'use client';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { courseStorage } from '@/lib/courseStorage'

export default function AdminDashboard() {
  const router = useRouter()
  const [courseStats, setCourseStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    coursesByLevel: {} as Record<string, number>,
  })
  const [recentCourses, setRecentCourses] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = () => {
    try {
      const stats = courseStorage.getCourseStats()
      const allCourses = courseStorage.getAllCourses()
      const recent = allCourses
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
      
      setCourseStats(stats)
      setRecentCourses(recent)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your app metrics</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Courses</CardTitle>
            <CardDescription>All time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{courseStats.totalCourses}</div>
            <div className="text-sm text-muted-foreground">
              {courseStats.activeCourses} active
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Students</CardTitle>
            <CardDescription>Enrolled across all courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{courseStats.totalStudents}</div>
            <div className="text-sm text-muted-foreground">
              {courseStats.totalStudents > 0 ? 
                `Avg ${Math.round(courseStats.totalStudents / (courseStats.totalCourses || 1))} per course` : 
                'No enrollments yet'
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>From all course sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{formatCurrency(courseStats.totalRevenue)}</div>
            <div className="text-sm text-muted-foreground">
              {courseStats.totalStudents > 0 ? 
                `Avg ${formatCurrency(courseStats.totalRevenue / courseStats.totalStudents)} per student` : 
                'No revenue yet'
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Course Levels</CardTitle>
            <CardDescription>Distribution by JLPT level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {Object.entries(courseStats.coursesByLevel).length > 0 ? (
                Object.entries(courseStats.coursesByLevel).map(([level, count]) => (
                  <div key={level} className="flex justify-between text-sm">
                    <span>{level}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No courses yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Courses</CardTitle>
                <CardDescription>Recently created courses</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/admin/courses')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentCourses.length > 0 ? (
              <ul className="space-y-3">
                {recentCourses.map((course) => (
                  <li key={course.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{course.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {course.level} • {course.lessons.length} lessons • {course.enrolledStudents} students
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(course.createdAt)}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No courses created yet</p>
                <Button onClick={() => router.push('/admin/add-course')}>
                  Create Your First Course
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push('/admin/add-course')}
              >
                ➕ Add New Course
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push('/admin/courses')}
              >
                📚 Manage All Courses
              </Button>
              {courseStats.totalCourses > 0 && (
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => {
                    const allCourses = courseStorage.getAllCourses()
                    const latestCourse = allCourses.sort((a, b) => 
                      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    )[0]
                    if (latestCourse) {
                      router.push(`/admin/courses/${latestCourse.id}/curriculum`)
                    }
                  }}
                >
                  ✏️ Edit Latest Course Curriculum
                </Button>
              )}
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all course data? This cannot be undone.')) {
                    courseStorage.clearAllCourses()
                    loadDashboardData()
                  }
                }}
              >
                🗑️ Clear All Data (Dev)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
