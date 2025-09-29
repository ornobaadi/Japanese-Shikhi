'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IconDeviceFloppy, IconLoader2, IconSettings } from '@tabler/icons-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface CourseFormData {
  title: string;
  description: string;
  level: string;
  category: string;
  estimatedDuration: string;
  difficulty: string;
  isPremium: boolean;
  isPublished: boolean;
  learningObjectives: string[];
  links: string[];
  thumbnailUrl: string;
  instructorNotes: string;
  whatYoullLearn: string;
  courseLessonModule: string;
  actualPrice: string;
  discountedPrice: string;
  enrollmentLastDate: string;
  classModules: ClassModule[];
  classLinks: ClassLink[];
  youtubeResources: Resource[];
  enrolledStudents: EnrolledStudent[];
  weeklyContent: WeeklyContent[];
  blogPosts: BlogPost[];
}

interface WeeklyContent {
  id: string;
  week: number;
  videoLinks: VideoLink[];
  documents: DocumentFile[];
  comments: string;
}

interface VideoLink {
  id: string;
  title: string;
  url: string;
  description: string;
}

interface DocumentFile {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileType: 'pdf' | 'doc' | 'docx' | 'other';
}

interface ClassModule {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface ClassLink {
  id: string;
  title: string;
  meetingUrl: string;
  schedule: string;
  description: string;
}

interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'youtube' | 'document' | 'website';
  description: string;
}

interface EnrolledStudent {
  id: string;
  name: string;
  email: string;
  enrollmentDate: string;
  progress: number;
  status: 'active' | 'inactive';
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishDate: string;
  tags: string[];
  isPublished: boolean;
  featuredImage: string;
}

export default function CourseForm() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const [activeWeekTab, setActiveWeekTab] = useState(1);
  const [activeCourseIndex, setActiveCourseIndex] = useState(0);

  // Initial course data template
  const getInitialCourseData = (): CourseFormData => ({
    title: '',
    description: '',
    level: '',
    category: '',
    estimatedDuration: '',
    difficulty: '5',
    isPremium: false,
    isPublished: false,
    learningObjectives: [''],
    links: [''],
    thumbnailUrl: '',
    instructorNotes: '',
    whatYoullLearn: '',
    courseLessonModule: '',
    actualPrice: '',
    discountedPrice: '',
    enrollmentLastDate: '',
    classModules: [],
    classLinks: [],
    youtubeResources: [],
    enrolledStudents: [],
    weeklyContent: [
      { id: '1', week: 1, videoLinks: [], documents: [], comments: '' },
      { id: '2', week: 2, videoLinks: [], documents: [], comments: '' },
      { id: '3', week: 3, videoLinks: [], documents: [], comments: '' },
      { id: '4', week: 4, videoLinks: [], documents: [], comments: '' }
    ],
    blogPosts: []
  });

  const [courses, setCourses] = useState<CourseFormData[]>([getInitialCourseData()]);
  const [formData, setFormData] = useState<CourseFormData>(getInitialCourseData());

  const handleInputChange = (field: keyof CourseFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Also update the active course in courses array
    setCourses(prevCourses => {
      const newCourses = [...prevCourses];
      newCourses[activeCourseIndex] = {
        ...newCourses[activeCourseIndex],
        [field]: value
      };
      return newCourses;
    });
  };

  const addNewCourse = () => {
    const newCourse = getInitialCourseData();
    setCourses(prev => [...prev, newCourse]);
    setActiveCourseIndex(courses.length);
    setFormData(newCourse);
  };

  const switchToCourse = (index: number) => {
    setActiveCourseIndex(index);
    setFormData(courses[index]);
  };

  const removeCourse = (index: number) => {
    if (courses.length > 1) {
      const newCourses = courses.filter((_, i) => i !== index);
      setCourses(newCourses);

      // Adjust active course index
      if (index === activeCourseIndex) {
        const newActiveIndex = index > 0 ? index - 1 : 0;
        setActiveCourseIndex(newActiveIndex);
        setFormData(newCourses[newActiveIndex]);
      } else if (index < activeCourseIndex) {
        setActiveCourseIndex(activeCourseIndex - 1);
      }
    }
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...formData.learningObjectives];
    newObjectives[index] = value;
    setFormData(prev => ({
      ...prev,
      learningObjectives: newObjectives
    }));
  };

  const addObjective = () => {
    if (formData.learningObjectives.length < 10) {
      setFormData(prev => ({
        ...prev,
        learningObjectives: [...prev.learningObjectives, '']
      }));
    }
  };

  const removeObjective = (index: number) => {
    if (formData.learningObjectives.length > 1) {
      const newObjectives = formData.learningObjectives.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        learningObjectives: newObjectives
      }));
    }
  };

  // Helper functions for Links
  const addLink = () => {
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, '']
    }));
  };

  const removeLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  const updateLink = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.map((link, i) => i === index ? value : link)
    }));
  };

  const handleSubmit = async (publishImmediately: boolean = false) => {
    setIsLoading(true);

    try {
      // Validate all courses
      for (let i = 0; i < courses.length; i++) {
        const course = courses[i];

        if (!course.title.trim()) {
          toast.error(`Course ${i + 1}: Title is required`);
          setActiveCourseIndex(i);
          setFormData(course);
          return;
        }

        if (!course.description.trim()) {
          toast.error(`Course ${i + 1}: Description is required`);
          setActiveCourseIndex(i);
          setFormData(course);
          return;
        }

        if (!course.level) {
          toast.error(`Course ${i + 1}: Level is required`);
          setActiveCourseIndex(i);
          setFormData(course);
          return;
        }

        if (!course.category) {
          toast.error(`Course ${i + 1}: Category is required`);
          setActiveCourseIndex(i);
          setFormData(course);
          return;
        }

        if (!course.estimatedDuration || parseInt(course.estimatedDuration) <= 0) {
          toast.error(`Course ${i + 1}: Valid estimated duration is required`);
          setActiveCourseIndex(i);
          setFormData(course);
          return;
        }

        const validObjectives = course.learningObjectives.filter((obj: string) => obj.trim());
        if (validObjectives.length === 0) {
          toast.error(`Course ${i + 1}: At least one learning objective is required`);
          setActiveCourseIndex(i);
          setFormData(course);
          return;
        }
      }

      // Submit all courses
      const submissions = courses.map(async (course, index) => {
        const validObjectives = course.learningObjectives.filter((obj: string) => obj.trim());

        const courseData = {
          ...course,
          isPublished: publishImmediately,
          learningObjectives: validObjectives,
          links: course.links.filter((link: string) => link.trim()),
          estimatedDuration: parseInt(course.estimatedDuration),
          difficulty: parseInt(course.difficulty)
        };

        console.log(`Submitting Course ${index + 1}:`, courseData);

        // Here you would make the API call for each course
        const response = await fetch('/api/admin/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(courseData),
        });

        const result = await response.json();

        if (!response.ok) {
          if (result.details && Array.isArray(result.details)) {
            // Handle validation errors
            throw new Error(`Course ${index + 1} - Validation failed: ${result.details.join(', ')}`);
          }
          throw new Error(result.error || `Course ${index + 1} - HTTP ${response.status}: ${response.statusText}`);
        }

        return result;
      });

      await Promise.all(submissions);

      // Save published blogs to localStorage for the blog page
      const allBlogs = courses.flatMap(course =>
        (course.blogPosts || []).map(blog => ({
          ...blog,
          courseName: course.title || 'Untitled Course'
        }))
      );

      if (allBlogs.length > 0) {
        try {
          const existingBlogs = JSON.parse(localStorage.getItem('publishedBlogs') || '[]');

          // Filter out existing blogs to prevent duplicates
          const existingIds = existingBlogs.map((blog: any) => blog.id);
          const newBlogs = allBlogs.filter(blog => !existingIds.includes(blog.id));

          const updatedBlogs = [...existingBlogs, ...newBlogs];
          localStorage.setItem('publishedBlogs', JSON.stringify(updatedBlogs));

          const publishedCount = allBlogs.filter(blog => blog.isPublished).length;
          if (publishedCount > 0) {
            toast.success(`${publishedCount} blog post${publishedCount > 1 ? 's' : ''} published to the blog page!`);
          }
        } catch (error) {
          console.error('Error saving blogs:', error);
          toast.error('Failed to save blogs to blog page');
        }
      }

      toast.success(`Successfully ${publishImmediately ? 'published' : 'saved'} ${courses.length} course${courses.length > 1 ? 's' : ''}!`);

      // Reset to single course after successful submission
      const newCourse = getInitialCourseData();
      setCourses([newCourse]);
      setFormData(newCourse);
      setActiveCourseIndex(0);
      setShowAdvancedModal(false);

      router.push('/admin-dashboard/courses');
      router.refresh();
    } catch (error: any) {
      console.error('Error submitting courses:', error);
      toast.error(error.message || 'Failed to submit courses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.createCourse')}</CardTitle>
          <CardDescription>
            {t('nav.features') === 'বৈশিষ্ট্যসমূহ'
              ? 'আপনার কোর্স সম্পর্কে মৌলিক বিবরণ'
              : 'Basic details about your course'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">{t('form.title')} *</Label>
              <Input
                id="title"
                placeholder={
                  t('nav.features') === 'বৈশিষ্ট্যসমূহ'
                    ? 'যেমন, Japan101 - হিরাগানা বেসিক'
                    : 'e.g., Japan101 - Hiragana Basics'
                }
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">{t('form.description')} *</Label>
              <Textarea
                id="description"
                placeholder={
                  t('nav.features') === 'বৈশিষ্ট্যসমূহ'
                    ? 'শিক্ষার্থীরা এই কোর্সে কী শিখবে তা বর্ণনা করুন...'
                    : 'Describe what students will learn in this course...'
                }
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="whatYoullLearn">{t('form.whatYoullLearn')}</Label>
              <Textarea
                id="whatYoullLearn"
                placeholder={t('form.whatYoullLearnPlaceholder')}
                value={formData.whatYoullLearn}
                onChange={(e) => handleInputChange('whatYoullLearn', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="courseLessonModule">{t('form.courseLessonModule')}</Label>
              <Textarea
                id="courseLessonModule"
                placeholder={t('form.courseLessonModulePlaceholder')}
                value={formData.courseLessonModule}
                onChange={(e) => handleInputChange('courseLessonModule', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="actualPrice">{t('form.actualPrice')}</Label>
                <Input
                  id="actualPrice"
                  placeholder="BDT99.99"
                  value={formData.actualPrice}
                  onChange={(e) => handleInputChange('actualPrice', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="discountedPrice">{t('form.discountedPrice')}</Label>
                <Input
                  id="discountedPrice"
                  placeholder="BDT 49.99"
                  value={formData.discountedPrice}
                  onChange={(e) => handleInputChange('discountedPrice', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="enrollmentLastDate">{t('form.enrollmentLastDate')}</Label>
              <Input
                id="enrollmentLastDate"
                placeholder={
                  t('nav.features') === 'বৈশিষ্ট্যসমূহ'
                    ? '৩১ ডিসেম্বর, ২০২৫'
                    : 'December 31, 2025'
                }
                value={formData.enrollmentLastDate}
                onChange={(e) => handleInputChange('enrollmentLastDate', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="level">{t('form.level')} *</Label>
                <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'স্তর নির্বাচন করুন' : 'Select level'
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">{t('courses.beginner')}</SelectItem>
                    <SelectItem value="intermediate">{t('courses.intermediate')}</SelectItem>
                    <SelectItem value="advanced">{t('courses.advanced')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">{t('form.category')} *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'বিভাগ নির্বাচন করুন' : 'Select category'
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vocabulary">
                      {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'শব্দভান্ডার' : 'Vocabulary'}
                    </SelectItem>
                    <SelectItem value="grammar">
                      {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'ব্যাকরণ' : 'Grammar'}
                    </SelectItem>
                    <SelectItem value="kanji">
                      {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'কাঞ্জি' : 'Kanji'}
                    </SelectItem>
                    <SelectItem value="conversation">
                      {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'কথোপকথন' : 'Conversation'}
                    </SelectItem>
                    <SelectItem value="reading">
                      {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'পড়া' : 'Reading'}
                    </SelectItem>
                    <SelectItem value="writing">
                      {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'লেখা' : 'Writing'}
                    </SelectItem>
                    <SelectItem value="culture">
                      {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'সংস্কৃতি' : 'Culture'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">{t('form.estimatedDuration')} *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="5"
                  max="600"
                  placeholder="60"
                  value={formData.estimatedDuration}
                  onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="difficulty">{t('form.difficultyLevel')}</Label>
                <Input
                  id="difficulty"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Learning Objectives */}
          <div className="space-y-4">
            <div>
              <Label>{t('form.learningObjectives')} *</Label>
              <p className="text-sm text-muted-foreground mb-3">
                {t('form.learningObjectivesDesc')}
              </p>
              {formData.learningObjectives.map((objective, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    placeholder={`${t('form.learningObjectiveNum')} ${index + 1}`}
                    value={objective}
                    onChange={(e) => handleObjectiveChange(index, e.target.value)}
                    className="flex-1"
                  />
                  {formData.learningObjectives.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeObjective(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              {formData.learningObjectives.length < 10 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addObjective}
                  className="mt-2"
                >
                  {t('form.addObjective')}
                </Button>
              )}
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <div>
              <Label>{t('form.links')}</Label>
              <p className="text-sm text-muted-foreground mb-3">
                {t('form.linksDesc')}
              </p>
              {formData.links.map((link, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    placeholder={`Link ${index + 1}`}
                    value={link}
                    onChange={(e) => updateLink(index, e.target.value)}
                    className="flex-1"
                  />
                  {formData.links.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeLink(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              {formData.links.length < 10 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLink}
                  className="mt-2"
                >
                  {t('form.addLink')}
                </Button>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="thumbnailUrl">{t('form.thumbnailUrlOptional')}</Label>
              <Input
                id="thumbnailUrl"
                type="url"
                placeholder={t('form.thumbnailPlaceholder')}
                value={formData.thumbnailUrl}
                onChange={(e) => handleInputChange('thumbnailUrl', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="instructorNotes">{t('form.instructorNotesOptional')}</Label>
              <Textarea
                id="instructorNotes"
                placeholder={t('form.instructorNotesPlaceholder')}
                rows={3}
                value={formData.instructorNotes}
                onChange={(e) => handleInputChange('instructorNotes', e.target.value)}
              />
            </div>
          </div>

          {/* Advanced Course Management Button */}
          <div className="space-y-4">
            <div className="border-t pt-6">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowAdvancedModal(true)}
              >
                <IconSettings className="size-4 mr-2" />
                Advanced Course Management
              </Button>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Manage class modules, links, resources, and enrolled students
              </p>
            </div>
          </div>

          {/* Advanced Course Management Modal */}
          {showAdvancedModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b">
                  <div>
                    <h2 className="text-2xl font-bold">Advanced Course Management</h2>
                    <p className="text-gray-600">Manage detailed course content and student information</p>
                  </div>
                  <Button variant="outline" onClick={() => setShowAdvancedModal(false)}>
                    ✕
                  </Button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                  {/* Course Management Header */}
                  <div className="space-y-4 border-b pb-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold">Course Management</h2>
                      <Button
                        type="button"
                        onClick={addNewCourse}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        + Add New Course
                      </Button>
                    </div>

                    {/* Course Tabs */}
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {courses.map((course, index) => (
                          <div key={index} className="flex items-center">
                            <button
                              onClick={() => switchToCourse(index)}
                              className={`px-3 py-1 text-sm font-medium rounded-l-lg border transition-colors ${activeCourseIndex === index
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                              Course {index + 1}: {course.title || 'Untitled'}
                            </button>
                            {courses.length > 1 && (
                              <button
                                onClick={() => removeCourse(index)}
                                className={`px-2 py-1 text-sm rounded-r-lg border-l-0 border transition-colors ${activeCourseIndex === index
                                  ? 'bg-red-600 hover:bg-red-700 text-white border-blue-600'
                                  : 'bg-gray-100 hover:bg-red-100 text-red-600 border-gray-300'
                                  }`}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Course Naming Section */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <Label className="text-sm font-medium">Course {activeCourseIndex + 1} Name</Label>
                        <Input
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="e.g., Data Structure 1, Algorithm Basics, etc."
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This will be the display name for Course {activeCourseIndex + 1}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Currently editing: <span className="font-semibold">Course {activeCourseIndex + 1}</span>
                      {courses.length > 1 && <span> ({courses.length} courses total)</span>}
                    </div>
                  </div>

                  {/* Add Courses Section */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Add Courses Content</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Organize your course content by weeks for Course {activeCourseIndex + 1}
                      </p>

                      {/* Week Tabs */}
                      <div className="flex border-b mb-6">
                        {[1, 2, 3, 4].map((week) => (
                          <button
                            key={week}
                            onClick={() => setActiveWeekTab(week)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeWeekTab === week
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                              }`}
                          >
                            Week {week}
                          </button>
                        ))}
                      </div>

                      {/* Week Content */}
                      {formData.weeklyContent.map((weekContent) => (
                        <div key={weekContent.id} className={activeWeekTab === weekContent.week ? 'block' : 'hidden'}>
                          <div className="space-y-6">
                            {/* Video Upload Links Section */}
                            <div className="space-y-4">
                              <h4 className="font-semibold text-md">Video Upload Links</h4>
                              <p className="text-sm text-muted-foreground">
                                Add multiple video links for Week {weekContent.week}
                              </p>

                              {weekContent.videoLinks.map((video, videoIndex) => (
                                <div key={video.id} className="border rounded-lg p-4 space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label>Video Title</Label>
                                      <Input
                                        value={video.title}
                                        onChange={(e) => {
                                          const newWeeklyContent = [...formData.weeklyContent];
                                          const weekIndex = newWeeklyContent.findIndex(w => w.week === weekContent.week);
                                          newWeeklyContent[weekIndex].videoLinks[videoIndex].title = e.target.value;
                                          handleInputChange('weeklyContent', newWeeklyContent);
                                        }}
                                        placeholder="e.g., Hiragana Introduction"
                                      />
                                    </div>
                                    <div>
                                      <Label>Video URL</Label>
                                      <Input
                                        type="url"
                                        value={video.url}
                                        onChange={(e) => {
                                          const newWeeklyContent = [...formData.weeklyContent];
                                          const weekIndex = newWeeklyContent.findIndex(w => w.week === weekContent.week);
                                          newWeeklyContent[weekIndex].videoLinks[videoIndex].url = e.target.value;
                                          handleInputChange('weeklyContent', newWeeklyContent);
                                        }}
                                        placeholder="https://youtube.com/watch?v=... or upload link"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Description</Label>
                                    <Textarea
                                      value={video.description}
                                      onChange={(e) => {
                                        const newWeeklyContent = [...formData.weeklyContent];
                                        const weekIndex = newWeeklyContent.findIndex(w => w.week === weekContent.week);
                                        newWeeklyContent[weekIndex].videoLinks[videoIndex].description = e.target.value;
                                        handleInputChange('weeklyContent', newWeeklyContent);
                                      }}
                                      placeholder="Brief description of the video content..."
                                      rows={2}
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const newWeeklyContent = [...formData.weeklyContent];
                                      const weekIndex = newWeeklyContent.findIndex(w => w.week === weekContent.week);
                                      newWeeklyContent[weekIndex].videoLinks = newWeeklyContent[weekIndex].videoLinks.filter((_, i) => i !== videoIndex);
                                      handleInputChange('weeklyContent', newWeeklyContent);
                                    }}
                                  >
                                    Remove Video
                                  </Button>
                                </div>
                              ))}

                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  const newWeeklyContent = [...formData.weeklyContent];
                                  const weekIndex = newWeeklyContent.findIndex(w => w.week === weekContent.week);
                                  const newVideo: VideoLink = {
                                    id: Date.now().toString(),
                                    title: '',
                                    url: '',
                                    description: ''
                                  };
                                  newWeeklyContent[weekIndex].videoLinks.push(newVideo);
                                  handleInputChange('weeklyContent', newWeeklyContent);
                                }}
                              >
                                Add Video Link
                              </Button>
                            </div>

                            {/* PDF/DOCS Upload Section */}
                            <div className="space-y-4 border-t pt-6">
                              <h4 className="font-semibold text-md">PDF/DOCS Upload</h4>
                              <p className="text-sm text-muted-foreground">
                                Upload multiple documents for Week {weekContent.week}
                              </p>

                              {weekContent.documents.map((doc, docIndex) => (
                                <div key={doc.id} className="border rounded-lg p-4 space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label>Document Title</Label>
                                      <Input
                                        value={doc.title}
                                        onChange={(e) => {
                                          const newWeeklyContent = [...formData.weeklyContent];
                                          const weekIndex = newWeeklyContent.findIndex(w => w.week === weekContent.week);
                                          newWeeklyContent[weekIndex].documents[docIndex].title = e.target.value;
                                          handleInputChange('weeklyContent', newWeeklyContent);
                                        }}
                                        placeholder="e.g., Hiragana Practice Sheet"
                                      />
                                    </div>
                                    <div>
                                      <Label>File Type</Label>
                                      <Select
                                        value={doc.fileType}
                                        onValueChange={(value: 'pdf' | 'doc' | 'docx' | 'other') => {
                                          const newWeeklyContent = [...formData.weeklyContent];
                                          const weekIndex = newWeeklyContent.findIndex(w => w.week === weekContent.week);
                                          newWeeklyContent[weekIndex].documents[docIndex].fileType = value;
                                          handleInputChange('weeklyContent', newWeeklyContent);
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select file type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pdf">PDF</SelectItem>
                                          <SelectItem value="doc">DOC</SelectItem>
                                          <SelectItem value="docx">DOCX</SelectItem>
                                          <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label>File Name</Label>
                                      <Input
                                        value={doc.fileName}
                                        onChange={(e) => {
                                          const newWeeklyContent = [...formData.weeklyContent];
                                          const weekIndex = newWeeklyContent.findIndex(w => w.week === weekContent.week);
                                          newWeeklyContent[weekIndex].documents[docIndex].fileName = e.target.value;
                                          handleInputChange('weeklyContent', newWeeklyContent);
                                        }}
                                        placeholder="filename.pdf"
                                      />
                                    </div>
                                    <div>
                                      <Label>File URL</Label>
                                      <Input
                                        type="url"
                                        value={doc.fileUrl}
                                        onChange={(e) => {
                                          const newWeeklyContent = [...formData.weeklyContent];
                                          const weekIndex = newWeeklyContent.findIndex(w => w.week === weekContent.week);
                                          newWeeklyContent[weekIndex].documents[docIndex].fileUrl = e.target.value;
                                          handleInputChange('weeklyContent', newWeeklyContent);
                                        }}
                                        placeholder="https://example.com/file.pdf or upload URL"
                                      />
                                    </div>
                                  </div>

                                  {/* Upload from PC Section */}
                                  <div className="border-t pt-3 mt-3">
                                    <Label className="text-sm font-medium">Or Upload from PC</Label>
                                    <div className="mt-2 flex gap-2">
                                      <Input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const newWeeklyContent = [...formData.weeklyContent];
                                            const weekIndex = newWeeklyContent.findIndex(w => w.week === weekContent.week);
                                            newWeeklyContent[weekIndex].documents[docIndex].fileName = file.name;
                                            newWeeklyContent[weekIndex].documents[docIndex].fileUrl = `uploading-${file.name}`;
                                            handleInputChange('weeklyContent', newWeeklyContent);
                                            toast.success(`File "${file.name}" ready for upload!`);
                                          }
                                        }}
                                        className="flex-1"
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          toast.info('File upload functionality will be implemented with backend integration');
                                        }}
                                      >
                                        Upload
                                      </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Accepted formats: PDF, DOC, DOCX, TXT, PPT, PPTX (Max: 10MB)
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const newWeeklyContent = [...formData.weeklyContent];
                                      const weekIndex = newWeeklyContent.findIndex(w => w.week === weekContent.week);
                                      newWeeklyContent[weekIndex].documents = newWeeklyContent[weekIndex].documents.filter((_, i) => i !== docIndex);
                                      handleInputChange('weeklyContent', newWeeklyContent);
                                    }}
                                  >
                                    Remove Document
                                  </Button>
                                </div>
                              ))}

                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  const newWeeklyContent = [...formData.weeklyContent];
                                  const weekIndex = newWeeklyContent.findIndex(w => w.week === weekContent.week);
                                  const newDoc: DocumentFile = {
                                    id: Date.now().toString(),
                                    title: '',
                                    fileName: '',
                                    fileUrl: '',
                                    fileType: 'pdf'
                                  };
                                  newWeeklyContent[weekIndex].documents.push(newDoc);
                                  handleInputChange('weeklyContent', newWeeklyContent);
                                }}
                              >
                                Add Document
                              </Button>
                            </div>

                            {/* Comments Section */}
                            <div className="space-y-4 border-t pt-6">
                              <h4 className="font-semibold text-md">Comments</h4>
                              <p className="text-sm text-muted-foreground">
                                Add comments or notes for Week {weekContent.week}
                              </p>

                              <div>
                                <Label>Week {weekContent.week} Comments</Label>
                                <Textarea
                                  value={weekContent.comments}
                                  onChange={(e) => {
                                    const newWeeklyContent = [...formData.weeklyContent];
                                    const weekIndex = newWeeklyContent.findIndex(w => w.week === weekContent.week);
                                    newWeeklyContent[weekIndex].comments = e.target.value;
                                    handleInputChange('weeklyContent', newWeeklyContent);
                                  }}
                                  placeholder="Add your comments, notes, or instructions for this week..."
                                  rows={4}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Class Links Section */}
                  <div className="space-y-4">
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">Class Links</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add meeting links for live classes
                      </p>

                      {formData.classLinks.map((link, index) => (
                        <div key={link.id} className="border rounded-lg p-4 mb-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label>Link Title</Label>
                              <Input
                                value={link.title}
                                onChange={(e) => {
                                  const newLinks = [...formData.classLinks];
                                  newLinks[index].title = e.target.value;
                                  handleInputChange('classLinks', newLinks);
                                }}
                                placeholder="e.g., Weekly Grammar Class"
                              />
                            </div>
                            <div>
                              <Label>Meeting URL</Label>
                              <Input
                                type="url"
                                value={link.meetingUrl}
                                onChange={(e) => {
                                  const newLinks = [...formData.classLinks];
                                  newLinks[index].meetingUrl = e.target.value;
                                  handleInputChange('classLinks', newLinks);
                                }}
                                placeholder="https://zoom.us/j/123456789"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label>Schedule</Label>
                              <Input
                                type="datetime-local"
                                value={link.schedule}
                                onChange={(e) => {
                                  const newLinks = [...formData.classLinks];
                                  newLinks[index].schedule = e.target.value;
                                  handleInputChange('classLinks', newLinks);
                                }}
                              />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Input
                                value={link.description}
                                onChange={(e) => {
                                  const newLinks = [...formData.classLinks];
                                  newLinks[index].description = e.target.value;
                                  handleInputChange('classLinks', newLinks);
                                }}
                                placeholder="Brief description of the class"
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newLinks = formData.classLinks.filter((_, i) => i !== index);
                              handleInputChange('classLinks', newLinks);
                            }}
                          >
                            Remove Link
                          </Button>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const newLink: ClassLink = {
                            id: Date.now().toString(),
                            title: '',
                            meetingUrl: '',
                            schedule: '',
                            description: ''
                          };
                          handleInputChange('classLinks', [...formData.classLinks, newLink]);
                        }}
                      >
                        Add Class Link
                      </Button>
                    </div>
                  </div>

                  {/* Blog Management Section */}
                  <div className="space-y-4">
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">Blog Management</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create and manage blog posts related to your courses
                      </p>

                      {formData.blogPosts?.map((blog, index) => (
                        <div key={blog.id} className="border rounded-lg p-4 mb-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Blog Title</Label>
                              <Input
                                value={blog.title}
                                onChange={(e) => {
                                  const newBlogs = [...(formData.blogPosts || [])];
                                  newBlogs[index].title = e.target.value;
                                  handleInputChange('blogPosts', newBlogs);
                                }}
                                placeholder="e.g., Learning Hiragana: A Beginner's Guide"
                              />
                            </div>
                            <div>
                              <Label>Author</Label>
                              <Input
                                value={blog.author}
                                onChange={(e) => {
                                  const newBlogs = [...(formData.blogPosts || [])];
                                  newBlogs[index].author = e.target.value;
                                  handleInputChange('blogPosts', newBlogs);
                                }}
                                placeholder="e.g., John Doe"
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Blog Excerpt</Label>
                            <Textarea
                              value={blog.excerpt}
                              onChange={(e) => {
                                const newBlogs = [...(formData.blogPosts || [])];
                                newBlogs[index].excerpt = e.target.value;
                                handleInputChange('blogPosts', newBlogs);
                              }}
                              placeholder="Brief description of the blog post..."
                              rows={2}
                            />
                          </div>

                          <div>
                            <Label>Blog Content</Label>
                            <Textarea
                              value={blog.content}
                              onChange={(e) => {
                                const newBlogs = [...(formData.blogPosts || [])];
                                newBlogs[index].content = e.target.value;
                                handleInputChange('blogPosts', newBlogs);
                              }}
                              placeholder="Write your full blog content here..."
                              rows={6}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Featured Image URL</Label>
                              <Input
                                type="url"
                                value={blog.featuredImage}
                                onChange={(e) => {
                                  const newBlogs = [...(formData.blogPosts || [])];
                                  newBlogs[index].featuredImage = e.target.value;
                                  handleInputChange('blogPosts', newBlogs);
                                }}
                                placeholder="https://example.com/image.jpg"
                              />
                            </div>
                            <div>
                              <Label>Publish Date</Label>
                              <Input
                                type="date"
                                value={blog.publishDate}
                                onChange={(e) => {
                                  const newBlogs = [...(formData.blogPosts || [])];
                                  newBlogs[index].publishDate = e.target.value;
                                  handleInputChange('blogPosts', newBlogs);
                                }}
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Tags (comma-separated)</Label>
                            <Input
                              value={blog.tags.join(', ')}
                              onChange={(e) => {
                                const newBlogs = [...(formData.blogPosts || [])];
                                newBlogs[index].tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                                handleInputChange('blogPosts', newBlogs);
                              }}
                              placeholder="e.g., japanese, hiragana, learning, beginner"
                            />
                          </div>

                          {/* Upload from PC Section for Blog Images */}
                          <div className="border-t pt-3 mt-3">
                            <Label className="text-sm font-medium">Upload Featured Image from PC</Label>
                            <div className="mt-2 flex gap-2">
                              <Input
                                type="file"
                                accept=".jpg,.jpeg,.png,.gif,.webp"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const newBlogs = [...(formData.blogPosts || [])];
                                    newBlogs[index].featuredImage = `uploading-${file.name}`;
                                    handleInputChange('blogPosts', newBlogs);
                                    toast.success(`Image "${file.name}" ready for upload!`);
                                  }
                                }}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  toast.info('Image upload functionality will be implemented with backend integration');
                                }}
                              >
                                Upload
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Accepted formats: JPG, JPEG, PNG, GIF, WebP (Max: 5MB)
                            </p>
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`blog-published-${blog.id}`}
                                checked={blog.isPublished}
                                onCheckedChange={(checked) => {
                                  const newBlogs = [...(formData.blogPosts || [])];
                                  newBlogs[index].isPublished = checked === true;
                                  handleInputChange('blogPosts', newBlogs);
                                }}
                              />
                              <Label htmlFor={`blog-published-${blog.id}`}>Publish immediately</Label>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newBlogs = (formData.blogPosts || []).filter((_, i) => i !== index);
                                handleInputChange('blogPosts', newBlogs);
                              }}
                            >
                              Remove Blog
                            </Button>
                          </div>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const newBlog: BlogPost = {
                            id: Date.now().toString(),
                            title: '',
                            content: '',
                            excerpt: '',
                            author: '',
                            publishDate: new Date().toISOString().split('T')[0],
                            tags: [],
                            isPublished: false,
                            featuredImage: ''
                          };
                          handleInputChange('blogPosts', [...(formData.blogPosts || []), newBlog]);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        + Add New Blog
                      </Button>
                    </div>
                  </div>

                  {/* Enrolled Students Section */}
                  <div className="space-y-4">
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">Enrolled Students Info</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Manage enrolled students for this course
                      </p>

                      {formData.enrolledStudents.map((student, index) => (
                        <div key={student.id} className="border rounded-lg p-4 mb-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label>Student Name</Label>
                              <Input
                                value={student.name}
                                onChange={(e) => {
                                  const newStudents = [...formData.enrolledStudents];
                                  newStudents[index].name = e.target.value;
                                  handleInputChange('enrolledStudents', newStudents);
                                }}
                                placeholder="e.g., Ahmed Hassan"
                              />
                            </div>
                            <div>
                              <Label>Email</Label>
                              <Input
                                type="email"
                                value={student.email}
                                onChange={(e) => {
                                  const newStudents = [...formData.enrolledStudents];
                                  newStudents[index].email = e.target.value;
                                  handleInputChange('enrolledStudents', newStudents);
                                }}
                                placeholder="student@example.com"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <Label>Enrollment Date</Label>
                              <Input
                                type="date"
                                value={student.enrollmentDate}
                                onChange={(e) => {
                                  const newStudents = [...formData.enrolledStudents];
                                  newStudents[index].enrollmentDate = e.target.value;
                                  handleInputChange('enrolledStudents', newStudents);
                                }}
                              />
                            </div>
                            <div>
                              <Label>Progress (%)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={student.progress}
                                onChange={(e) => {
                                  const newStudents = [...formData.enrolledStudents];
                                  newStudents[index].progress = parseInt(e.target.value);
                                  handleInputChange('enrolledStudents', newStudents);
                                }}
                              />
                            </div>
                            <div>
                              <Label>Status</Label>
                              <Select
                                value={student.status}
                                onValueChange={(value: 'active' | 'inactive') => {
                                  const newStudents = [...formData.enrolledStudents];
                                  newStudents[index].status = value;
                                  handleInputChange('enrolledStudents', newStudents);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newStudents = formData.enrolledStudents.filter((_, i) => i !== index);
                              handleInputChange('enrolledStudents', newStudents);
                            }}
                          >
                            Remove Student
                          </Button>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const newStudent: EnrolledStudent = {
                            id: Date.now().toString(),
                            name: '',
                            email: '',
                            enrollmentDate: new Date().toISOString().split('T')[0],
                            progress: 0,
                            status: 'active'
                          };
                          handleInputChange('enrolledStudents', [...formData.enrolledStudents, newStudent]);
                        }}
                      >
                        Add Student
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Modal Footer - Always Visible */}
                <div className="border-t bg-gray-50 p-4 flex-shrink-0">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">Summary:</p>
                      <p>{courses.length} course{courses.length > 1 ? 's' : ''} ready to submit</p>
                      {courses.length > 1 && (
                        <p>Currently editing: Course {activeCourseIndex + 1}</p>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowAdvancedModal(false)}
                        size="sm"
                      >
                        Close
                      </Button>
                      <Button
                        onClick={() => {
                          // Save blogs to localStorage when modal is closed
                          const allBlogs = courses.flatMap(course =>
                            (course.blogPosts || []).map(blog => ({
                              ...blog,
                              courseName: course.title || 'Untitled Course'
                            }))
                          );

                          if (allBlogs.length > 0) {
                            try {
                              const existingBlogs = JSON.parse(localStorage.getItem('publishedBlogs') || '[]');

                              // Filter out existing blogs to prevent duplicates
                              const existingIds = existingBlogs.map((blog: any) => blog.id);
                              const newBlogs = allBlogs.filter(blog => !existingIds.includes(blog.id));

                              const updatedBlogs = [...existingBlogs, ...newBlogs];
                              localStorage.setItem('publishedBlogs', JSON.stringify(updatedBlogs));

                              const publishedCount = allBlogs.filter(blog => blog.isPublished).length;
                              if (publishedCount > 0) {
                                toast.success(`${publishedCount} blog post${publishedCount > 1 ? 's' : ''} published to the blog page!`);
                              }
                            } catch (error) {
                              console.error('Error saving blogs:', error);
                              toast.error('Failed to save blogs to blog page');
                            }
                          }

                          setShowAdvancedModal(false);
                          toast.success(`Advanced settings saved for ${courses.length} course${courses.length > 1 ? 's' : ''}!`);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        Save & Continue
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="premium"
                checked={formData.isPremium}
                onCheckedChange={(checked) => handleInputChange('isPremium', checked)}
              />
              <Label htmlFor="premium">{t('form.premiumCourse')}</Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => handleSubmit(false)}
              disabled={isLoading}
            >
              {isLoading ? (
                <IconLoader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <IconDeviceFloppy className="size-4 mr-2" />
              )}
              {t('nav.features') === 'বৈশিষ্ট্যসমূহ'
                ? `খসড়া হিসেবে সংরক্ষণ ${courses.length > 1 ? `(${courses.length} কোর্স)` : ''}`
                : `Save as Draft ${courses.length > 1 ? `(${courses.length} courses)` : ''}`}
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={() => handleSubmit(true)}
              disabled={isLoading}
            >
              {isLoading ? (
                <IconLoader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <IconDeviceFloppy className="size-4 mr-2" />
              )}
              {t('nav.features') === 'বৈশিষ্ট্যসমূহ'
                ? `সংরক্ষণ ও প্রকাশ ${courses.length > 1 ? `(${courses.length} কোর্স)` : ''}`
                : `Save & Publish ${courses.length > 1 ? `(${courses.length} courses)` : ''}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}