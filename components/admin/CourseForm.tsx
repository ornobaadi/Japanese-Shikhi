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

export default function CourseForm() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
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
    enrollmentLastDate: '',
    classModules: [],
    classLinks: [],
    youtubeResources: [],
    enrolledStudents: []
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
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                  <div>
                    <h2 className="text-2xl font-bold">Advanced Course Management</h2>
                    <p className="text-gray-600">Manage detailed course content and student information</p>
                  </div>
                  <Button variant="outline" onClick={() => setShowAdvancedModal(false)}>
                    ✕
                  </Button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto space-y-8">
                  {/* Class Modules Section */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Class Modules</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add class modules to organize your course content
                      </p>

                      {formData.classModules.map((module, index) => (
                        <div key={module.id} className="border rounded-lg p-4 mb-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label>Module Title</Label>
                              <Input
                                value={module.title}
                                onChange={(e) => {
                                  const newModules = [...formData.classModules];
                                  newModules[index].title = e.target.value;
                                  handleInputChange('classModules', newModules);
                                }}
                                placeholder="e.g., Introduction to Hiragana"
                              />
                            </div>
                            <div>
                              <Label>Order</Label>
                              <Input
                                type="number"
                                value={module.order}
                                onChange={(e) => {
                                  const newModules = [...formData.classModules];
                                  newModules[index].order = parseInt(e.target.value);
                                  handleInputChange('classModules', newModules);
                                }}
                                min="1"
                              />
                            </div>
                          </div>
                          <div className="mb-4">
                            <Label>Module Content</Label>
                            <Textarea
                              value={module.content}
                              onChange={(e) => {
                                const newModules = [...formData.classModules];
                                newModules[index].content = e.target.value;
                                handleInputChange('classModules', newModules);
                              }}
                              placeholder="Describe the module content and learning objectives..."
                              rows={3}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newModules = formData.classModules.filter((_, i) => i !== index);
                              handleInputChange('classModules', newModules);
                            }}
                          >
                            Remove Module
                          </Button>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const newModule: ClassModule = {
                            id: Date.now().toString(),
                            title: '',
                            content: '',
                            order: formData.classModules.length + 1
                          };
                          handleInputChange('classModules', [...formData.classModules, newModule]);
                        }}
                      >
                        Add Class Module
                      </Button>
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

                  {/* YouTube/Resources Section */}
                  <div className="space-y-4">
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">YouTube / Resources</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add YouTube videos and other learning resources
                      </p>

                      {formData.youtubeResources.map((resource, index) => (
                        <div key={resource.id} className="border rounded-lg p-4 mb-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label>Resource Title</Label>
                              <Input
                                value={resource.title}
                                onChange={(e) => {
                                  const newResources = [...formData.youtubeResources];
                                  newResources[index].title = e.target.value;
                                  handleInputChange('youtubeResources', newResources);
                                }}
                                placeholder="e.g., Hiragana Writing Practice"
                              />
                            </div>
                            <div>
                              <Label>Resource URL</Label>
                              <Input
                                type="url"
                                value={resource.url}
                                onChange={(e) => {
                                  const newResources = [...formData.youtubeResources];
                                  newResources[index].url = e.target.value;
                                  handleInputChange('youtubeResources', newResources);
                                }}
                                placeholder="https://youtube.com/watch?v=..."
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label>Resource Type</Label>
                              <Select
                                value={resource.type}
                                onValueChange={(value: 'youtube' | 'document' | 'website') => {
                                  const newResources = [...formData.youtubeResources];
                                  newResources[index].type = value;
                                  handleInputChange('youtubeResources', newResources);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="youtube">YouTube</SelectItem>
                                  <SelectItem value="document">Document</SelectItem>
                                  <SelectItem value="website">Website</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Input
                                value={resource.description}
                                onChange={(e) => {
                                  const newResources = [...formData.youtubeResources];
                                  newResources[index].description = e.target.value;
                                  handleInputChange('youtubeResources', newResources);
                                }}
                                placeholder="Brief description of the resource"
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newResources = formData.youtubeResources.filter((_, i) => i !== index);
                              handleInputChange('youtubeResources', newResources);
                            }}
                          >
                            Remove Resource
                          </Button>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const newResource: Resource = {
                            id: Date.now().toString(),
                            title: '',
                            url: '',
                            type: 'youtube',
                            description: ''
                          };
                          handleInputChange('youtubeResources', [...formData.youtubeResources, newResource]);
                        }}
                      >
                        Add Resource
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

                  {/* Assignment/Quiz Section (Coming Soon) */}
                  <div className="space-y-4">
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">Assignment / Quiz</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Assignment and quiz management - Coming Soon
                      </p>
                      <div className="border rounded-lg p-8 text-center">
                        <p className="text-muted-foreground">This feature will be available soon!</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAdvancedModal(false)}
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        setShowAdvancedModal(false);
                        toast.success('Advanced settings saved!');
                      }}
                    >
                      Save Changes
                    </Button>
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