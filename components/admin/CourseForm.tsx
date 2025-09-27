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
import { IconDeviceFloppy, IconLoader2 } from '@tabler/icons-react';
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
}

export default function CourseForm() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CourseFormData>({
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
    enrollmentLastDate: ''
  });

  const handleInputChange = (field: keyof CourseFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
      // Validation
      if (!formData.title.trim()) {
        toast.error('Course title is required');
        return;
      }

      if (!formData.description.trim()) {
        toast.error('Course description is required');
        return;
      }

      if (!formData.level) {
        toast.error('Course level is required');
        return;
      }

      if (!formData.category) {
        toast.error('Course category is required');
        return;
      }

      if (!formData.estimatedDuration || parseInt(formData.estimatedDuration) <= 0) {
        toast.error('Valid estimated duration is required');
        return;
      }

      const validObjectives = formData.learningObjectives.filter(obj => obj.trim());
      if (validObjectives.length === 0) {
        toast.error('At least one learning objective is required');
        return;
      }

      const courseData = {
        ...formData,
        isPublished: publishImmediately,
        learningObjectives: validObjectives,
        links: formData.links.filter(link => link.trim()),
        estimatedDuration: parseInt(formData.estimatedDuration),
        difficulty: parseInt(formData.difficulty)
      };

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
          throw new Error(`Validation failed: ${result.details.join(', ')}`);
        }
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      toast.success(publishImmediately ? 'Course created and published successfully!' : 'Course saved as draft successfully!');
      router.push('/admin-dashboard/courses');
      router.refresh();

    } catch (error: any) {
      console.error('Error creating course:', error);
      toast.error(error.message || 'Failed to create course');
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
              <Label htmlFor="whatYoullLearn">{t('What You will Learn')}</Label>
              <Textarea
                id="whatYoullLearn"
                placeholder={
                  t('nav.features') === 'বৈশিষ্ট্যসমূহ'
                    ? 'শিক্ষার্থীরা এই কোর্স থেকে কী শিখবে...'
                    : 'What will students learn from this course...'
                }
                value={formData.whatYoullLearn}
                onChange={(e) => handleInputChange('whatYoullLearn', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="courseLessonModule">{t('Course Lesson Module')}</Label>
              <Textarea
                id="courseLessonModule"
                placeholder={
                  t('nav.features') === 'বৈশিষ্ট্যসমূহ'
                    ? 'কোর্সের পাঠ্যক্রম, পাঠ এবং মডিউল বর্ণনা করুন...'
                    : 'Describe the course curriculum, lessons, and modules...'
                }
                value={formData.courseLessonModule}
                onChange={(e) => handleInputChange('courseLessonModule', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="actualPrice">{t('Actual Price')}</Label>
                <Input
                  id="actualPrice"
                  placeholder="BDT99.99"
                  value={formData.actualPrice}
                  onChange={(e) => handleInputChange('actualPrice', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="discountedPrice">{t('Discounted Price')}</Label>
                <Input
                  id="discountedPrice"
                  placeholder="BDT 49.99"
                  value={formData.discountedPrice}
                  onChange={(e) => handleInputChange('discountedPrice', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="enrollmentLastDate">{t('Enrollment Last Date')}</Label>
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
              {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'খসড়া হিসেবে সংরক্ষণ' : 'Save as Draft'}
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
              {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'সংরক্ষণ ও প্রকাশ' : 'Save & Publish'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}