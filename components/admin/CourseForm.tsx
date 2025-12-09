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
import AdvancedCourseManagementModal from './AdvancedCourseManagementModal';

interface CourseFormData {
  _id?: string; // Optional ID for saved courses
  title: string;
  description: string;
  level: string;
  estimatedDuration: string;
  difficulty: string;
  isPremium: boolean;
  isPublished: boolean;
  allowFreePreview: boolean;
  freePreviewCount: string;
  learningObjectives: string[];
  thumbnailUrl: string;
  thumbnailFile?: File;
  instructorNotes: string;
  whatYoullLearn: string;
  courseLessonModule: string;
  actualPrice: string;
  discountedPrice: string;
  enrollmentLastDate: string;
}

export default function CourseForm({ initialCourse }: { initialCourse?: any }) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const isEditMode = !!initialCourse?._id;

  // Course form data
  const getInitialCourseData = (): CourseFormData => ({
    title: initialCourse?.title || '',
    description: initialCourse?.description || '',
    level: initialCourse?.level || 'beginner',
    estimatedDuration: initialCourse?.estimatedDuration?.toString() || '60',
    difficulty: initialCourse?.difficulty?.toString() || '5',
    isPremium: initialCourse?.isPremium || false,
    isPublished: initialCourse?.isPublished || false,
    allowFreePreview: initialCourse?.allowFreePreview ?? true,
    freePreviewCount: initialCourse?.freePreviewCount?.toString() || '2',
    learningObjectives: initialCourse?.learningObjectives?.length > 0 ? initialCourse.learningObjectives : [''],
    thumbnailUrl: initialCourse?.thumbnailUrl || '',
    thumbnailFile: undefined,
    instructorNotes: initialCourse?.instructorNotes || '',
    whatYoullLearn: initialCourse?.whatYoullLearn || '',
    courseLessonModule: initialCourse?.courseLessonModule || '',
    actualPrice: initialCourse?.actualPrice?.toString() || '',
    discountedPrice: initialCourse?.discountedPrice?.toString() || '',
    enrollmentLastDate: initialCourse?.enrollmentLastDate || '',
    _id: initialCourse?._id
  });

  const [formData, setFormData] = useState<CourseFormData>(getInitialCourseData());

  const handleInputChange = (field: keyof CourseFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...formData.learningObjectives];
    newObjectives[index] = value;
    handleInputChange('learningObjectives', newObjectives);
  };

  const addObjective = () => {
    if (formData.learningObjectives.length < 10) {
      handleInputChange('learningObjectives', [...formData.learningObjectives, '']);
    }
  };

  const removeObjective = (index: number) => {
    if (formData.learningObjectives.length > 1) {
      const newObjectives = formData.learningObjectives.filter((_, i) => i !== index);
      handleInputChange('learningObjectives', newObjectives);
    }
  };

  const handleThumbnailChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('thumbnailUrl', e.target?.result as string);
        handleInputChange('thumbnailFile', file);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler for Advanced Course Management Modal
  const handleAdvancedSave = async (managementData: any) => {
    try {
      // If we don't have a courseId yet, we need to save the course first
      if (!formData._id) {
        toast.error('Please save the course first before managing advanced content');
        return;
      }

      console.log('🔥 SAVING ADVANCED DATA TO COURSE MANAGEMENT');
      console.log('📍 Course ID:', formData._id);
      console.log('📦 Management Data:', JSON.stringify(managementData, null, 2));

      // Use the dedicated management endpoint instead of PATCH
      const response = await fetch(`/api/admin/courses/${formData._id}/management`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(managementData),
      });

      console.log('📡 Response Status:', response.status);
      console.log('📡 Response OK:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save course management data');
      }

      const result = await response.json();
      console.log('✅ Success Response:', result);
      toast.success('Course management data saved successfully!');

      return result;
    } catch (error) {
      console.error('❌ SAVE ERROR:', error);
      console.error('❌ Error details:', (error as any)?.message);
      toast.error('Failed to save course management data. Please try again.');
      throw error;
    }
  };

  const handleSubmit = async (publishImmediately: boolean = false) => {
    setIsLoading(true);

    try {
      console.log('🔍 Form data before validation:', {
        title: formData.title,
        description: formData.description,
        level: formData.level,
        estimatedDuration: formData.estimatedDuration,
        difficulty: formData.difficulty,
        learningObjectives: formData.learningObjectives
      });

      // Validate required fields
      if (!formData.title.trim()) {
        toast.error('Title is required');
        return;
      }

      if (!formData.description.trim()) {
        toast.error('Description is required');
        return;
      }

      if (!formData.level) {
        toast.error('Level is required');
        return;
      }

      if (!formData.estimatedDuration || parseInt(formData.estimatedDuration) <= 0) {
        toast.error('Valid estimated duration is required');
        return;
      }

      // Validate learning objectives
      const validObjectives = formData.learningObjectives.filter((obj: string) => obj.trim());
      if (validObjectives.length === 0) {
        toast.error('At least one learning objective is required');
        return;
      }

      // Handle thumbnail upload if file is selected
      let thumbnailUrl = formData.thumbnailUrl;
      if (formData.thumbnailFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', formData.thumbnailFile);
        formDataUpload.append('type', 'course-thumbnail');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          throw new Error(`Failed to upload thumbnail: ${uploadError.error || 'Unknown error'}`);
        }

        const uploadResult = await uploadResponse.json();
        thumbnailUrl = uploadResult.url;
      }

      const courseData = {
        ...formData,
        thumbnailUrl,
        isPublished: isEditMode ? formData.isPublished : publishImmediately,
        learningObjectives: validObjectives,
        estimatedDuration: parseInt(formData.estimatedDuration),
        difficulty: parseInt(formData.difficulty),
        allowFreePreview: formData.allowFreePreview,
        freePreviewCount: parseInt(formData.freePreviewCount || '0')
      };

      // Remove thumbnailFile from courseData as it's not needed in DB
      const { thumbnailFile, ...courseDataWithoutFile } = courseData;

      console.log('Submitting course:', JSON.stringify(courseDataWithoutFile, null, 2));

      const url = isEditMode ? `/api/admin/courses/${formData._id}` : '/api/admin/courses';
      const method = isEditMode ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseDataWithoutFile),
      });

      const result = await response.json();
      console.log('📨 API Response:', result);
      console.log('📊 Response Status:', response.status);
      console.log('✅ Response OK:', response.ok);

      if (!response.ok) {
        if (result.details && Array.isArray(result.details)) {
          throw new Error(`Validation failed: ${result.details.join(', ')}`);
        }
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Update form with returned course ID if creating
      if (!isEditMode && result.course && result.course._id) {
        setFormData(prev => {
          console.log('🆔 Setting course ID:', result.course._id);
          console.log('🔄 Previous formData._id:', prev._id);
          const updated = { ...prev, _id: result.course._id };
          console.log('✅ Updated formData._id:', updated._id);
          return updated;
        });
      }

      const actionText = isEditMode ? 'updated' : publishImmediately ? 'published' : 'saved';
      toast.success(`Successfully ${actionText} course!`);

      // Don't reset form or navigate if user might want to use Advanced Course Management
      // Only navigate if explicitly publishing or editing
      if (publishImmediately || isEditMode) {
        setFormData(getInitialCourseData());
        setShowAdvancedModal(false);
        router.push('/admin-dashboard/courses');
        router.refresh();
      }

    } catch (error: any) {
      console.error('Error saving course:', error);
      toast.error(error.message || 'Failed to save course');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('form.createCourse')}</CardTitle>
          <CardDescription>
            {t('form.courseDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('form.basicInformation')}</h3>

            <div>
              <Label htmlFor="title">{t('form.courseTitle')} *</Label>
              <Input
                id="title"
                placeholder={t('form.courseTitlePlaceholder')}
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="description">{t('form.description')} *</Label>
              <Textarea
                id="description"
                placeholder={t('form.descriptionPlaceholder')}
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="level">{t('form.level')} *</Label>
                <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.selectLevel')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">{t('courses.beginner')}</SelectItem>
                    <SelectItem value="intermediate">{t('courses.intermediate')}</SelectItem>
                    <SelectItem value="advanced">{t('courses.advanced')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="estimatedDuration">{t('form.estimatedDuration')} *</Label>
                <Input
                  id="estimatedDuration"
                  type="number"
                  placeholder={t('form.durationPlaceholder')}
                  value={formData.estimatedDuration}
                  onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Learning Objectives */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('form.learningObjectives')} *</h3>
            {formData.learningObjectives.map((objective, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={t('form.objectivePlaceholder')}
                  value={objective}
                  onChange={(e) => handleObjectiveChange(index, e.target.value)}
                  className="flex-1"
                />
                {formData.learningObjectives.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
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
                onClick={addObjective}
              >
                {t('form.addObjective')}
              </Button>
            )}
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('form.additionalInformation')}</h3>

            <div>
              <Label htmlFor="thumbnail">Course Thumbnail</Label>
              <div className="space-y-4">
                {formData.thumbnailUrl && (
                  <div className="relative w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src={formData.thumbnailUrl} 
                      alt="Course Thumbnail" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange('thumbnailUrl', '');
                        handleInputChange('thumbnailFile', undefined);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleThumbnailChange(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
                <p className="text-sm text-gray-600">
                  Upload a course thumbnail image (recommended: 1200x675px or higher)
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="whatYoullLearn">What Will Students Learn?</Label>
              <Textarea
                id="whatYoullLearn"
                placeholder="Describe what students will learn from this course"
                rows={3}
                value={formData.whatYoullLearn}
                onChange={(e) => handleInputChange('whatYoullLearn', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="instructorNotes">Instructor Notes (Optional)</Label>
              <Textarea
                id="instructorNotes"
                placeholder="Add any additional notes for instructors"
                rows={3}
                value={formData.instructorNotes}
                onChange={(e) => handleInputChange('instructorNotes', e.target.value)}
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('form.pricing')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="actualPrice">{t('form.actualPrice')}</Label>
                <Input
                  id="actualPrice"
                  type="number"
                  placeholder="0"
                  value={formData.actualPrice}
                  onChange={(e) => handleInputChange('actualPrice', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="discountedPrice">{t('form.discountedPrice')}</Label>
                <Input
                  id="discountedPrice"
                  type="number"
                  placeholder="0"
                  value={formData.discountedPrice}
                  onChange={(e) => handleInputChange('discountedPrice', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="enrollmentLastDate">{t('form.enrollmentLastDate')}</Label>
                <Input
                  id="enrollmentLastDate"
                  type="date"
                  value={formData.enrollmentLastDate}
                  onChange={(e) => handleInputChange('enrollmentLastDate', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Advanced Course Management Modal */}
          <AdvancedCourseManagementModal
            isOpen={showAdvancedModal}
            onClose={() => setShowAdvancedModal(false)}
            courseId={formData._id || ''}
            courseName={formData.title || 'New Course'}
            onSave={handleAdvancedSave}
          />

          {/* Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="premium"
                checked={formData.isPremium}
                onCheckedChange={(checked) => handleInputChange('isPremium', checked)}
              />
              <Label htmlFor="premium">Premium Course</Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            {isEditMode ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push('/admin-dashboard/courses')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={() => handleSubmit(false)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <IconLoader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <IconDeviceFloppy className="size-4 mr-2" />
                  )}
                  Update Course
                </Button>
              </>
            ) : (
              <>
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
                    ? 'খসড়া হিসেবে সংরক্ষণ'
                    : 'Save as Draft'}
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
                    ? 'প্রকাশ করুন'
                    : 'Publish Course'}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}