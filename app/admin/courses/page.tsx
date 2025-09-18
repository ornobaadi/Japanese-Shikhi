'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { courseStorage, Course } from '@/lib/courseStorage';

export default function AllCourses() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'level' | 'price' | 'students' | 'created'>('created');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = () => {
    setIsLoading(true);
    try {
      const allCourses = courseStorage.getAllCourses();
      setCourses(allCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        courseStorage.deleteCourse(courseId);
        loadCourses(); // Reload courses after deletion
      } catch (error) {
        console.error('Error deleting course:', error);
        alert('Failed to delete course. Please try again.');
      }
    }
  };

  const toggleCourseStatus = (courseId: string, currentStatus: boolean) => {
    try {
      courseStorage.updateCourse(courseId, { isActive: !currentStatus });
      loadCourses(); // Reload courses after status change
    } catch (error) {
      console.error('Error updating course status:', error);
      alert('Failed to update course status. Please try again.');
    }
  };

  // Filter courses
  const filteredCourses = courses.filter(course => {
    if (filter === 'active') return course.isActive;
    if (filter === 'inactive') return !course.isActive;
    return true;
  });

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'level':
        const levelOrder = ['N5', 'N4', 'N3', 'N2', 'N1', 'Beginner', 'Intermediate', 'Advanced'];
        return levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level);
      case 'price':
        return a.price - b.price;
      case 'students':
        return b.enrolledStudents - a.enrolledStudents;
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free';
    const symbols = { USD: '$', EUR: '€', JPY: '¥', GBP: '£' };
    return `${symbols[currency as keyof typeof symbols] || currency} ${price.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLevelColor = (level: string) => {
    const colors = {
      'N5': 'bg-green-100 text-green-800',
      'N4': 'bg-blue-100 text-blue-800',
      'N3': 'bg-yellow-100 text-yellow-800',
      'N2': 'bg-orange-100 text-orange-800',
      'N1': 'bg-red-100 text-red-800',
      'Beginner': 'bg-green-100 text-green-800',
      'Intermediate': 'bg-yellow-100 text-yellow-800',
      'Advanced': 'bg-red-100 text-red-800',
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">All Courses</h1>
          <p className="text-sm text-muted-foreground">Loading courses...</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">All Courses</h1>
          <p className="text-sm text-muted-foreground">
            Manage your Japanese language courses ({courses.length} total)
          </p>
        </div>
        <Button onClick={() => router.push('/admin/add-course')}>
          Add New Course
        </Button>
      </div>

      {/* Filters and Sorting */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({courses.length})
              </Button>
              <Button
                variant={filter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('active')}
              >
                Active ({courses.filter(c => c.isActive).length})
              </Button>
              <Button
                variant={filter === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('inactive')}
              >
                Inactive ({courses.filter(c => !c.isActive).length})
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created">Created Date</option>
                <option value="name">Name</option>
                <option value="level">Level</option>
                <option value="price">Price</option>
                <option value="students">Students</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      {sortedCourses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="space-y-3">
              <p className="text-lg font-medium">No courses found</p>
              <p className="text-muted-foreground">
                {filter === 'all' 
                  ? "You haven't created any courses yet."
                  : `No ${filter} courses found.`
                }
              </p>
              <Button onClick={() => router.push('/admin/add-course')}>
                Create Your First Course
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedCourses.map((course) => (
            <Card key={course.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                  <Badge className={getLevelColor(course.level)}>
                    {course.level}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">{formatPrice(course.price, course.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Students:</span>
                    <span>{course.enrolledStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lessons:</span>
                    <span>{course.lessons.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={course.isActive ? 'default' : 'secondary'}>
                      {course.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{formatDate(course.createdAt)}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push(`/admin/courses/${course.id}/curriculum`)}
                  >
                    View Curriculum ({course.lessons.length} lessons)
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => toggleCourseStatus(course.id, course.isActive)}
                    >
                      {course.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteCourse(course.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}