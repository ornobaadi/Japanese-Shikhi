'use client';

import { notFound } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from "sonner";
import {
  IconEdit,
  IconArrowLeft,
  IconClock,
  IconEye,
  IconBook,
  IconTarget,
  IconPlus,
  IconFileText,
  IconVideo,
  IconBrandYoutube,
  IconMicrophone,
  IconTrash,
  IconSpeakerphone,
  IconBell,
  IconCalendar,
  IconLink,
  IconChevronDown,
  IconPlayerPlay,
  IconClipboardCheck,
  IconX,
  IconDownload,
  IconUpload,
  IconPencil,
} from "@tabler/icons-react";

// Type definitions
interface CurriculumItem {
  _id?: string;
  type: 'live-class' | 'announcement' | 'resource' | 'assignment' | 'quiz';
  title: string;
  description?: string;
  scheduledDate: Date;
  meetingLink?: string;
  meetingPlatform?: 'zoom' | 'google-meet' | 'other';
  duration?: number;
  resourceType?: 'pdf' | 'video' | 'youtube' | 'recording' | 'other';
  resourceUrl?: string;
  resourceFile?: string;
  announcementType?: 'important' | 'cancellation' | 'general';
  validUntil?: Date;
  isPinned?: boolean;
  dueDate?: Date;
  createdAt: Date;
  isPublished: boolean;
}

interface Module {
  _id?: string;
  name: string;
  description: string;
  items: CurriculumItem[];
  isPublished: boolean;
  order: number;
}

export default function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useLanguage();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [courseId, setCourseId] = useState<string>('');
  const [activeView, setActiveView] = useState<'curriculum' | 'details'>('curriculum');
  const [modules, setModules] = useState<Module[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<number>(0);

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [showEditModuleDialog, setShowEditModuleDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<CurriculumItem['type']>('live-class');
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'module' | 'item'; id: number | string } | null>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  // File upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [moduleForm, setModuleForm] = useState({
    name: '',
    description: '',
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '21:00',
    meetingLink: '',
    meetingPlatform: 'zoom' as 'zoom' | 'google-meet' | 'other',
    duration: 60,
    resourceType: 'pdf' as 'pdf' | 'video' | 'youtube' | 'recording' | 'other',
    resourceUrl: '',
    resourceFile: '',
    announcementType: 'general' as 'important' | 'cancellation' | 'general',
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isPinned: false,
    dueDate: '',
    dueTime: '23:59',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resolvedParams = await params;
        setCourseId(resolvedParams.id);

        const courseResponse = await fetch(`/api/admin/courses/${resolvedParams.id}`);
        if (!courseResponse.ok) throw new Error('Course not found');

        const courseData = await courseResponse.json();
        setCourse(courseData.course);

        const curriculumResponse = await fetch(`/api/admin/courses/${resolvedParams.id}/curriculum`);
        if (curriculumResponse.ok) {
          const curriculumData = await curriculumResponse.json();
          if (curriculumData.curriculum?.modules) {
            setModules(curriculumData.curriculum.modules);
            if (curriculumData.curriculum.modules.length > 0) {
              setActiveModuleId(0);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load course data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  const saveCurriculum = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/admin/courses/${courseId}/curriculum`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curriculum: { modules } }),
      });

      if (!response.ok) throw new Error('Failed to save');
      toast.success('Curriculum saved successfully');
    } catch (error) {
      console.error('Error saving curriculum:', error);
      toast.error('Failed to save curriculum');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (modules.length > 0 && courseId) {
      const timer = setTimeout(() => {
        saveCurriculum();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [modules, courseId]);

  const handleAddModule = () => {
    const newModule: Module = {
      name: moduleForm.name || `Module ${modules.length + 1}`,
      description: moduleForm.description,
      items: [],
      isPublished: false,
      order: modules.length,
    };
    setModules([...modules, newModule]);
    setActiveModuleId(modules.length);
    setShowModuleDialog(false);
    setModuleForm({ name: '', description: '' });
  };

  const handleEditModule = () => {
    setModules(prev => prev.map((module, idx) =>
      idx === activeModuleId ? { ...module, name: moduleForm.name, description: moduleForm.description } : module
    ));
    setShowEditModuleDialog(false);
    toast.success('Module updated');
  };

  const openEditModule = () => {
    const module = modules[activeModuleId];
    setModuleForm({ name: module.name, description: module.description });
    setShowEditModuleDialog(true);
  };

  const confirmDeleteModule = (index: number) => {
    setDeleteConfirm({ type: 'module', id: index });
  };

  const handleDeleteModule = () => {
    if (deleteConfirm?.type === 'module' && typeof deleteConfirm.id === 'number') {
      const filtered = modules.filter((_, idx) => idx !== deleteConfirm.id);
      setModules(filtered);
      if (activeModuleId === deleteConfirm.id && filtered.length > 0) {
        setActiveModuleId(0);
      }
      setDeleteConfirm(null);
      toast.success('Module deleted');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setFormData(prev => ({ ...prev, resourceUrl: data.url, resourceFile: data.filename }));
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleAddContent = (type: CurriculumItem['type']) => {
    setSelectedType(type);
    setEditingItemIndex(null);
    setShowAddDialog(true);
    setFormData({
      title: '',
      description: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '21:00',
      meetingLink: '',
      meetingPlatform: 'zoom',
      duration: 60,
      resourceType: 'pdf',
      resourceUrl: '',
      resourceFile: '',
      announcementType: 'general',
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isPinned: false,
      dueDate: '',
      dueTime: '23:59',
    });
  };

  const handleEditContent = (itemIdx: number) => {
    const item = modules[activeModuleId].items[itemIdx];
    setSelectedType(item.type);
    setEditingItemIndex(itemIdx);

    const schedDate = new Date(item.scheduledDate);
    setFormData({
      title: item.title,
      description: item.description || '',
      scheduledDate: schedDate.toISOString().split('T')[0],
      scheduledTime: schedDate.toTimeString().slice(0, 5),
      meetingLink: item.meetingLink || '',
      meetingPlatform: item.meetingPlatform || 'zoom',
      duration: item.duration || 60,
      resourceType: item.resourceType || 'pdf',
      resourceUrl: item.resourceUrl || '',
      resourceFile: item.resourceFile || '',
      announcementType: item.announcementType || 'general',
      validUntil: item.validUntil ? new Date(item.validUntil).toISOString().split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isPinned: item.isPinned || false,
      dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : '',
      dueTime: item.dueDate ? new Date(item.dueDate).toTimeString().slice(0, 5) : '23:59',
    });
    setShowAddDialog(true);
  };

  const handleSubmit = () => {
    const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);

    const newItem: CurriculumItem = {
      type: selectedType,
      title: formData.title,
      description: formData.description,
      scheduledDate: scheduledDateTime,
      createdAt: new Date(),
      isPublished: true,
    };

    if (selectedType === 'live-class') {
      newItem.meetingLink = formData.meetingLink;
      newItem.meetingPlatform = formData.meetingPlatform;
      newItem.duration = formData.duration;
    } else if (selectedType === 'resource') {
      newItem.resourceType = formData.resourceType;
      newItem.resourceUrl = formData.resourceUrl;
      newItem.resourceFile = formData.resourceFile;
    } else if (selectedType === 'announcement') {
      newItem.announcementType = formData.announcementType;
      newItem.validUntil = new Date(formData.validUntil);
      newItem.isPinned = formData.isPinned;
    } else if (selectedType === 'assignment' || selectedType === 'quiz') {
      newItem.dueDate = new Date(`${formData.dueDate}T${formData.dueTime}`);
    }

    if (editingItemIndex !== null) {
      // Update existing item
      setModules(prev => prev.map((module, idx) =>
        idx === activeModuleId
          ? { ...module, items: module.items.map((item, i) => i === editingItemIndex ? newItem : item).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()) }
          : module
      ));
      toast.success('Content updated successfully');
    } else {
      // Add new item
      setModules(prev => prev.map((module, idx) =>
        idx === activeModuleId
          ? { ...module, items: [...module.items, newItem].sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()) }
          : module
      ));
      toast.success('Content added successfully');
    }

    setShowAddDialog(false);
    setEditingItemIndex(null);
  };

  const confirmDeleteItem = (itemId: string | number) => {
    setDeleteConfirm({ type: 'item', id: itemId });
  };

  const handleDeleteItem = () => {
    if (deleteConfirm?.type === 'item') {
      setModules(prev => prev.map((module, idx) =>
        idx === activeModuleId
          ? { ...module, items: module.items.filter((_, itemIdx) => itemIdx !== deleteConfirm.id) }
          : module
      ));
      setDeleteConfirm(null);
      toast.success('Content deleted');
    }
  };

  const toggleItemPublish = (itemIdx: number) => {
    setModules(prev => prev.map((module, idx) =>
      idx === activeModuleId
        ? { ...module, items: module.items.map((item, i) => i === itemIdx ? { ...item, isPublished: !item.isPublished } : item) }
        : module
    ));
  };

  const toggleModulePublish = (moduleIdx: number) => {
    setModules(prev => prev.map((module, idx) =>
      idx === moduleIdx ? { ...module, isPublished: !module.isPublished } : module
    ));
  };

  const getTypeIcon = (type: CurriculumItem['type'], large = false) => {
    const size = large ? "size-10" : "size-5";
    switch (type) {
      case 'live-class': return <IconPlayerPlay className={size} />;
      case 'announcement': return <IconSpeakerphone className={size} />;
      case 'resource': return <IconBook className={size} />;
      case 'assignment': return <IconClipboardCheck className={size} />;
      case 'quiz': return <IconTarget className={size} />;
    }
  };

  const getTypeColorBg = (type: CurriculumItem['type']) => {
    switch (type) {
      case 'live-class': return 'bg-blue-500/15 text-blue-700 border-blue-200';
      case 'announcement': return 'bg-purple-500/15 text-purple-700 border-purple-200';
      case 'resource': return 'bg-green-500/15 text-green-700 border-green-200';
      case 'assignment': return 'bg-orange-500/15 text-orange-700 border-orange-200';
      case 'quiz': return 'bg-pink-500/15 text-pink-700 border-pink-200';
    }
  };

  const getResourceIcon = (resourceType?: string) => {
    switch (resourceType) {
      case 'pdf': return <IconFileText className="size-4" />;
      case 'video': return <IconVideo className="size-4" />;
      case 'youtube': return <IconBrandYoutube className="size-4" />;
      case 'recording': return <IconMicrophone className="size-4" />;
      default: return <IconBook className="size-4" />;
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return {
      day: d.getDate(),
      month: d.toLocaleString('default', { month: 'short' }).toUpperCase(),
      full: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!course) {
    return notFound();
  }

  const activeModule = modules[activeModuleId];
  const pinnedAnnouncements = modules
    .flatMap(m => m.items)
    .filter(item => item.type === 'announcement' && item.isPinned && (!item.validUntil || new Date() <= new Date(item.validUntil)));

  // Group items by date for better visual organization
  const groupedByDate: { [key: string]: CurriculumItem[] } = {};
  activeModule?.items.forEach(item => {
    const dateKey = new Date(item.scheduledDate).toISOString().split('T')[0];
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }
    groupedByDate[dateKey].push(item);
  });
  const sortedDates = Object.keys(groupedByDate).sort();

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin-dashboard/courses">
                    <IconArrowLeft className="size-4 mr-2" />
                    {t('admin.backToCourses')}
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">{course.title}</h1>
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground">{t('admin.courseDetails')}</p>
                    {saving && <Badge variant="secondary" className="text-xs">Saving...</Badge>}
                  </div>
                </div>
              </div>
              <Button asChild>
                <Link href={`/admin-dashboard/courses/edit/${courseId}`}>
                  <IconEdit className="size-4 mr-2" />
                  {t('admin.editCourse')}
                </Link>
              </Button>
            </div>

            {/* View Tabs */}
            <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
              <TabsList>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="details">Course Details</TabsTrigger>
              </TabsList>

              {/* Pinned Announcements */}
              {pinnedAnnouncements.length > 0 && activeView === 'curriculum' && (
                <Card className="border-l-4 border-l-primary bg-primary/5 mt-6">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <IconBell className="size-5 text-primary" />
                      <CardTitle className="text-base">Pinned Announcements</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {pinnedAnnouncements.map((item, idx) => (
                      <div key={idx} className="flex items-start justify-between p-3 rounded-md bg-background border">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                          {item.validUntil && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Valid until {formatDate(item.validUntil).full}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Curriculum Content */}
              <TabsContent value="curriculum" className="space-y-6 mt-6">
                {/* Module Tabs */}
                <Card>
                  <CardContent className="p-4 py-0">
                    <div className="flex items-center gap-2 overflow-x-auto">
                      {modules.map((module, idx) => (
                        <div key={idx} className="relative group">
                          <button
                            onClick={() => setActiveModuleId(idx)}
                            className={`px-4 py-2 rounded-lg border-2 whitespace-nowrap transition-all ${
                              activeModuleId === idx
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{module.name}</span>
                              {module.isPublished && <IconEye className="size-3" />}
                            </div>
                          </button>
                          {modules.length > 1 && (
                            <button
                              onClick={() => confirmDeleteModule(idx)}
                              className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <IconX className="size-3" />
                            </button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowModuleDialog(true)}
                        className="whitespace-nowrap"
                      >
                        <IconPlus className="size-4 mr-1" />
                        Add Module
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {activeModule && (
                  <>
                    {/* Module Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h2 className="text-xl font-bold">{activeModule.name}</h2>
                        {activeModule.description && (
                          <p className="text-sm text-muted-foreground mt-1">{activeModule.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={openEditModule}
                        >
                          <IconPencil className="size-4 mr-2" />
                          Edit Module
                        </Button>
                        <Button
                          variant={activeModule.isPublished ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleModulePublish(activeModuleId)}
                        >
                          <IconEye className="size-4 mr-2" />
                          {activeModule.isPublished ? 'Published' : 'Publish Module'}
                        </Button>
                      </div>
                    </div>

                    {/* Add Content Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="w-full" size="lg">
                          <IconPlus className="size-5 mr-2" />
                          Add Content
                          <IconChevronDown className="size-5 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="center">
                        <DropdownMenuItem onClick={() => handleAddContent('live-class')}>
                          <IconPlayerPlay className="size-4 mr-2" />
                          Live Class
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddContent('announcement')}>
                          <IconSpeakerphone className="size-4 mr-2" />
                          Announcement
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddContent('resource')}>
                          <IconBook className="size-4 mr-2" />
                          Resource
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddContent('assignment')}>
                          <IconClipboardCheck className="size-4 mr-2" />
                          Assignment
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddContent('quiz')}>
                          <IconTarget className="size-4 mr-2" />
                          Quiz
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Content List with Date Groups */}
                    {activeModule.items.length === 0 ? (
                      <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                          <IconCalendar className="size-12 mx-auto mb-4 opacity-50" />
                          <p className="font-medium">No content in this module yet</p>
                          <p className="text-sm">Add live classes, resources, assignments, or quizzes</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-8">
                        {sortedDates.map(dateKey => {
                          const date = new Date(dateKey);
                          const dateInfo = formatDate(date);
                          const items = groupedByDate[dateKey];

                          return (
                            <div key={dateKey} className="relative">
                              {/* Date Badge */}
                              <div className="flex items-center gap-4 mb-4">
                                <div className="flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-xl p-4 min-w-[80px] shadow-md">
                                  <span className="text-3xl font-bold">{dateInfo.day}</span>
                                  <span className="text-xs font-semibold tracking-wider">{dateInfo.month}</span>
                                </div>
                                <div className="h-px flex-1 bg-border" />
                              </div>

                              {/* Items for this date */}
                              <div className="space-y-4 ml-4 pl-8 border-l-2 border-muted">
                                {items.map((item, itemIdx) => {
                                  const actualItemIdx = activeModule.items.findIndex(i => i === item);
                                  return (
                                    <Card key={actualItemIdx} className={`border-2 overflow-hidden ${getTypeColorBg(item.type)}`}>
                                      <CardContent className="p-0">
                                        <div className="flex items-start gap-0">
                                          {/* Icon Section */}
                                          <div className="flex items-center justify-center p-6 border-r-2 border-current/20">
                                            {getTypeIcon(item.type, true)}
                                          </div>

                                          {/* Content Section */}
                                          <div className="flex-1 p-5">
                                            <div className="flex items-start justify-between gap-4">
                                              <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                  <Badge variant="outline" className="text-xs font-semibold capitalize">
                                                    {item.type.replace('-', ' ')}
                                                  </Badge>
                                                  <span className="text-xs font-medium opacity-75">
                                                    {formatTime(item.scheduledDate)}
                                                  </span>
                                                  {!item.isPublished && (
                                                    <Badge variant="secondary" className="text-xs">Draft</Badge>
                                                  )}
                                                </div>
                                                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                                {item.description && (
                                                  <p className="text-sm mb-3 opacity-90">{item.description}</p>
                                                )}

                                                {/* Type-specific details */}
                                                <div className="flex items-center gap-3 flex-wrap">
                                                  {item.type === 'live-class' && (
                                                    <>
                                                      <Badge variant="secondary" className="text-xs font-medium">
                                                        <IconClock className="size-3 mr-1" />
                                                        {item.duration} mins
                                                      </Badge>
                                                      {item.meetingLink && (
                                                        <a
                                                          href={item.meetingLink}
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                          className="text-xs font-medium hover:underline flex items-center gap-1"
                                                        >
                                                          <IconLink className="size-3" />
                                                          Join {item.meetingPlatform === 'zoom' ? 'Zoom' : item.meetingPlatform === 'google-meet' ? 'Google Meet' : 'Meeting'}
                                                        </a>
                                                      )}
                                                    </>
                                                  )}

                                                  {item.type === 'resource' && (
                                                    <>
                                                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                                                        {getResourceIcon(item.resourceType)}
                                                        <span className="capitalize">{item.resourceType}</span>
                                                      </Badge>
                                                      {(item.resourceUrl || item.resourceFile) && (
                                                        <a
                                                          href={item.resourceUrl}
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                          className="text-xs font-medium hover:underline flex items-center gap-1"
                                                        >
                                                          <IconDownload className="size-3" />
                                                          Download
                                                        </a>
                                                      )}
                                                    </>
                                                  )}

                                                  {(item.type === 'assignment' || item.type === 'quiz') && item.dueDate && (
                                                    <Badge variant="outline" className="text-xs">
                                                      <IconClock className="size-3 mr-1" />
                                                      Due: {formatDate(item.dueDate).full} {formatTime(item.dueDate)}
                                                    </Badge>
                                                  )}

                                                  {item.type === 'announcement' && item.announcementType !== 'general' && (
                                                    <Badge
                                                      variant={item.announcementType === 'cancellation' ? 'destructive' : 'default'}
                                                      className="text-xs capitalize"
                                                    >
                                                      {item.announcementType}
                                                    </Badge>
                                                  )}
                                                </div>
                                              </div>

                                              {/* Actions */}
                                              <div className="flex gap-1">
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => handleEditContent(actualItemIdx)}
                                                >
                                                  <IconPencil className="size-4" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => toggleItemPublish(actualItemIdx)}
                                                >
                                                  <IconEye className={`size-4 ${item.isPublished ? 'text-green-600' : 'text-muted-foreground'}`} />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => confirmDeleteItem(actualItemIdx)}
                                                >
                                                  <IconTrash className="size-4 text-destructive" />
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              {/* Course Details Tab */}
              <TabsContent value="details" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t('admin.courseOverview')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed">{course.description}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Course Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg border">
                              <span className="text-sm font-medium">Level</span>
                              <Badge variant="secondary">{translateLevel(course.level)}</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border">
                              <span className="text-sm font-medium">Category</span>
                              <Badge variant="outline">{translateCategory(course.category)}</Badge>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg border">
                              <span className="text-sm font-medium">Difficulty</span>
                              <Badge variant="outline">{course.difficulty}/10</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border">
                              <span className="text-sm font-medium">Duration</span>
                              <Badge variant="outline">{course.estimatedDuration} mins</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    {course.tags && course.tags.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Tags</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {course.tags.map((tag: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Status</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <span className="text-sm font-medium">Publication</span>
                          <Badge variant={course.isPublished ? "default" : "secondary"}>
                            {course.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <span className="text-sm font-medium">Access</span>
                          <Badge variant={course.isPremium ? "default" : "outline"}>
                            {course.isPremium ? 'Premium' : 'Free'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>

      {/* Add Module Dialog */}
      <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Module</DialogTitle>
            <DialogDescription>Create a new module to organize your course content</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="module-name">Module Name *</Label>
              <Input
                id="module-name"
                placeholder={`Module ${modules.length + 1}`}
                value={moduleForm.name}
                onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="module-desc">Description</Label>
              <Textarea
                id="module-desc"
                placeholder="What will students learn in this module?"
                rows={3}
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModuleDialog(false)}>Cancel</Button>
            <Button onClick={handleAddModule}>Add Module</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Module Dialog */}
      <Dialog open={showEditModuleDialog} onOpenChange={setShowEditModuleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
            <DialogDescription>Update module information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-module-name">Module Name *</Label>
              <Input
                id="edit-module-name"
                value={moduleForm.name}
                onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-module-desc">Description</Label>
              <Textarea
                id="edit-module-desc"
                placeholder="What will students learn in this module?"
                rows={3}
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModuleDialog(false)}>Cancel</Button>
            <Button onClick={handleEditModule}>Update Module</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Content Dialog - Continues in next message due to length */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getTypeIcon(selectedType)}
              {editingItemIndex !== null ? 'Edit' : 'Add'} {selectedType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </DialogTitle>
            <DialogDescription>
              {editingItemIndex !== null ? 'Update' : 'Add new'} content to {activeModule?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder={
                  selectedType === 'live-class' ? 'e.g., Introduction to Hiragana' :
                  selectedType === 'announcement' ? 'e.g., Class Cancelled Today' :
                  selectedType === 'resource' ? 'e.g., Lecture Notes PDF' :
                  selectedType === 'assignment' ? 'e.g., Practice Exercise' :
                  'e.g., Chapter Quiz'
                }
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide more details..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                />
              </div>
            </div>

            {selectedType === 'live-class' && (
              <>
                <div>
                  <Label htmlFor="platform">Platform *</Label>
                  <select
                    id="platform"
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.meetingPlatform}
                    onChange={(e) => setFormData({ ...formData, meetingPlatform: e.target.value as any })}
                  >
                    <option value="zoom">Zoom</option>
                    <option value="google-meet">Google Meet</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="meetingLink">Meeting Link *</Label>
                  <Input
                    id="meetingLink"
                    type="url"
                    placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    step="15"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  />
                </div>
              </>
            )}

            {selectedType === 'resource' && (
              <>
                <div>
                  <Label htmlFor="resourceType">Resource Type *</Label>
                  <select
                    id="resourceType"
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.resourceType}
                    onChange={(e) => setFormData({ ...formData, resourceType: e.target.value as any })}
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="video">Video File</option>
                    <option value="youtube">YouTube Video</option>
                    <option value="recording">Class Recording</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {formData.resourceType !== 'youtube' ? (
                  <div>
                    <Label htmlFor="file-upload">Upload File</Label>
                    <div className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept={formData.resourceType === 'pdf' ? '.pdf' : 'video/*'}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex-1"
                      >
                        <IconUpload className="size-4 mr-2" />
                        {uploading ? 'Uploading...' : formData.resourceFile ? 'Change File' : 'Upload File'}
                      </Button>
                      {formData.resourceFile && (
                        <Badge variant="secondary" className="self-center">
                          {formData.resourceFile}
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="resourceUrl">YouTube URL *</Label>
                    <Input
                      id="resourceUrl"
                      type="url"
                      placeholder="https://youtube.com/..."
                      value={formData.resourceUrl}
                      onChange={(e) => setFormData({ ...formData, resourceUrl: e.target.value })}
                    />
                  </div>
                )}

                {formData.resourceType === 'other' && !formData.resourceFile && (
                  <div>
                    <Label htmlFor="resourceUrl">Resource URL</Label>
                    <Input
                      id="resourceUrl"
                      type="url"
                      placeholder="https://..."
                      value={formData.resourceUrl}
                      onChange={(e) => setFormData({ ...formData, resourceUrl: e.target.value })}
                    />
                  </div>
                )}
              </>
            )}

            {selectedType === 'announcement' && (
              <>
                <div>
                  <Label htmlFor="announcementType">Type</Label>
                  <select
                    id="announcementType"
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.announcementType}
                    onChange={(e) => setFormData({ ...formData, announcementType: e.target.value as any })}
                  >
                    <option value="general">General</option>
                    <option value="important">Important</option>
                    <option value="cancellation">Class Cancellation</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPinned"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="isPinned" className="cursor-pointer">
                    Pin to top (visible in all modules)
                  </Label>
                </div>
              </>
            )}

            {(selectedType === 'assignment' || selectedType === 'quiz') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="dueTime">Due Time *</Label>
                  <Input
                    id="dueTime"
                    type="time"
                    value={formData.dueTime}
                    onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!formData.title || uploading}>
              {uploading ? 'Uploading...' : editingItemIndex !== null ? 'Update Content' : 'Add Content'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this {deleteConfirm?.type}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm?.type === 'module') {
                  handleDeleteModule();
                } else {
                  handleDeleteItem();
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
