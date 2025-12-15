'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';
import ResourceForm from '@/components/admin/ResourceForm';
import ResourceList from '@/components/admin/ResourceList';
import { toast } from 'sonner';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

// Additional icons
import {
  IconArrowLeft,
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconPlayerPlay,
  IconSpeakerphone,
  IconBook,
  IconClipboardCheck,
  IconTarget,
  IconClock,
  IconLink,
  IconDownload,
  IconBell,
  IconCalendar,
  IconChevronDown,
  IconX,
  IconPencil,
  IconCheck,
  IconSettings,
  IconPaperclip,
  IconUpload,
  IconFileText,
  IconVideo,
  IconBrandYoutube,
  IconMicrophone,
} from '@tabler/icons-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Module {
  name: string;
  description: string;
  items: CurriculumItem[];
  isPublished: boolean;
  order: number;
}

interface CurriculumItem {
  type: 'live-class' | 'announcement' | 'resource' | 'assignment' | 'quiz';
  title: string;
  description?: string;
  scheduledDate?: Date;
  createdAt?: Date;
  isPublished: boolean;
  meetingLink?: string;
  meetingPlatform?: 'zoom' | 'google-meet' | 'other';
  duration?: number;
  resourceType?: 'pdf' | 'image' | 'video' | 'youtube' | 'drive' | 'recording' | 'other';
  resourceUrl?: string;
  resourceFile?: string;
  announcementType?: 'important' | 'cancellation' | 'general';
  validUntil?: Date;
  isPinned?: boolean;
  dueDate?: Date;
  attachments?: Array<{ url: string; name: string; type: string }>;
  driveLinks?: Array<{ link: string; title: string }>;
}

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useLanguage();
  const [courseId, setCourseId] = useState('');
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [activeModuleId, setActiveModuleId] = useState(0);
  const [activeView, setActiveView] = useState<'curriculum' | 'resources' | 'details'>('curriculum');
  const [activeTab, setActiveTab] = useState('curriculum');
  
  // Resource refresh state for file upload persistence
  const [resourceRefreshKey, setResourceRefreshKey] = useState(0);

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

  // Temporary state for adding drive links
  const [tempDriveLink, setTempDriveLink] = useState('');
  const [tempDriveTitle, setTempDriveTitle] = useState('');

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
    resourceType: 'pdf' as 'pdf' | 'image' | 'video' | 'youtube' | 'drive' | 'recording' | 'other',
    resourceUrl: '',
    resourceFile: '',
    announcementType: 'general' as 'important' | 'cancellation' | 'general',
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isPinned: false,
    dueDate: '',
    dueTime: '23:59',
    attachments: [] as Array<{ url: string; name: string; type: string }>,
    driveLinks: [] as Array<{ link: string; title: string }>,
  });

  // Use ref to always have latest formData in callbacks
  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Quiz specific states
  const [quizForm, setQuizForm] = useState({
    quizType: 'mcq' as 'mcq' | 'open-ended',
    timeLimit: 30,
    totalPoints: 0,
    passingScore: 60,
    allowMultipleAttempts: false,
    showAnswersAfterSubmission: true,
    randomizeQuestions: false,
    randomizeOptions: false,
    mcqQuestions: [] as Array<{
      question: string;
      options: Array<{ text: string; isCorrect: boolean }>;
      points: number;
      explanation: string;
    }>,
    openEndedQuestion: '',
    openEndedQuestionFile: '',
    acceptFileUpload: true,
    acceptTextAnswer: true,
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
    points: 1,
    explanation: '',
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

  // Auto-save curriculum when modules change
  useEffect(() => {
    if (!courseId || loading) return; // Don't save during initial load

    const timer = setTimeout(async () => {
      try {
        // DEBUG: Log the raw modules state
        console.log('=== AUTO-SAVE TRIGGERED ===');
        console.log('Raw modules state:', modules);
        console.log('Modules JSON:', JSON.stringify(modules, null, 2));
        
        // Check each item for attachments
        modules.forEach((mod, modIdx) => {
          mod.items?.forEach((item, itemIdx) => {
            console.log(`[AutoSave] Module ${modIdx} Item ${itemIdx}: type=${item.type}, attachments=${JSON.stringify(item.attachments)}`);
          });
        });
        
        // Deep clone modules to ensure attachments are included
        const modulesToSave = JSON.parse(JSON.stringify(modules));
        console.log('Auto-saving curriculum with modules:', modulesToSave);
        
        // Log each item's attachments for debugging
        modulesToSave.forEach((mod: any, modIdx: number) => {
          mod.items?.forEach((item: any, itemIdx: number) => {
            if (item.attachments && item.attachments.length > 0) {
              console.log(`Module ${modIdx} Item ${itemIdx} attachments:`, item.attachments);
            }
          });
        });
        
        const response = await fetch(`/api/admin/courses/${courseId}/curriculum`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            curriculum: { modules: modulesToSave }
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Curriculum auto-saved successfully:', result);
          toast.success('Curriculum saved!');
        } else {
          const error = await response.json();
          console.error('Auto-save failed:', error);
          toast.error('Auto-save failed!');
        }
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    }, 1000); // Debounce 1 second

    return () => clearTimeout(timer);
  }, [modules, courseId, loading]);

  const testApiConnection = async () => {
    try {
      console.log('Testing API connection...');
      const response = await fetch(`/api/admin/courses/${courseId}/curriculum`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      console.log('API test result:', result);
      toast.success('API connection works!');
    } catch (error) {
      console.error('API test failed:', error);
      toast.error('API connection failed');
    }
  };

  const saveCurriculum = async () => {
    try {
      setSaving(true);
      console.log('Saving curriculum for course:', courseId);
      
      // Deep clone modules to ensure all nested data including attachments is captured
      const modulesToSave = JSON.parse(JSON.stringify(modules));
      console.log('Modules to save:', modulesToSave);

      const requestBody = { curriculum: { modules: modulesToSave } };
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(`/api/admin/courses/${courseId}/curriculum`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.error('Response not OK. Status:', response.status, 'StatusText:', response.statusText);
        const responseText = await response.text();
        console.error('Raw response text:', responseText);

        let errorData = {};
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          console.error('Failed to parse response as JSON:', e);
        }

        console.error('Server error response:', errorData);
        throw new Error((errorData as any)?.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Save successful:', result);
      toast.success('Curriculum saved successfully');
    } catch (error) {
      console.error('Error saving curriculum:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to save curriculum: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  // Removed duplicate auto-save - using only the first useEffect for auto-save

  const handleAddModule = () => {
    // Use POST endpoint to add module
    (async () => {
      try {
        const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: moduleForm.name || `Module ${modules.length + 1}`, description: moduleForm.description }),
        });
        if (response.ok) {
          // Reload curriculum from backend
          const curriculumResponse = await fetch(`/api/admin/courses/${courseId}/curriculum`);
          if (curriculumResponse.ok) {
            const curriculumData = await curriculumResponse.json();
            if (curriculumData.curriculum?.modules) {
              setModules(curriculumData.curriculum.modules);
              setActiveModuleId(curriculumData.curriculum.modules.length - 1);
            }
          }
          toast.success('Module added!');
        } else {
          toast.error('Failed to add module');
        }
      } catch (err) {
        toast.error('Error adding module');
      } finally {
        setShowModuleDialog(false);
        setModuleForm({ name: '', description: '' });
      }
    })();
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
    const files = event.target.files;
    if (!files || files.length === 0) return;

    console.log('handleFileUpload - files selected:', files.length);

    try {
      setUploading(true);
      const uploadedFiles: Array<{ url: string; name: string; type: string }> = [];

      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Uploading file ${i + 1}/${files.length}:`, file.name);
        
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        formDataUpload.append('type', selectedType === 'resource' && formData.resourceType === 'video' ? 'video' : 'document');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        });

        if (!response.ok) {
          console.error(`Upload failed for ${file.name}:`, response.status);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        const data = await response.json();
        console.log(`Upload successful for ${file.name}:`, data);
        uploadedFiles.push({
          url: data.url,
          name: file.name,
          type: file.type
        });
      }

      if (uploadedFiles.length > 0) {
        const newAttachments = [...(formDataRef.current.attachments || []), ...uploadedFiles];

        // Update formData state
        setFormData(prev => {
          const updated = {
            ...prev,
            attachments: newAttachments
          };
          console.log('Updated formData.attachments:', updated.attachments);
          return updated;
        });

        // CRITICAL: Update ref immediately so handleSubmit gets the latest attachments
        formDataRef.current = { ...formDataRef.current, attachments: newAttachments };

        toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);

        // If editing an existing item, update modules state and save to backend
        if (showAddDialog && editingItemIndex !== null) {
          // Update modules state first
          const updatedModules = modules.map((module, idx) => {
            if (idx !== activeModuleId) return module;
            return {
              ...module,
              items: module.items.map((item, i) =>
                i === editingItemIndex
                  ? { ...item, attachments: newAttachments }
                  : item
              )
            };
          });
          
          setModules(updatedModules);
          
          // Save to backend immediately after state update
          (async () => {
            try {
              console.log('=== SAVING ATTACHMENTS TO BACKEND ===');
              console.log('Course ID:', courseId);
              console.log('Module index:', activeModuleId);
              console.log('Item index:', editingItemIndex);
              console.log('New attachments:', JSON.stringify(newAttachments, null, 2));
              
              const response = await fetch(`/api/admin/courses/${courseId}/curriculum`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ curriculum: { modules: updatedModules } }),
              });
              
              if (response.ok) {
                const result = await response.json();
                console.log('Backend save successful:', result);
                toast.success('Files saved to database!');
                
                // Verify the save by fetching back
                const verifyResponse = await fetch(`/api/admin/courses/${courseId}/curriculum`);
                if (verifyResponse.ok) {
                  const verifyData = await verifyResponse.json();
                  const savedAttachments = verifyData.curriculum?.modules?.[activeModuleId]?.items?.[editingItemIndex]?.attachments;
                  console.log('Verified attachments from backend:', savedAttachments);
                  if (savedAttachments?.length !== newAttachments.length) {
                    console.error('MISMATCH: Saved attachments count does not match!');
                    toast.error('Warning: Files may not be saved properly!');
                  }
                }
              } else {
                const error = await response.text();
                console.error('Backend save failed:', response.status, error);
                toast.error('Failed to save files to database!');
              }
            } catch (err) {
              console.error('Error saving attachments:', err);
              toast.error('Error saving files to database!');
            }
          })();
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
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
      attachments: [],
      driveLinks: [],
    });

    // Reset temp drive link inputs
    setTempDriveLink('');
    setTempDriveTitle('');

    // Reset quiz form when adding new quiz
    if (type === 'quiz') {
      setQuizForm({
        quizType: 'mcq',
        timeLimit: 30,
        totalPoints: 0,
        passingScore: 60,
        allowMultipleAttempts: false,
        showAnswersAfterSubmission: true,
        randomizeQuestions: false,
        randomizeOptions: false,
        mcqQuestions: [],
        openEndedQuestion: '',
        openEndedQuestionFile: '',
        acceptFileUpload: true,
        acceptTextAnswer: true,
      });
      setCurrentQuestion({
        question: '',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
        points: 1,
        explanation: '',
      });
    }
  };

  const handleEditContent = (itemIdx: number) => {
    const item = modules[activeModuleId].items[itemIdx];
    setSelectedType(item.type);
    setEditingItemIndex(itemIdx);

    const schedDate = item.scheduledDate ? new Date(item.scheduledDate) : new Date();
    
    // Safely parse dueDate
    let dueDateStr = '';
    let dueTimeStr = '23:59';
    if (item.dueDate) {
      try {
        const dueDateTime = new Date(item.dueDate);
        if (!isNaN(dueDateTime.getTime())) {
          dueDateStr = dueDateTime.toISOString().split('T')[0];
          dueTimeStr = dueDateTime.toTimeString().slice(0, 5);
        }
      } catch (e) {
        console.error('Invalid dueDate:', item.dueDate);
      }
    }

    // Safely parse validUntil
    let validUntilStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    if (item.validUntil) {
      try {
        const validUntilDate = new Date(item.validUntil);
        if (!isNaN(validUntilDate.getTime())) {
          validUntilStr = validUntilDate.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error('Invalid validUntil:', item.validUntil);
      }
    }

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
      validUntil: validUntilStr,
      isPinned: item.isPinned || false,
      dueDate: dueDateStr,
      dueTime: dueTimeStr,
      attachments: (item as any).attachments || [],
      driveLinks: (item as any).driveLinks || [],
    });

    // Load quiz data if editing a quiz
    if (item.type === 'quiz' && (item as any).quizData) {
      const quizData = (item as any).quizData;
      setQuizForm({
        quizType: quizData.quizType || 'mcq',
        timeLimit: quizData.timeLimit || 30,
        totalPoints: quizData.totalPoints || 0,
        passingScore: quizData.passingScore || 60,
        allowMultipleAttempts: quizData.allowMultipleAttempts || false,
        showAnswersAfterSubmission: quizData.showAnswersAfterSubmission !== false,
        randomizeQuestions: quizData.randomizeQuestions || false,
        randomizeOptions: quizData.randomizeOptions || false,
        mcqQuestions: quizData.mcqQuestions || [],
        openEndedQuestion: quizData.openEndedQuestion || '',
        openEndedQuestionFile: quizData.openEndedQuestionFile || '',
        acceptFileUpload: quizData.acceptFileUpload !== false,
        acceptTextAnswer: quizData.acceptTextAnswer !== false,
      });
    }

    // Load assignment data if editing an assignment
    if (item.type === 'assignment' && (item as any).quizData) {
      const assignmentData = (item as any).quizData;
      setQuizForm({
        ...quizForm,
        totalPoints: assignmentData.totalPoints || 100,
        acceptTextAnswer: assignmentData.acceptTextAnswer !== false,
        acceptFileUpload: assignmentData.acceptFileUpload !== false,
      });
    }

    setShowAddDialog(true);
  };

  const handleSubmit = () => {
    // Use ref to get latest formData (avoid stale closure)
    const currentFormData = formDataRef.current;
    const scheduledDateTime = new Date(`${currentFormData.scheduledDate}T${currentFormData.scheduledTime}`);
    const attachmentsCopy = currentFormData.attachments ? JSON.parse(JSON.stringify(currentFormData.attachments)) : [];
    const driveLinksCopy = currentFormData.driveLinks ? JSON.parse(JSON.stringify(currentFormData.driveLinks)) : [];

    console.log('=== HANDLE SUBMIT DEBUG ===');
    console.log('Current formData attachments:', currentFormData.attachments);
    console.log('Attachments copy:', attachmentsCopy);
    console.log('Selected type:', selectedType);
    console.log('Editing item index:', editingItemIndex);

    // Build newItem as before
    const newItem: CurriculumItem = {
      type: selectedType,
      title: currentFormData.title,
      description: currentFormData.description,
      scheduledDate: scheduledDateTime,
      createdAt: new Date(),
      isPublished: true,
      attachments: attachmentsCopy,
      driveLinks: driveLinksCopy,
    };
    
    console.log('New item attachments:', newItem.attachments);
    if (selectedType === 'live-class') {
      newItem.meetingLink = currentFormData.meetingLink;
      newItem.meetingPlatform = currentFormData.meetingPlatform;
      newItem.duration = currentFormData.duration;
    } else if (selectedType === 'resource') {
      newItem.resourceType = currentFormData.resourceType as 'pdf' | 'image' | 'video' | 'youtube' | 'drive' | 'recording' | 'other';
      newItem.resourceUrl = currentFormData.resourceUrl;
      newItem.resourceFile = currentFormData.resourceFile;
    } else if (selectedType === 'announcement') {
      newItem.announcementType = currentFormData.announcementType;
      newItem.validUntil = new Date(currentFormData.validUntil);
      newItem.isPinned = currentFormData.isPinned;
    } else if (selectedType === 'assignment' || selectedType === 'quiz') {
      newItem.dueDate = new Date(`${currentFormData.dueDate}T${currentFormData.dueTime}`);
      if (selectedType === 'assignment') {
        newItem.resourceUrl = currentFormData.resourceUrl;
        newItem.resourceFile = currentFormData.resourceFile;
        (newItem as any).quizData = {
          totalPoints: quizForm.totalPoints || 100,
          acceptTextAnswer: quizForm.acceptTextAnswer,
          acceptFileUpload: quizForm.acceptFileUpload,
        };
      }
    }
    if (selectedType === 'quiz') {
      (newItem as any).quizData = {
        quizType: quizForm.quizType,
        timeLimit: quizForm.timeLimit,
        totalPoints: quizForm.totalPoints,
        passingScore: quizForm.passingScore,
        allowMultipleAttempts: quizForm.allowMultipleAttempts,
        showAnswersAfterSubmission: quizForm.showAnswersAfterSubmission,
        randomizeQuestions: quizForm.randomizeQuestions,
        randomizeOptions: quizForm.randomizeOptions,
        ...(quizForm.quizType === 'mcq' ? {
          mcqQuestions: quizForm.mcqQuestions
        } : {
          openEndedQuestion: quizForm.openEndedQuestion,
          openEndedQuestionFile: quizForm.openEndedQuestionFile,
          acceptFileUpload: quizForm.acceptFileUpload,
          acceptTextAnswer: quizForm.acceptTextAnswer,
        })
      };
      if (quizForm.quizType === 'mcq' && quizForm.mcqQuestions.length === 0) {
        toast.error('Please add at least one question to the quiz');
        return;
      }
      if (quizForm.quizType === 'open-ended' && !quizForm.openEndedQuestion && !quizForm.openEndedQuestionFile) {
        toast.error('Please add a question or upload a question file');
        return;
      }
    }

    // If editing, update local state and PUT as before
    if (editingItemIndex !== null) {
      setModules(prev => {
        const updated = prev.map((module, idx) =>
          idx === activeModuleId
            ? { ...module, items: module.items.map((item, i) => i === editingItemIndex ? newItem : item).sort((a, b) => new Date(a.scheduledDate || 0).getTime() - new Date(b.scheduledDate || 0).getTime()) }
            : module
        );
        
        // Save to backend immediately with the updated modules
        setTimeout(async () => {
          try {
            const modulesToSave = JSON.parse(JSON.stringify(updated));
            console.log('Saving edited item with attachments:', modulesToSave[activeModuleId].items[editingItemIndex].attachments);
            const response = await fetch(`/api/admin/courses/${courseId}/curriculum`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ curriculum: { modules: modulesToSave } }),
            });
            if (response.ok) {
              console.log('Edit saved successfully to backend');
            }
          } catch (err) {
            console.error('Failed to save edit:', err);
          }
        }, 100);
        
        return updated;
      });
      toast.success('Content updated successfully');
      setShowAddDialog(false);
      setEditingItemIndex(null);
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
        attachments: [],
        driveLinks: [],
      });
      return;
    }

    // For new resource, POST to /resources endpoint
    (async () => {
      try {
        let postUrl = '';
        let postBody: any = {};
        if (selectedType === 'resource') {
          postUrl = `/api/admin/courses/${courseId}/resources`;
          postBody = { moduleIndex: activeModuleId, resource: newItem };
        } else if (selectedType === 'live-class' || selectedType === 'announcement' || selectedType === 'assignment' || selectedType === 'quiz') {
          // Fallback: still use curriculum PUT for now
          setModules(prev => {
            const updated = prev.map((module, idx) =>
              idx === activeModuleId
                ? { ...module, items: [...module.items, newItem].sort((a, b) => new Date(a.scheduledDate || 0).getTime() - new Date(b.scheduledDate || 0).getTime()) }
                : module
            );
            
            // Save to backend immediately with the updated modules
            setTimeout(async () => {
              try {
                const modulesToSave = JSON.parse(JSON.stringify(updated));
                console.log('Saving new item with attachments:', newItem.attachments);
                const response = await fetch(`/api/admin/courses/${courseId}/curriculum`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ curriculum: { modules: modulesToSave } }),
                });
                if (response.ok) {
                  console.log('New item saved successfully to backend');
                }
              } catch (err) {
                console.error('Failed to save new item:', err);
              }
            }, 100);
            
            return updated;
          });
          toast.success('Content added successfully');
          setShowAddDialog(false);
          setEditingItemIndex(null);
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
            attachments: [],
            driveLinks: [],
          });
          return;
        }
        if (postUrl) {
          const response = await fetch(postUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postBody),
          });
          if (response.ok) {
            // Reload curriculum from backend
            const curriculumResponse = await fetch(`/api/admin/courses/${courseId}/curriculum`);
            if (curriculumResponse.ok) {
              const curriculumData = await curriculumResponse.json();
              if (curriculumData.curriculum?.modules) {
                setModules(curriculumData.curriculum.modules);
              }
            }
            toast.success('Resource added!');
          } else {
            toast.error('Failed to add resource');
          }
        }
      } catch (err) {
        toast.error('Error adding resource');
      } finally {
        setShowAddDialog(false);
        setEditingItemIndex(null);
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
          attachments: [],
          driveLinks: [],
        });
      }
    })();
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

  // Quiz helper functions
  const handleAddMCQQuestion = () => {
    console.log('Current Question State:', currentQuestion);
    
    if (!currentQuestion.question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    const filledOptions = currentQuestion.options.filter(opt => opt.text.trim());
    console.log('Filled Options:', filledOptions);
    
    if (filledOptions.length < 2) {
      toast.error(`Please fill in text for at least 2 options. Currently have ${filledOptions.length} filled options.`);
      return;
    }

    const hasCorrectAnswer = filledOptions.some(opt => opt.isCorrect);
    if (!hasCorrectAnswer) {
      toast.error('Please mark at least one correct answer with filled text');
      return;
    }

    const newQuestion = {
      question: currentQuestion.question,
      options: currentQuestion.options.filter(opt => opt.text.trim()),
      points: currentQuestion.points,
      explanation: currentQuestion.explanation,
    };

    setQuizForm(prev => ({
      ...prev,
      mcqQuestions: [...prev.mcqQuestions, newQuestion],
      totalPoints: prev.totalPoints + currentQuestion.points,
    }));

    // Reset current question
    setCurrentQuestion({
      question: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
      points: 1,
      explanation: '',
    });

    toast.success('Question added');
  };

  const handleRemoveMCQQuestion = (index: number) => {
    const questionPoints = quizForm.mcqQuestions[index].points;
    setQuizForm(prev => ({
      ...prev,
      mcqQuestions: prev.mcqQuestions.filter((_, i) => i !== index),
      totalPoints: prev.totalPoints - questionPoints,
    }));
    toast.success('Question removed');
  };

  const handleOptionChange = (optionIndex: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    console.log(`Option ${optionIndex} ${field} changed to:`, value);
    setCurrentQuestion(prev => {
      const updated = {
        ...prev,
        options: prev.options.map((opt, i) =>
          i === optionIndex ? { ...opt, [field]: value } : opt
        ),
      };
      console.log('Updated currentQuestion:', updated);
      return updated;
    });
  };

  const handleAddOption = () => {
    if (currentQuestion.options.length >= 6) {
      toast.error('Maximum 6 options allowed');
      return;
    }
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...prev.options, { text: '', isCorrect: false }],
    }));
  };

  const handleRemoveOption = (index: number) => {
    if (currentQuestion.options.length <= 2) {
      toast.error('Minimum 2 options required');
      return;
    }
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
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
    const dateKey = item.scheduledDate ? new Date(item.scheduledDate).toISOString().split('T')[0] : 'no-date';
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
                        <div key={idx} className="relative group flex items-center gap-1">
                          <button
                            onClick={() => setActiveModuleId(idx)}
                            className={`px-4 py-2 rounded-lg border-2 whitespace-nowrap transition-all ${activeModuleId === idx
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border hover:border-primary/50'
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{module.name}</span>
                              {module.isPublished && <IconEye className="size-3" />}
                            </div>
                          </button>
                          {/* Edit module button */}
                          <button
                            onClick={() => {
                              setModuleForm({ name: module.name, description: module.description });
                              setActiveModuleId(idx);
                              setShowEditModuleDialog(true);
                            }}
                            className="p-1 ml-1 rounded-full bg-muted text-muted-foreground hover:bg-primary/10"
                            title="Edit module"
                          >
                            <IconPencil className="size-3" />
                          </button>
                          {/* Delete module button */}
                          {modules.length > 1 && (
                            <button
                              onClick={() => confirmDeleteModule(idx)}
                              className="p-1 ml-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/80"
                              title="Delete module"
                            >
                              <IconTrash className="size-3" />
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
                                                    {item.scheduledDate ? formatTime(item.scheduledDate) : ''}
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

                                                  {item.type === 'quiz' && (item as any).quizData && (
                                                    <Badge variant="secondary" className="text-xs">
                                                      {(item as any).quizData.quizType === 'mcq' ? 'MCQ' : 'Open-Ended'}
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
                                                {item.type === 'quiz' && (item as any).quizData?.quizType === 'open-ended' && (
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                  >
                                                    <Link href={`/admin-dashboard/courses/${courseId}/quiz/${activeModuleId}/${actualItemIdx}/grade`}>
                                                      <IconClipboardCheck className="size-4" />
                                                    </Link>
                                                  </Button>
                                                )}
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
                {/* File Upload Section - Accept any file type */}
                <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center gap-2">
                    <IconPaperclip className="size-5" />
                    <h3 className="font-semibold">Attach Files</h3>
                  </div>
                  <div className="pt-3 border-t">
                    <Label>Upload Files (PDF, Image, Video, etc.)</Label>
                    {formData.attachments && formData.attachments.length > 0 && (
                      <div className="space-y-2 mt-3 mb-3">
                        <p className="text-sm font-medium">Uploaded Files ({formData.attachments.length})</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {formData.attachments.map((file, index) => {
                            const isImage = file.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
                            const isVideo = file.url.match(/\.(mp4|webm|avi|mov)$/i);
                            return (
                              <div key={index} className="relative border rounded-lg p-2 group">
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      attachments: formData.attachments.filter((_, i) => i !== index)
                                    });
                                  }}
                                >
                                  <IconX className="h-3 w-3" />
                                </Button>
                                {isImage ? (
                                  <img 
                                    src={file.url} 
                                    alt={file.name}
                                    className="w-full h-20 object-cover rounded"
                                  />
                                ) : isVideo ? (
                                  <video controls className="w-full h-20 object-cover rounded">
                                    <source src={file.url} type={file.type} />
                                    Your browser does not support the video tag.
                                  </video>
                                ) : (
                                  <div className="flex items-center justify-center h-20 bg-muted rounded">
                                    <IconFileText className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                )}
                                <p className="text-xs mt-1 truncate" title={file.name}>
                                  {file.name}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="*/*"
                        multiple
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex-1"
                      >
                        <IconUpload className="size-4 mr-2" />
                        {uploading ? 'Uploading...' : formData.attachments.length > 0 ? 'Add More Files' : 'Upload Files'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      You can select multiple files. Accepted: PDF, images, videos, documents, etc.
                    </p>
                  </div>
                </div>

                {/* Drive Link Section */}
                <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center gap-2">
                    <IconLink className="size-5" />
                    <h3 className="font-semibold">Add Drive / External Links</h3>
                  </div>
                  <div className="pt-3 border-t space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="driveLinkTitle">Link Title</Label>
                        <Input
                          id="driveLinkTitle"
                          type="text"
                          placeholder="e.g., Lecture Video - Part 1"
                          value={tempDriveTitle}
                          onChange={(e) => setTempDriveTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="driveLinkUrl">Link URL *</Label>
                        <Input
                          id="driveLinkUrl"
                          type="url"
                          placeholder="https://drive.google.com/..."
                          value={tempDriveLink}
                          onChange={(e) => setTempDriveLink(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          if (!tempDriveLink || !tempDriveLink.trim()) {
                            toast.error('Please enter a link URL');
                            return;
                          }
                          const title = tempDriveTitle && tempDriveTitle.trim() ? tempDriveTitle.trim() : tempDriveLink.trim();
                          const linkObj = { link: tempDriveLink.trim(), title };
                          setFormData(prev => ({ ...prev, driveLinks: [...(prev.driveLinks || []), linkObj] }));
                          formDataRef.current = { ...formDataRef.current, driveLinks: [...(formDataRef.current.driveLinks || []), linkObj] };
                          setTempDriveLink('');
                          setTempDriveTitle('');
                          toast.success('Link added');
                        }}
                      >
                        <IconPlus className="size-4 mr-1" />
                        Add Link
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => { setTempDriveLink(''); setTempDriveTitle(''); }}
                      >
                        Clear
                      </Button>
                    </div>

                    {formData.driveLinks && formData.driveLinks.length > 0 && (
                      <div className="space-y-2 pt-2 border-t">
                        <p className="text-sm font-medium">Added Links ({formData.driveLinks.length})</p>
                        <div className="space-y-2">
                          {formData.driveLinks.map((dl, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-2 p-2 border rounded-lg bg-white">
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-sm truncate" title={dl.title}>{dl.title}</p>
                                <a 
                                  href={dl.link} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-xs text-primary hover:underline truncate block"
                                >
                                  {dl.link}
                                </a>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, driveLinks: prev.driveLinks.filter((_, i) => i !== idx) }));
                                  formDataRef.current = { ...formDataRef.current, driveLinks: (formDataRef.current.driveLinks || []).filter((_, i) => i !== idx) };
                                  toast.success('Link removed');
                                }}
                              >
                                <IconX className="size-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      Add Google Drive links, YouTube videos, or other external resources.
                    </p>
                  </div>
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

            {/* Assignment Attachments */}
            {selectedType === 'assignment' && (
              <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <IconPaperclip className="size-5" />
                  <h3 className="font-semibold">Assignment Instructions & Attachments</h3>
                </div>

                <div>
                  <Label htmlFor="assignmentInstructions">Detailed Instructions</Label>
                  <Textarea
                    id="assignmentInstructions"
                    placeholder="Provide detailed instructions for students..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Attach Files (Multiple files allowed)</Label>
                  
                  {/* Multiple Files Preview */}
                  {formData.attachments.length > 0 && (
                    <div className="mb-3 space-y-2">
                      <Label className="text-sm">Uploaded Files ({formData.attachments.length})</Label>
                      {formData.attachments.map((attachment, idx) => (
                        <div key={idx} className="border rounded-lg p-3 bg-white">
                          <div className="flex items-center gap-3">
                            {attachment.url.startsWith('data:image/') || attachment.type?.startsWith('image/') ? (
                              <div className="w-16 h-16 bg-gray-50 rounded border overflow-hidden flex-shrink-0">
                                <img
                                  src={attachment.url}
                                  alt={attachment.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : attachment.url.startsWith('data:application/pdf') ? (
                              <div className="w-16 h-16 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                                <IconFileText className="size-8 text-red-600" />
                              </div>
                            ) : (
                              <div className="w-16 h-16 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                                <IconFileText className="size-8 text-blue-600" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{attachment.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {attachment.type?.startsWith('image/') ? 'Image' : 
                                 attachment.type === 'application/pdf' ? 'PDF' : 'Document'}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  attachments: prev.attachments.filter((_, i) => i !== idx)
                                }));
                                toast.success('File removed');
                              }}
                            >
                              <IconX className="size-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Legacy single file support (backward compatibility) */}
                  {formData.resourceUrl && formData.resourceFile && formData.attachments.length === 0 && (
                    <div className="mb-3 border rounded-lg p-3 bg-white">
                      <div className="flex items-center gap-3">
                        {formData.resourceUrl.startsWith('data:image/') ? (
                          <div className="w-16 h-16 bg-gray-50 rounded border overflow-hidden flex-shrink-0">
                            <img
                              src={formData.resourceUrl}
                              alt={formData.resourceFile}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : formData.resourceUrl.startsWith('data:application/pdf') ? (
                          <div className="w-16 h-16 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                            <IconFileText className="size-8 text-red-600" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                            <IconFileText className="size-8 text-blue-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{formData.resourceFile}</p>
                          <p className="text-xs text-muted-foreground">Legacy file</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, resourceFile: '', resourceUrl: '' }))}
                        >
                          <IconX className="size-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length === 0) return;

                        setUploading(true);
                        const uploadedFiles: Array<{ url: string; name: string; type: string }> = [];

                        try {
                          for (const file of files) {
                            const uploadFormData = new FormData();
                            uploadFormData.append('file', file);
                            uploadFormData.append('type', 'document');

                            const response = await fetch('/api/upload', {
                              method: 'POST',
                              body: uploadFormData,
                            });
                            const data = await response.json();

                            if (data.success) {
                              uploadedFiles.push({
                                url: data.url,
                                name: file.name,
                                type: file.type
                              });
                            } else {
                              throw new Error(data.error || 'Upload failed');
                            }
                          }

                          setFormData(prev => ({
                            ...prev,
                            attachments: [...prev.attachments, ...uploadedFiles]
                          }));
                          
                          toast.success(`${files.length} file(s) uploaded successfully`);
                          
                          // Reset file input
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        } catch (error) {
                          toast.error('Failed to upload some files');
                          console.error('Upload error:', error);
                        } finally {
                          setUploading(false);
                        }
                      }}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip,image/*"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex-1"
                    >
                      <IconUpload className="size-4 mr-2" />
                      {uploading ? 'Uploading...' : formData.attachments.length > 0 ? 'Add More Files' : 'Upload Files'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    You can select multiple files at once. Accepted: PDF, Word, PowerPoint, Excel, images, ZIP files (max 20MB each)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Student Submission Format</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="acceptAssignmentText"
                      checked={quizForm.acceptTextAnswer}
                      onChange={(e) => setQuizForm({ ...quizForm, acceptTextAnswer: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="acceptAssignmentText" className="cursor-pointer">
                      Accept text answer (in textbox)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="acceptAssignmentFile"
                      checked={quizForm.acceptFileUpload}
                      onChange={(e) => setQuizForm({ ...quizForm, acceptFileUpload: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="acceptAssignmentFile" className="cursor-pointer">
                      Accept file upload (PDF, images, documents)
                    </Label>
                  </div>
                </div>

                <div>
                  <Label>Total Points for Assignment *</Label>
                  <Input
                    type="number"
                    min="1"
                    max="1000"
                    value={quizForm.totalPoints || 100}
                    onChange={(e) => setQuizForm({ ...quizForm, totalPoints: parseInt(e.target.value) || 100 })}
                  />
                </div>
              </div>
            )}

            {/* Quiz Builder */}
            {selectedType === 'quiz' && (
              <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <IconSettings className="size-5" />
                  <h3 className="font-semibold">Quiz Configuration</h3>
                </div>

                {/* Quiz Type Selection */}
                <div>
                  <Label htmlFor="quizType">Quiz Type *</Label>
                  <select
                    id="quizType"
                    className="w-full px-3 py-2 border rounded-md"
                    value={quizForm.quizType}
                    onChange={(e) => setQuizForm({ ...quizForm, quizType: e.target.value as 'mcq' | 'open-ended' })}
                  >
                    <option value="mcq">Multiple Choice (MCQ)</option>
                    <option value="open-ended">Open-Ended / Descriptive</option>
                  </select>
                </div>

                {/* Quiz Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      min="5"
                      step="5"
                      value={quizForm.timeLimit}
                      onChange={(e) => setQuizForm({ ...quizForm, timeLimit: parseInt(e.target.value) || 30 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="passingScore">Passing Score (%)</Label>
                    <Input
                      id="passingScore"
                      type="number"
                      min="0"
                      max="100"
                      value={quizForm.passingScore}
                      onChange={(e) => setQuizForm({ ...quizForm, passingScore: parseInt(e.target.value) || 60 })}
                    />
                  </div>
                </div>

                {/* Quiz Options */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="allowMultipleAttempts"
                      checked={quizForm.allowMultipleAttempts}
                      onChange={(e) => setQuizForm({ ...quizForm, allowMultipleAttempts: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="allowMultipleAttempts" className="cursor-pointer">
                      Allow multiple attempts
                    </Label>
                  </div>

                  {quizForm.quizType === 'mcq' && (
                    <>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="showAnswers"
                          checked={quizForm.showAnswersAfterSubmission}
                          onChange={(e) => setQuizForm({ ...quizForm, showAnswersAfterSubmission: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor="showAnswers" className="cursor-pointer">
                          Show correct answers after submission
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="randomizeQuestions"
                          checked={quizForm.randomizeQuestions}
                          onChange={(e) => setQuizForm({ ...quizForm, randomizeQuestions: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor="randomizeQuestions" className="cursor-pointer">
                          Randomize question order
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="randomizeOptions"
                          checked={quizForm.randomizeOptions}
                          onChange={(e) => setQuizForm({ ...quizForm, randomizeOptions: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor="randomizeOptions" className="cursor-pointer">
                          Randomize option order
                        </Label>
                      </div>
                    </>
                  )}
                </div>

                {/* MCQ Questions Builder */}
                {quizForm.quizType === 'mcq' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Questions ({quizForm.mcqQuestions.length})</h4>
                      <Badge variant="secondary">Total Points: {quizForm.totalPoints}</Badge>
                    </div>

                    {/* Display Added Questions */}
                    {quizForm.mcqQuestions.length > 0 && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {quizForm.mcqQuestions.map((q, idx) => (
                          <Card key={idx} className="p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">Q{idx + 1}</Badge>
                                  <Badge variant="secondary" className="text-xs">{q.points} pts</Badge>
                                </div>
                                <p className="text-sm font-medium">{q.question}</p>
                                <div className="mt-2 space-y-1">
                                  {q.options.map((opt, optIdx) => (
                                    <div key={optIdx} className="flex items-center gap-2 text-xs">
                                      {opt.isCorrect ? (
                                        <IconCheck className="size-3 text-green-600" />
                                      ) : (
                                        <span className="size-3" />
                                      )}
                                      <span className={opt.isCorrect ? 'text-green-600 font-medium' : ''}>
                                        {opt.text}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMCQQuestion(idx)}
                              >
                                <IconTrash className="size-4 text-destructive" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Add New Question Form */}
                    <Card className="p-4 bg-background">
                      <div className="space-y-3">
                        <div>
                          <Label>Question Text *</Label>
                          <Textarea
                            placeholder="Enter your question..."
                            rows={2}
                            value={currentQuestion.question}
                            onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Options (mark correct answer) *</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleAddOption}
                              disabled={currentQuestion.options.length >= 6}
                            >
                              <IconPlus className="size-3 mr-1" />
                              Add Option
                            </Button>
                          </div>
                          {currentQuestion.options.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={opt.isCorrect}
                                onChange={(e) => handleOptionChange(idx, 'isCorrect', e.target.checked)}
                                className="rounded"
                              />
                              <input
                                type="text"
                                placeholder={`Option ${idx + 1}`}
                                value={opt.text}
                                onChange={(e) => handleOptionChange(idx, 'text', e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              />
                              {currentQuestion.options.length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveOption(idx)}
                                >
                                  <IconX className="size-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Points *</Label>
                            <Input
                              type="number"
                              min="1"
                              max="100"
                              value={currentQuestion.points}
                              onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) || 1 })}
                            />
                          </div>
                          <div>
                            <Label>Explanation (optional)</Label>
                            <Input
                              placeholder="Why is this the answer?"
                              value={currentQuestion.explanation}
                              onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                            />
                          </div>
                        </div>

                        <Button
                          type="button"
                          onClick={handleAddMCQQuestion}
                          className="w-full"
                          variant="outline"
                        >
                          <IconPlus className="size-4 mr-2" />
                          Add Question to Quiz
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Open-Ended Question */}
                {quizForm.quizType === 'open-ended' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="openEndedQuestion">Question / Instructions</Label>
                      <Textarea
                        id="openEndedQuestion"
                        placeholder="Describe the question or instructions for students..."
                        rows={4}
                        value={quizForm.openEndedQuestion}
                        onChange={(e) => setQuizForm({ ...quizForm, openEndedQuestion: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label>Or Upload Question File (PDF)</Label>
                      <div className="flex gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploading(true);
                              const uploadFormData = new FormData();
                              uploadFormData.append('file', file);
                              try {
                                const response = await fetch('/api/admin/upload', {
                                  method: 'POST',
                                  body: uploadFormData,
                                });
                                const data = await response.json();
                                setQuizForm(prev => ({ ...prev, openEndedQuestionFile: data.url }));
                                toast.success('File uploaded');
                              } catch (error) {
                                toast.error('Failed to upload file');
                              } finally {
                                setUploading(false);
                              }
                            }
                          }}
                          className="hidden"
                          accept=".pdf"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="flex-1"
                        >
                          <IconUpload className="size-4 mr-2" />
                          {uploading ? 'Uploading...' : quizForm.openEndedQuestionFile ? 'Change File' : 'Upload PDF'}
                        </Button>
                        {quizForm.openEndedQuestionFile && (
                          <Badge variant="secondary" className="self-center">
                            PDF Uploaded
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>Total Points for This Question *</Label>
                      <Input
                        type="number"
                        min="1"
                        max="1000"
                        value={quizForm.totalPoints}
                        onChange={(e) => setQuizForm({ ...quizForm, totalPoints: parseInt(e.target.value) || 100 })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Student Answer Format</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="acceptText"
                          checked={quizForm.acceptTextAnswer}
                          onChange={(e) => setQuizForm({ ...quizForm, acceptTextAnswer: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor="acceptText" className="cursor-pointer">
                          Accept text answer (in textbox)
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="acceptFile"
                          checked={quizForm.acceptFileUpload}
                          onChange={(e) => setQuizForm({ ...quizForm, acceptFileUpload: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor="acceptFile" className="cursor-pointer">
                          Accept file upload (PDF)
                        </Label>
                      </div>
                    </div>
                  </div>
                )}
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
