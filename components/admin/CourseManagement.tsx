'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import ResourceForm from "@/components/admin/ResourceForm";
import {
  BookOpen,
  Plus,
  Edit,
  Eye,
  Trash2,
  Users,
  Video,
  Link,
  FileText,
  Calendar,
  Play,
  ExternalLink,
  UserCheck,
  Clock,
  BarChart3
} from "lucide-react";

interface Course {
  _id: string;
  title: string;
  description: string;
  level: string;
  difficulty: string;
  isPublished: boolean;
  enrolledStudents: string[];
  enrolledStudentsDetails?: EnrolledStudent[];
  classModules?: ClassModule[];
  classLinks?: ClassLink[];
  youtubeResources?: Resource[];
  assignments?: Assignment[];
  createdAt: string;
}

interface EnrolledStudent {
  _id: string;
  name: string;
  email: string;
  enrollmentDate: string;
  progress: number;
  lastActivity: string;
  status: 'completed' | 'in-progress' | 'not-started';
}

interface ClassModule {
  _id: string;
  title: string;
  content: string;
  order: number;
  createdAt: string;
}

interface ClassLink {
  _id: string;
  title: string;
  meetingUrl: string;
  schedule: string;
  description?: string;
  createdAt: string;
}

interface Resource {
  _id: string;
  title: string;
  url: string;
  type: 'youtube' | 'document' | 'website';
  description?: string;
  thumbnailUrl?: string;
  createdAt: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  type: 'assignment' | 'quiz';
  dueDate?: string;
  createdAt: string;
}

interface CourseManagementProps {
  courses: Course[];
  onCourseCreate: (course: Partial<Course>) => void;
}

export default function CourseManagement({ courses, onCourseCreate }: CourseManagementProps) {
  const { t } = useLanguage();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<'modules' | 'links' | 'resources' | 'students' | 'assignments'>('modules');
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [showResourceForm, setShowResourceForm] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'beginner',
    difficulty: 'easy'
  });

  const [moduleFormData, setModuleFormData] = useState({
    title: '',
    content: '',
    order: 1
  });

  const [linkFormData, setLinkFormData] = useState({
    title: '',
    meetingUrl: '',
    schedule: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newCourse = await response.json();
        onCourseCreate(newCourse);
        setFormData({ title: '', description: '', level: 'beginner', difficulty: 'easy' });
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleModuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    // Here you would make an API call to add the module
    console.log('Adding module:', moduleFormData);
    setModuleFormData({ title: '', content: '', order: 1 });
    setShowModuleForm(false);
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    // Here you would make an API call to add the class link
    console.log('Adding class link:', linkFormData);
    setLinkFormData({ title: '', meetingUrl: '', schedule: '', description: '' });
    setShowLinkForm(false);
  };

  const viewCourseDetails = (course: Course) => {
    setSelectedCourse(course);
  };

  const closeCourseDetails = () => {
    setSelectedCourse(null);
    setActiveTab('modules');
  };

  return (
    <div className="space-y-6">
      {/* Course Details Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold">{selectedCourse.title}</h2>
                <p className="text-gray-600">{t('course.details')}</p>
              </div>
              
              <Button variant="outline" onClick={closeCourseDetails}>
                ✕
              </Button>
            </div>

            <div className="flex border-b">
              <Button
                variant={activeTab === 'modules' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('modules')}
                className="rounded-none"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                {t('course.modules')}
              </Button>
              <Button
                variant={activeTab === 'links' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('links')}
                className="rounded-none"
              >
                <Video className="h-4 w-4 mr-2" />
                {t('course.classLinks')}
              </Button>
              <Button
                variant={activeTab === 'resources' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('resources')}
                className="rounded-none"
              >
                <Play className="h-4 w-4 mr-2" />
                {t('course.resources')}
              </Button>
              <Button
                variant={activeTab === 'students' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('students')}
                className="rounded-none"
              >
                <Users className="h-4 w-4 mr-2" />
                {t('course.enrolledStudents')}
              </Button>
              <Button
                variant={activeTab === 'assignments' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('assignments')}
                className="rounded-none"
              >
                <FileText className="h-4 w-4 mr-2" />
                {t('course.assignments')}
              </Button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {/* Class Modules Tab */}
              {activeTab === 'modules' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{t('course.modules')}</h3>
                    <Button onClick={() => setShowModuleForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('course.addModule')}
                    </Button>
                  </div>

                  {showModuleForm && (
                    <Card className="mb-4">
                      <CardContent className="pt-6">
                        <form onSubmit={handleModuleSubmit} className="space-y-4">
                          <div>
                            <Label htmlFor="moduleTitle">{t('course.moduleTitle')}</Label>
                            <Input
                              id="moduleTitle"
                              value={moduleFormData.title}
                              onChange={(e) => setModuleFormData({ ...moduleFormData, title: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="moduleContent">{t('course.moduleContent')}</Label>
                            <Textarea
                              id="moduleContent"
                              value={moduleFormData.content}
                              onChange={(e) => setModuleFormData({ ...moduleFormData, content: e.target.value })}
                              rows={4}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="moduleOrder">{t('course.moduleOrder')}</Label>
                            <Input
                              id="moduleOrder"
                              type="number"
                              value={moduleFormData.order}
                              onChange={(e) => setModuleFormData({ ...moduleFormData, order: parseInt(e.target.value) })}
                              min="1"
                              required
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setShowModuleForm(false)}>
                              {t('course.cancel')}
                            </Button>
                            <Button type="submit">
                              {t('course.addModule')}
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  {selectedCourse.classModules && selectedCourse.classModules.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCourse.classModules.map((module, index) => (
                        <div key={module._id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{module.title}</h4>
                              <p className="text-gray-600 mt-1">{module.content}</p>
                              <span className="text-sm text-gray-400">Order: {module.order}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {t('course.noModules')}
                    </div>
                  )}
                </div>
              )}

              {/* Class Links Tab */}
              {activeTab === 'links' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{t('course.classLinks')}</h3>
                    <Button onClick={() => setShowLinkForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('course.addClassLink')}
                    </Button>
                  </div>

                  {showLinkForm && (
                    <Card className="mb-4">
                      <CardContent className="pt-6">
                        <form onSubmit={handleLinkSubmit} className="space-y-4">
                          <div>
                            <Label htmlFor="linkTitle">{t('course.linkTitle')}</Label>
                            <Input
                              id="linkTitle"
                              value={linkFormData.title}
                              onChange={(e) => setLinkFormData({ ...linkFormData, title: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="meetingUrl">{t('course.meetingUrl')}</Label>
                            <Input
                              id="meetingUrl"
                              type="url"
                              value={linkFormData.meetingUrl}
                              onChange={(e) => setLinkFormData({ ...linkFormData, meetingUrl: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="schedule">{t('course.schedule')}</Label>
                            <Input
                              id="schedule"
                              type="datetime-local"
                              value={linkFormData.schedule}
                              onChange={(e) => setLinkFormData({ ...linkFormData, schedule: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="linkDescription">{t('course.description')}</Label>
                            <Textarea
                              id="linkDescription"
                              value={linkFormData.description}
                              onChange={(e) => setLinkFormData({ ...linkFormData, description: e.target.value })}
                              rows={3}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setShowLinkForm(false)}>
                              {t('course.cancel')}
                            </Button>
                            <Button type="submit">
                              {t('course.addClassLink')}
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  {selectedCourse.classLinks && selectedCourse.classLinks.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCourse.classLinks.map((link) => (
                        <div key={link._id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold flex items-center">
                                <Video className="h-4 w-4 mr-2" />
                                {link.title}
                              </h4>
                              <p className="text-gray-600 mt-1">{link.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {new Date(link.schedule).toLocaleDateString()}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {new Date(link.schedule).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm" onClick={() => window.open(link.meetingUrl, '_blank')}>
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {t('course.noLinks')}
                    </div>
                  )}
                </div>
              )}

              {/* Resources Tab */}
              {activeTab === 'resources' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{t('course.resources')}</h3>
                    <Button onClick={() => setShowResourceForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('course.addResource')}
                    </Button>
                  </div>

                  {showResourceForm && selectedCourse && (
                    <Card className="mb-4">
                      <CardContent className="pt-6">
                        <ResourceForm 
                          courseId={selectedCourse._id} 
                          onSuccess={() => {
                            setShowResourceForm(false);
                            // Optionally refresh the course data here
                          }} 
                        />
                      </CardContent>
                    </Card>
                  )}

                  {selectedCourse.youtubeResources && selectedCourse.youtubeResources.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCourse.youtubeResources.map((resource) => (
                        <div key={resource._id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold flex items-center">
                                {resource.type === 'youtube' && <Play className="h-4 w-4 mr-2 text-red-500" />}
                                {resource.type === 'document' && <FileText className="h-4 w-4 mr-2 text-blue-500" />}
                                {resource.type === 'website' && <Link className="h-4 w-4 mr-2 text-green-500" />}
                                {resource.title}
                              </h4>
                              <p className="text-gray-600 mt-1">{resource.description}</p>
                              <Badge variant="outline" className="mt-2">
                                {t(`course.${resource.type}`)}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm" onClick={() => window.open(resource.url, '_blank')}>
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {t('course.noResources')}
                    </div>
                  )}
                </div>
              )}

              {/* Enrolled Students Tab */}
              {activeTab === 'students' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{t('course.enrolledStudents')}</h3>
                    <Badge variant="outline">
                      {selectedCourse.enrolledStudents?.length || 0} {t('course.students')}
                    </Badge>
                  </div>

                  {selectedCourse.enrolledStudentsDetails && selectedCourse.enrolledStudentsDetails.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCourse.enrolledStudentsDetails.map((student) => (
                        <div key={student._id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold flex items-center">
                                <UserCheck className="h-4 w-4 mr-2" />
                                {student.name}
                              </h4>
                              <p className="text-gray-600">{student.email}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {t('course.enrollmentDate')}: {new Date(student.enrollmentDate).toLocaleDateString()}
                                </span>
                                <span className="flex items-center">
                                  <BarChart3 className="h-4 w-4 mr-1" />
                                  {t('course.progress')}: {student.progress}%
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant={student.status === 'completed' ? 'default' :
                                  student.status === 'in-progress' ? 'secondary' : 'outline'}
                              >
                                {t(`course.${student.status}`)}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-2">
                                {t('course.lastActivity')}: {new Date(student.lastActivity).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {t('course.noEnrolledStudents')}
                    </div>
                  )}
                </div>
              )}

              {/* Assignments Tab */}
              {activeTab === 'assignments' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{t('course.assignments')}</h3>
                    <p className="text-gray-500">{t('dashboard.comingSoon')}</p>
                  </div>

                  <div className="text-center py-8 text-gray-500">
                    {t('course.assignments')} - {t('dashboard.comingSoon')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Course Management Interface */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{t('course.management')}</h3>
          <p className="text-gray-600">{t('course.createAndManage')}</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('course.addNewCourse')}
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>{t('course.createNewCourse')}</CardTitle>
            <CardDescription>
              {t('course.basicDetails')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">{t('course.courseTitle')}</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder={t('course.titlePlaceholder')}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="level">{t('course.level')}</Label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="beginner">{t('course.beginner')}</option>
                    <option value="intermediate">{t('course.intermediate')}</option>
                    <option value="advanced">{t('course.advanced')}</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">{t('course.description')}</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder={t('course.descriptionPlaceholder')}
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="difficulty">{t('course.difficulty')}</Label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="easy">{t('course.easy')}</option>
                  <option value="medium">{t('course.medium')}</option>
                  <option value="hard">{t('course.hard')}</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  {t('course.cancel')}
                </Button>
                <Button type="submit">
                  {t('course.createCourse')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('course.allCourses')}</CardTitle>
          <CardDescription>
            {t('course.manageCatalog')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t('course.noCoursesFound')}
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course._id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-semibold">{course.title}</h4>
                        <Badge variant={course.isPublished ? "default" : "secondary"}>
                          {course.isPublished ? t('course.published') : t('course.draft')}
                        </Badge>
                        <Badge variant="outline">
                          {course.level}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{course.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {course.enrolledStudents?.length || 0} {t('course.students')}
                        </span>
                        <span>
                          {t('course.created')}: {new Date(course.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => viewCourseDetails(course)}>
                        <Eye className="h-4 w-4 mr-1" />
                        {t('course.view')}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        {t('course.edit')}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// export default CourseManagement; (removed duplicate export)