'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IconSearch, IconEdit, IconTrash, IconEye, IconLoader2, IconPlus, IconRefresh } from '@tabler/icons-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

interface Course {
  _id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  difficulty: number;
  isPremium: boolean;
  isPublished: boolean;
  createdAt: string;
  enrolledStudents: number;
  averageRating: number;
  totalRatings: number;
  estimatedDuration: number;
  thumbnailUrl?: string;
}

interface CourseListProps {
  refreshTrigger?: number;
}

export default function CourseList({ refreshTrigger }: CourseListProps) {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCourses: 0,
    limit: 10
  });
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.limit.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(levelFilter !== 'all' && { level: levelFilter }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
      });

      console.log('Fetching courses with params:', params.toString());
      const response = await fetch(`/api/admin/courses?${params}`);

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error('API Error Response:', errorData);
        console.error('Full error details:', { status: response.status, url: response.url, errorData });
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Fetched courses data:', data);
      
      if (!data.courses) {
        console.warn('No courses array in response:', data);
        setCourses([]);
      } else {
        console.log('Setting courses:', data.courses.length, 'courses found');
        console.log('Courses data:', JSON.stringify(data.courses, null, 2));
        setCourses(data.courses);
      }
      
      // Temporary: Also set some test courses for debugging
      if (data.courses && data.courses.length === 0) {
        console.log('No courses found, adding test course for debugging');
        setCourses([{
          _id: 'test-course-1',
          title: 'Test Course (From Debug)',
          description: 'This is a test course to verify the UI is working',
          level: 'beginner',
          category: 'grammar',
          difficulty: 1,
          isPremium: false,
          isPublished: true,
          createdAt: new Date().toISOString(),
          enrolledStudents: 5,
          averageRating: 4.5,
          totalRatings: 10,
          estimatedDuration: 30
        }]);
      }
      
      if (data.pagination) {
        setPagination(data.pagination);
      }
      
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast.error(error.message || 'Failed to fetch courses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [pagination.currentPage, searchQuery, statusFilter, levelFilter, categoryFilter]);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      fetchCourses();
    }
  }, [refreshTrigger]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleFilterChange = (type: string, value: string) => {
    switch (type) {
      case 'status':
        setStatusFilter(value);
        break;
      case 'level':
        setLevelFilter(value);
        break;
      case 'category':
        setCategoryFilter(value);
        break;
    }
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const translateLevel = (level: string) => {
    switch (level) {
      case 'beginner': return t('courses.beginner');
      case 'intermediate': return t('courses.intermediate');
      case 'advanced': return t('courses.advanced');
      default: return level;
    }
  };

  const translateCategory = (category: string) => {
    switch (category) {
      case 'vocabulary': return t('admin.vocabulary');
      case 'grammar': return t('admin.grammar');
      case 'kanji': return t('admin.kanji');
      case 'conversation': return t('admin.conversation');
      case 'culture': return t('admin.culture');
      case 'reading': return t('admin.reading');
      case 'writing': return t('admin.writing');
      default: return category;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      vocabulary: 'bg-blue-100 text-blue-800',
      grammar: 'bg-purple-100 text-purple-800',
      kanji: 'bg-pink-100 text-pink-800',
      conversation: 'bg-teal-100 text-teal-800',
      reading: 'bg-orange-100 text-orange-800',
      writing: 'bg-indigo-100 text-indigo-800',
      culture: 'bg-rose-100 text-rose-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <IconLoader2 className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">{t('admin.filterSearch')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm md:text-base">{t('admin.searchCourses')}</Label>
              <div className="relative">
                <IconSearch className="absolute left-2 md:left-3 top-2.5 md:top-3 size-3 md:size-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder={t('admin.searchPlaceholder')}
                  className="pl-8 md:pl-10 text-sm md:text-base h-9 md:h-10"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label className="text-sm md:text-base">{t('admin.status')}</Label>
              <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-full md:w-40 h-9 md:h-10 text-sm md:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin.allStatus')}</SelectItem>
                  <SelectItem value="published">{t('admin.published')}</SelectItem>
                  <SelectItem value="draft">{t('admin.draft')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm md:text-base">{t('admin.level')}</Label>
              <Select value={levelFilter} onValueChange={(value) => handleFilterChange('level', value)}>
                <SelectTrigger className="w-full md:w-32 h-9 md:h-10 text-sm md:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin.allLevels')}</SelectItem>
                  <SelectItem value="beginner">{t('courses.beginner')}</SelectItem>
                  <SelectItem value="intermediate">{t('courses.intermediate')}</SelectItem>
                  <SelectItem value="advanced">{t('courses.advanced')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm md:text-base">{t('admin.category')}</Label>
              <Select value={categoryFilter} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger className="w-full md:w-40 h-9 md:h-10 text-sm md:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin.allCategories')}</SelectItem>
                  <SelectItem value="vocabulary">{t('admin.vocabulary')}</SelectItem>
                  <SelectItem value="grammar">{t('admin.grammar')}</SelectItem>
                  <SelectItem value="kanji">{t('admin.kanji')}</SelectItem>
                  <SelectItem value="conversation">{t('admin.conversation')}</SelectItem>
                  <SelectItem value="culture">{t('admin.culture')}</SelectItem>
                  <SelectItem value="reading">{t('admin.reading')}</SelectItem>
                  <SelectItem value="writing">{t('admin.writing')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses List */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg md:text-xl">{t('admin.yourCourses')}</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {t('admin.showingCourses')} {courses.length} {t('admin.ofCourses')} {pagination.totalCourses} {t('admin.coursesText')}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchCourses()}
            disabled={isLoading}
            className="gap-1.5 md:gap-2 text-sm"
          >
            {isLoading ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <IconRefresh className="size-4" />
            )}
            Refresh
          </Button>
          <Button asChild>
            <Link href="/admin-dashboard/courses/add">
              <IconPlus className="size-4 mr-2" />
              {t('admin.addCourse')}
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {t('admin.noCourses')}
              </div>
              <Button asChild>
                <Link href="/admin-dashboard/courses/add">
                  <IconPlus className="size-4 mr-2" />
                  {t('admin.createFirstCourse')}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {courses.map((course) => (
                <Card key={course._id} className="p-3 md:p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 md:gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-2 md:gap-3">
                        {course.thumbnailUrl && (
                          <img
                            src={course.thumbnailUrl}
                            alt={course.title}
                            className="w-12 h-12 md:w-16 md:h-16 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-2">
                            <h3 className="font-semibold text-base md:text-lg">{course.title}</h3>
                            {course.isPremium && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                                {t('admin.premium')}
                              </Badge>
                            )}
                            <Badge
                              variant="secondary"
                              className={`text-xs ${course.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                            >
                              {course.isPublished ? t('admin.published') : t('admin.draft')}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-xs md:text-sm mb-2 md:mb-3 line-clamp-2">
                            {course.description}
                          </p>
                          <div className="flex flex-wrap gap-1.5 md:gap-2">
                            <Badge className={`${getLevelColor(course.level)} text-xs`}>
                              {translateLevel(course.level)}
                            </Badge>
                            <Badge className={`${getCategoryColor(course.category)} text-xs`}>
                              {translateCategory(course.category)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {formatDuration(course.estimatedDuration)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {t('admin.difficulty')}: {course.difficulty}/10
                            </Badge>
                            {course.totalRatings > 0 && (
                              <Badge variant="outline" className="text-xs">
                                ⭐ {course.averageRating.toFixed(1)} ({course.totalRatings})
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {course.enrolledStudents} {t('admin.studentsCount')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline" size="sm" className="text-xs md:text-sm">
                        <Link href={`/admin-dashboard/courses/${course._id}`}>
                          <IconEye className="size-3 md:size-4 mr-1" />
                          {t('admin.view')}
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 text-xs md:text-sm"
                        onClick={async () => {
                          if (confirm(`${t('admin.deleteConfirm')} "${course.title}"?`)) {
                            try {
                              const res = await fetch(`/api/admin/courses/${course._id}`, { method: 'DELETE' });
                              if (res.ok) {
                                toast.success(t('admin.courseDeleted'));
                                setCourses(prev => prev.filter(c => c._id !== course._id));
                              } else {
                                const err = await res.json().catch(() => ({}));
                                toast.error(err.error || t('admin.failedToDelete'));
                              }
                            } catch (err) {
                              toast.error(t('admin.failedToDelete'));
                            }
                          }
                        }}
                      >
                        <IconTrash className="size-3 md:size-4 mr-1" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 md:mt-6">
              <div className="text-xs md:text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs md:text-sm"
                  disabled={pagination.currentPage <= 1}
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs md:text-sm"
                  disabled={pagination.currentPage >= pagination.totalPages}
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}