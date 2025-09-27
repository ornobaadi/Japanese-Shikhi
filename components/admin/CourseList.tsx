'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IconSearch, IconEdit, IconTrash, IconEye, IconLoader2, IconPlus } from '@tabler/icons-react';
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
  courses: Course[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCourses: number;
    limit: number;
  };
  stats: {
    total: number;
    published: number;
    draft: number;
  };
}

export default function CourseList() {
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

      const response = await fetch(`/api/admin/courses?${params}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setCourses(data.courses);
      setPagination(data.pagination);
      setStats(data.stats);
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
          <CardTitle className="text-lg">{t('admin.filterSearch')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">{t('admin.searchCourses')}</Label>
              <div className="relative">
                <IconSearch className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder={t('admin.searchPlaceholder')}
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>{t('admin.status')}</Label>
              <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-40">
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
              <Label>{t('admin.level')}</Label>
              <Select value={levelFilter} onValueChange={(value) => handleFilterChange('level', value)}>
                <SelectTrigger className="w-32">
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
              <Label>{t('admin.category')}</Label>
              <Select value={categoryFilter} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger className="w-40">
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('admin.yourCourses')}</CardTitle>
            <CardDescription>
              {t('admin.showingCourses')} {courses.length} {t('admin.ofCourses')} {pagination.totalCourses} {t('admin.coursesText')}
            </CardDescription>
          </div>
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
            <div className="space-y-4">
              {courses.map((course) => (
                <Card key={course._id} className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        {course.thumbnailUrl && (
                          <img
                            src={course.thumbnailUrl}
                            alt={course.title}
                            className="w-16 h-16 rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{course.title}</h3>
                            {course.isPremium && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                {t('admin.premium')}
                              </Badge>
                            )}
                            <Badge
                              variant="secondary"
                              className={course.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                            >
                              {course.isPublished ? t('admin.published') : t('admin.draft')}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                            {course.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge className={getLevelColor(course.level)}>
                              {translateLevel(course.level)}
                            </Badge>
                            <Badge className={getCategoryColor(course.category)}>
                              {translateCategory(course.category)}
                            </Badge>
                            <Badge variant="outline">
                              {formatDuration(course.estimatedDuration)}
                            </Badge>
                            <Badge variant="outline">
                              {t('admin.difficulty')}: {course.difficulty}/10
                            </Badge>
                            {course.totalRatings > 0 && (
                              <Badge variant="outline">
                                ⭐ {course.averageRating.toFixed(1)} ({course.totalRatings})
                              </Badge>
                            )}
                            <Badge variant="outline">
                              {course.enrolledStudents} {t('admin.studentsCount')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin-dashboard/courses/${course._id}`}>
                          <IconEye className="size-4 mr-1" />
                          {t('admin.view')}
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin-dashboard/courses/edit/${course._id}`}>
                          <IconEdit className="size-4 mr-1" />
                          {t('admin.edit')}
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
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
                        <IconTrash className="size-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage <= 1}
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
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