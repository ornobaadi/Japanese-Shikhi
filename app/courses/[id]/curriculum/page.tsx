"use client";

import React from 'react';
import { Navbar5 } from '@/components/navbar-5';
import CurriculumViewer from '@/components/CurriculumViewer';

export default function CourseCurriculumPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar5 />
      <CurriculumViewer />
    </div>
  );
}
      try {
        const courseId = params?.id;
        if (!courseId) {
          setError('Course ID not found');
          setLoading(false);
          return;
        }
        
        const res = await fetch(`/api/courses/${courseId}`);
        const data = await res.json();
        
        if (data.success) {
          setCourse(data.data);
        } else {
          setError(data.error || 'Course not found');
        }
      } catch (error) {
        console.error('Failed to fetch course:', error);
        setError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchCourse();
    }
  }, [params?.id]);

  const handleEnrollClick = () => {
    if (!course) return;
    
    if (isSignedIn) {
      router.push(`/payment/${course._id}`);
    } else {
      localStorage.setItem('pendingCourseEnrollment', course._id);
      router.push('/sign-in');
    }
  };

  const getDaysLeft = (deadline?: string) => {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getLevelColor = (level: string) => {
    return 'bg-secondary text-secondary-foreground';
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayCircle className="w-4 h-4" />;
      case 'quiz': return <Target className="w-4 h-4" />;
      case 'exercise': return <Award className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-24" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full mb-6" />
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-20 w-full mb-6" />
              <Skeleton className="h-40 w-full" />
            </div>
            <div>
              <Skeleton className="h-80 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">Course Not Found</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => router.push('/courses')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const daysLeft = getDaysLeft(course.enrollmentDeadline);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar5 />
      
      {/* Top spacing for floating navbar */}
      <div className="h-24" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          onClick={() => router.push('/courses')} 
          variant="ghost" 
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <Card className="p-8 mb-6">
              {course.thumbnailUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-lg mb-6">
                  <img 
                    src={course.thumbnailUrl} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    {course.level}
                  </Badge>
                  <Badge variant="outline">{course.category}</Badge>
                  {course.isPremium && (
                    <Badge variant="outline">
                      Premium
                    </Badge>
                  )}
                </div>
                
                {course.averageRating > 0 && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                    <span>{course.averageRating.toFixed(1)} ({course.totalRatings} reviews)</span>
                  </div>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {course.title}
              </h1>
              
              {course.titleJp ? (
                <h2 className="text-xl text-muted-foreground mb-4 font-japanese">
                  {course.titleJp}
                </h2>
              ) : (
                <div className="text-xl text-muted-foreground mb-4">-</div>
              )}
              
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {course.description || '-'}
              </p>
              
              {course.descriptionJp ? (
                <p className="text-muted-foreground mb-6 font-japanese leading-relaxed">
                  {course.descriptionJp}
                </p>
              ) : (
                <p className="text-muted-foreground mb-6">-</p>
              )}

              {/* Course Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{course.enrolledStudents || 0}</div>
                  <div className="text-sm text-muted-foreground">Students</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{course.formattedDuration || '-'}</div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <BookOpen className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{course.totalLessons || 0}</div>
                  <div className="text-sm text-muted-foreground">Lessons</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{course.difficultyLabel || '-'}</div>
                  <div className="text-sm text-muted-foreground">Difficulty</div>
                </div>
              </div>
            </Card>

            {/* Learning Objectives */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-muted-foreground" />
                  What You'll Learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                {course.learningObjectives && course.learningObjectives.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-3">
                    {course.learningObjectives.map((objective, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{objective}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground italic">No learning objectives specified</div>
                )}
              </CardContent>
            </Card>

            {/* Prerequisites */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-muted-foreground" />
                  Prerequisites
                </CardTitle>
              </CardHeader>
              <CardContent>
                {course.prerequisites && course.prerequisites.length > 0 ? (
                  <ul className="space-y-2">
                    {course.prerequisites.map((prerequisite, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0" />
                        <span className="text-muted-foreground">{prerequisite}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-muted-foreground italic">No prerequisites required</div>
                )}
              </CardContent>
            </Card>

            {/* Course Curriculum */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-muted-foreground" />
                  Course Curriculum
                </CardTitle>
              </CardHeader>
              <CardContent>
                {course.lessons && course.lessons.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {course.lessons.map((lesson, index) => (
                      <AccordionItem key={lesson._id} value={`lesson-${index}`}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-center justify-between w-full mr-4">
                            <div className="flex items-center">
                              {getLessonIcon(lesson.type)}
                              <span className="ml-3 font-medium">
                                Lesson {index + 1}: {lesson.title}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="w-3 h-3 mr-1" />
                              {lesson.estimatedDuration ? `${Math.floor(lesson.estimatedDuration / 60)}h ${lesson.estimatedDuration % 60}m` : '-'}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-7 pt-2 text-muted-foreground">
                            This {lesson.type || 'lesson'} covers important concepts and will take approximately {lesson.estimatedDuration || 'N/A'} minutes to complete.
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-muted-foreground">Curriculum details will be available soon.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-32">
              <CardContent className="p-6">
                {/* Pricing */}
                {(
                  (course as any).actualPrice || (course as any).discountedPrice
                ) && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Price</span>
                    </div>
                    {course.discountedPrice && course.actualPrice ? (
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-foreground">
                          {`৳${course.discountedPrice}`}
                        </span>
                        <span className="text-lg text-muted-foreground line-through">
                          {`৳${course.actualPrice}`}
                        </span>
                        <Badge variant="destructive" className="text-xs">
                          {Math.round((1 - course.discountedPrice / course.actualPrice) * 100)}% OFF
                        </Badge>
                      </div>
                    ) : (
                      <div className="text-3xl font-bold text-foreground">
                        {`৳${course.actualPrice ?? course.discountedPrice ?? 999}`}
                      </div>
                    )}
                  </div>
                )}

                {/* Enrollment Deadline */}
                {daysLeft !== null && (
                  <div className="mb-6 p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex items-center text-orange-800 dark:text-orange-200">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="font-medium">
                        {daysLeft > 0 ? `${daysLeft} days left to enroll` : 'Enrollment closing soon!'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Enroll Button */}
                <Button 
                  onClick={handleEnrollClick}
                  className="w-full text-lg py-6 mb-4"
                  size="lg"
                >
                  Enroll Now
                </Button>

                {/* Course Tags */}
                {course.tags && course.tags.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium text-foreground mb-3">Course Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {course.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                <div className="pt-4 border-t mt-4">
                  <h4 className="text-sm font-medium text-foreground mb-3">Languages</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>Primary: {course.courseLanguage?.primary || '-'}</div>
                    <div>Secondary: {course.courseLanguage?.secondary || '-'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}