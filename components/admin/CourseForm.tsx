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
}

export default function CourseForm() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);

  // Course form data
  const getInitialCourseData = (): CourseFormData => ({
    title: '',
    description: '',
    level: '',
    category: 'language',
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

  const addLink = () => {
    handleInputChange('links', [...formData.links, '']);
  };

  const removeLink = (index: number) => {
    const newLinks = formData.links.filter((_, i) => i !== index);
    handleInputChange('links', newLinks);
  };

  const updateLink = (index: number, value: string) => {
    const newLinks = [...formData.links];
    newLinks[index] = value;
    handleInputChange('links', newLinks);
  };

  // Handler for Advanced Course Management Modal
  const handleAdvancedSave = async (managementData: any) => {
    try {
      // If we don't have a courseId yet, we need to save the course first
      if (!formData._id) {
        toast.error('Please save the course first before managing advanced content');
        return;
      }

      console.log('🔥 SAVING ADVANCED DATA TO COURSE DOCUMENT');
      console.log('📍 Course ID:', formData._id);
      console.log('📦 Management Data:', JSON.stringify(managementData, null, 2));

      // Update the course document directly with advanced field
      const response = await fetch(`/api/admin/courses/${formData._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          advanced: managementData
        }),
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

      if (!formData.category) {
        toast.error('Category is required');
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

      const courseData = {
        ...formData,
        isPublished: publishImmediately,
        learningObjectives: validObjectives,
        links: formData.links.filter((link: string) => link.trim()),
        estimatedDuration: parseInt(formData.estimatedDuration),
        difficulty: parseInt(formData.difficulty)
      };

      console.log('Submitting course:', courseData);

      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
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

      // Update form with returned course ID
      if (result.course && result.course._id) {
        setFormData(prev => {
          console.log('🆔 Setting course ID:', result.course._id);
          console.log('🔄 Previous formData._id:', prev._id);
          const updated = { ...prev, _id: result.course._id };
          console.log('✅ Updated formData._id:', updated._id);
          return updated;
        });
      } else {
        console.log('❌ No course ID in response:', result);
      }

      toast.success(`Successfully ${publishImmediately ? 'published' : 'saved'} course!`);

      // Don't reset form or navigate if user might want to use Advanced Course Management
      // Only navigate if explicitly publishing
      if (publishImmediately) {
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="category">{t('form.category')} *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vocabulary">Vocabulary</SelectItem>
                    <SelectItem value="grammar">Grammar</SelectItem>
                    <SelectItem value="conversation">Conversation</SelectItem>
                    <SelectItem value="reading">Reading</SelectItem>
                    <SelectItem value="writing">Writing</SelectItem>
                    <SelectItem value="culture">Culture</SelectItem>
                    <SelectItem value="kanji">Kanji</SelectItem>
                    <SelectItem value="language">Language</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div>
                <Label htmlFor="difficulty">{t('form.difficulty')} (1-10)</Label>
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

          {/* Course Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('form.courseLinks')}</h3>
            {formData.links.map((link, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="url"
                  placeholder={t('form.linkPlaceholder')}
                  value={link}
                  onChange={(e) => updateLink(index, e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeLink(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addLink}
            >
              {t('form.addLink')}
            </Button>
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

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('form.additionalInformation')}</h3>

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
              <Label htmlFor="whatYoullLearn">{t('form.whatYoullLearn')}</Label>
              <Textarea
                id="whatYoullLearn"
                placeholder={t('form.whatYoullLearnPlaceholder')}
                rows={3}
                value={formData.whatYoullLearn}
                onChange={(e) => handleInputChange('whatYoullLearn', e.target.value)}
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
                onClick={() => {
                  console.log('🔍 DEBUGGING Advanced Modal Button:');
                  console.log('📍 formData._id:', formData._id);
                  console.log('📋 formData.title:', formData.title);
                  console.log('📦 Full formData:', formData);
                  if (!formData._id) {
                    toast.error('Please save the course first before opening Advanced Management!');
                    return;
                  }
                  setShowAdvancedModal(true);
                }}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}