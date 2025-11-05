'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    ArrowLeft,
    Clock,
    Calendar,
    CheckCircle,
    PlayCircle,
    Target,
    BookOpen,
    Video,
    FileText,
    Users,
    Globe,
    Eye,
    Download,
    Bell,
    Link,
    HelpCircle,
    X
} from 'lucide-react';
import {
    IconPlayerPlay,
    IconClipboardCheck,
    IconSpeakerphone,
    IconBook,
    IconCalendar,
    IconClock,
    IconLink,
    IconDownload,
    IconBrandYoutube,
    IconVideo,
    IconFileText,
    IconBell
} from '@tabler/icons-react';

// Type definitions matching the admin interface
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
    quizData?: any;
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

interface Course {
    _id: string;
    title: string;
    description: string;
    curriculum?: {
        modules: Module[];
    };
}

export default function StudentCurriculumPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isSignedIn } = useUser();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeModuleId, setActiveModuleId] = useState(0);
    const [selectedQuiz, setSelectedQuiz] = useState<CurriculumItem | null>(null);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [questionIndex: number]: number }>({});
    const [showResults, setShowResults] = useState(false);
    const [quizResults, setQuizResults] = useState<{ [quizId: string]: any }>({});
    const [savingQuiz, setSavingQuiz] = useState(false);
    const [completedQuizzes, setCompletedQuizzes] = useState<Set<string>>(new Set());
    const [isAdmin, setIsAdmin] = useState(false);

    const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionIndex]: optionIndex
        }));
    };

    const handleQuizSubmit = async () => {
        setSavingQuiz(true);
        setShowResults(true);

        // Calculate score
        const questions = (selectedQuiz as any)?.quizData?.mcqQuestions || [];
        let correctAnswers = 0;
        let totalQuestions = questions.length;

        questions.forEach((question: any, index: number) => {
            const selectedOption = selectedAnswers[index];
            if (selectedOption !== undefined && question.options[selectedOption]?.isCorrect) {
                correctAnswers++;
            }
        });

        const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

        // Save quiz result to database
        try {
            const response = await fetch('/api/quiz-results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    courseId: params?.courseId,
                    quizId: selectedQuiz?._id || `quiz-${Date.now()}`,
                    quizTitle: selectedQuiz?.title || 'Quiz',
                    answers: selectedAnswers,
                    score,
                    totalQuestions,
                    correctAnswers,
                }),
            });

            const data = await response.json();

            // Save quiz completion to localStorage
            if (selectedQuiz && user?.id && params?.courseId) {
                const quizIdentifier = selectedQuiz.title.replace(/\s+/g, '_').toLowerCase();
                const quizKey = `quiz_${params.courseId}_${user.id}_${quizIdentifier}`;
                const quizData = {
                    completed: true,
                    userId: user.id,
                    answers: selectedAnswers,
                    score: score,
                    quizTitle: selectedQuiz.title,
                    courseName: course?.title || 'Course',
                    completedAt: new Date().toISOString()
                };
                localStorage.setItem(quizKey, JSON.stringify(quizData));
                console.log('Quiz completion saved to localStorage:', quizKey);

                // Update completed quizzes set
                setCompletedQuizzes(prev => {
                    const newSet = new Set(prev);
                    newSet.add(quizKey);
                    return newSet;
                });

                // Trigger storage event for same-tab updates
                window.dispatchEvent(new Event('storage'));
            }

            if (data.success) {
                // Update local quiz results
                setQuizResults(prev => ({
                    ...prev,
                    [selectedQuiz?._id || `quiz-${Date.now()}`]: {
                        score,
                        totalQuestions,
                        correctAnswers,
                        completedAt: new Date(),
                        answers: selectedAnswers
                    }
                }));

                alert(`✅ Quiz Completed & Saved!\nScore: ${score}% (${correctAnswers}/${totalQuestions} correct)\n\n⚠️ This quiz cannot be retaken.`);
            } else {
                alert(`✅ Quiz Completed!\nScore: ${score}% (${correctAnswers}/${totalQuestions} correct)\n\n⚠️ This quiz cannot be retaken.`);
            }

            // Close the modal after showing results briefly
            setTimeout(() => {
                setSelectedQuiz(null);
                setShowResults(false);
                setSelectedAnswers({});
            }, 2000);

        } catch (error) {
            console.error('Error saving quiz result:', error);
            alert(`✅ Quiz Completed!\nScore: ${score}% (${correctAnswers}/${totalQuestions} correct)\n\n⚠️ This quiz cannot be retaken.`);

            // Close the modal after showing results briefly
            setTimeout(() => {
                setSelectedQuiz(null);
                setShowResults(false);
                setSelectedAnswers({});
            }, 2000);
        } finally {
            setSavingQuiz(false);
        }
    };

    const resetQuiz = () => {
        setSelectedAnswers({});
        setShowResults(false);
    };

    useEffect(() => {
        const fetchCourseAndCurriculum = async () => {
            if (!params?.courseId) return;

            try {
                // Check if user is admin
                const adminCheck = user?.publicMetadata?.role === 'admin';
                setIsAdmin(!!adminCheck);

                // Fetch course details
                const courseResponse = await fetch(`/api/courses/${params.courseId}`);
                if (!courseResponse.ok) throw new Error('Course not found');
                const courseData = await courseResponse.json();
                const course = courseData.data || courseData.course;

                // Fetch curriculum (admin can access all, students only enrolled)
                const curriculumResponse = await fetch(`/api/admin/courses/${params.courseId}/curriculum`);
                if (curriculumResponse.ok) {
                    const curriculumData = await curriculumResponse.json();
                    console.log('Curriculum data:', curriculumData);
                    if (curriculumData.curriculum?.modules) {
                        course.curriculum = curriculumData.curriculum;
                    }
                } else {
                    console.error('Failed to fetch curriculum:', curriculumResponse.status);
                }

                console.log('Final course with curriculum:', course);
                setCourse(course);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching course:', error);
                setLoading(false);
            }
        };

        fetchCourseAndCurriculum();
    }, [params?.courseId, user]);

    // Load completed quizzes from localStorage
    useEffect(() => {
        if (!user?.id || !params?.courseId) return;

        const completed = new Set<string>();

        // Check all localStorage keys for completed quizzes
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`quiz_${params.courseId}_${user.id}`)) {
                const quizData = localStorage.getItem(key);
                if (quizData) {
                    try {
                        const parsed = JSON.parse(quizData);
                        if (parsed.completed) {
                            // Extract quiz identifier from the key
                            completed.add(key);
                        }
                    } catch (e) {
                        console.error('Error parsing quiz data:', e);
                    }
                }
            }
        }

        setCompletedQuizzes(completed);
        console.log('Loaded completed quizzes:', Array.from(completed));
    }, [user?.id, params?.courseId]);

    // Listen for storage changes to update completed quizzes in real-time
    useEffect(() => {
        const handleStorageChange = () => {
            if (!user?.id || !params?.courseId) return;

            const completed = new Set<string>();
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(`quiz_${params.courseId}_${user.id}`)) {
                    const quizData = localStorage.getItem(key);
                    if (quizData) {
                        try {
                            const parsed = JSON.parse(quizData);
                            if (parsed.completed) {
                                completed.add(key);
                            }
                        } catch (e) {
                            console.error('Error parsing quiz data:', e);
                        }
                    }
                }
            }
            setCompletedQuizzes(completed);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [user?.id, params?.courseId]);

    // Helper function to check if quiz is completed
    const isQuizCompleted = (quizItem: CurriculumItem) => {
        if (!user?.id || !params?.courseId) return false;

        // Generate the quiz key using the quiz title as unique identifier
        const quizIdentifier = quizItem.title.replace(/\s+/g, '_').toLowerCase();
        const quizKey = `quiz_${params.courseId}_${user.id}_${quizIdentifier}`;

        // Check if this specific quiz is in the completed set
        return completedQuizzes.has(quizKey);
    };    // Helper functions
    const formatDate = (date: Date) => {
        const d = new Date(date);
        return {
            day: d.getDate().toString(),
            month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
            full: d.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        };
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTypeIcon = (type: string, isLarge = false) => {
        const size = isLarge ? 'size-8' : 'size-4';
        switch (type) {
            case 'live-class':
                return <IconPlayerPlay className={`${size} text-blue-600`} />;
            case 'announcement':
                return <IconSpeakerphone className={`${size} text-amber-600`} />;
            case 'resource':
                return <IconBook className={`${size} text-green-600`} />;
            case 'assignment':
                return <IconClipboardCheck className={`${size} text-purple-600`} />;
            case 'quiz':
                return <Target className={`${size} text-red-600`} />;
            default:
                return <IconBook className={`${size} text-gray-600`} />;
        }
    };

    const getTypeColorBg = (type: string) => {
        switch (type) {
            case 'live-class':
                return 'border-blue-200 bg-blue-50';
            case 'announcement':
                return 'border-amber-200 bg-amber-50';
            case 'resource':
                return 'border-green-200 bg-green-50';
            case 'assignment':
                return 'border-purple-200 bg-purple-50';
            case 'quiz':
                return 'border-red-200 bg-red-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };

    const getResourceIcon = (resourceType?: string) => {
        switch (resourceType) {
            case 'video':
                return <IconVideo className="size-3" />;
            case 'youtube':
                return <IconBrandYoutube className="size-3" />;
            case 'pdf':
                return <IconFileText className="size-3" />;
            default:
                return <IconBook className="size-3" />;
        }
    };

    if (loading) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <SiteHeader />
                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-8">
                            <Skeleton className="h-8 w-32 mb-6" />
                            <div className="space-y-6">
                                <Skeleton className="h-64 w-full" />
                                <Skeleton className="h-40 w-full" />
                                <Skeleton className="h-40 w-full" />
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    if (!course) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <SiteHeader />
                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-8 flex items-center justify-center">
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
                                <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or you don't have access to it.</p>
                                <Button onClick={() => router.push('/dashboard')}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Dashboard
                                </Button>
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    const modules = course.curriculum?.modules || [];
    const activeModule = modules[activeModuleId];

    // Group items by date
    const groupedByDate: { [key: string]: CurriculumItem[] } = {};
    if (activeModule) {
        activeModule.items
            .filter(item => item.isPublished)
            .forEach(item => {
                const dateKey = new Date(item.scheduledDate).toISOString().split('T')[0];
                if (!groupedByDate[dateKey]) {
                    groupedByDate[dateKey] = [];
                }
                groupedByDate[dateKey].push(item);
            });
    }

    const sortedDates = Object.keys(groupedByDate).sort();
    const pinnedAnnouncements = activeModule?.items.filter(
        item => item.type === 'announcement' && item.isPinned && item.isPublished
    ) || [];

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-8">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
                                    <ArrowLeft className="size-4 mr-2" />
                                    Back to Dashboard
                                </Button>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl font-bold">{course.title}</h1>
                                        {isAdmin && (
                                            <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                                                👑 Admin Access
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground">Course Curriculum</p>
                                </div>
                            </div>
                        </div>
                        {/* Course Description */}
                        <Card className="mb-8">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="size-5" />
                                    About This Course
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 leading-relaxed">{course.description}</p>
                            </CardContent>
                        </Card>

                        {modules.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center text-gray-500">
                                    <Calendar className="size-12 mx-auto mb-4 opacity-50" />
                                    <p className="font-medium">No curriculum available yet</p>
                                    <p className="text-sm">The instructor is still preparing the course content.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <>
                                {/* Module Tabs */}
                                <Card className="mb-8">
                                    <CardContent className="p-4 py-0">
                                        <div className="flex items-center gap-2 overflow-x-auto">
                                            {modules.map((module, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setActiveModuleId(idx)}
                                                    className={`px-4 py-2 rounded-lg border-2 whitespace-nowrap transition-all ${activeModuleId === idx
                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                        : 'border-border hover:border-primary/50'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm">{module.name}</span>
                                                        {module.isPublished && <Eye className="size-3" />}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {activeModule && (
                                    <>
                                        {/* Module Header */}
                                        <div className="mb-6">
                                            <h2 className="text-xl font-bold text-gray-900">{activeModule.name}</h2>
                                            {activeModule.description && (
                                                <p className="text-gray-600 mt-1">{activeModule.description}</p>
                                            )}
                                        </div>

                                        {/* Pinned Announcements */}
                                        {pinnedAnnouncements.length > 0 && (
                                            <Card className="border-l-4 border-l-amber-500 bg-amber-50 mb-6">
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-center gap-2">
                                                        <Bell className="size-5 text-amber-600" />
                                                        <CardTitle className="text-base text-amber-800">Pinned Announcements</CardTitle>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-2">
                                                    {pinnedAnnouncements.map((item, idx) => (
                                                        <div key={idx} className="flex items-start justify-between p-3 rounded-md bg-white border border-amber-200">
                                                            <div className="flex-1">
                                                                <h4 className="font-medium text-sm text-amber-800">{item.title}</h4>
                                                                <p className="text-xs text-amber-700 mt-1">{item.description}</p>
                                                                {item.validUntil && (
                                                                    <p className="text-xs text-amber-600 mt-1">
                                                                        Valid until {formatDate(item.validUntil).full}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Content List with Date Groups */}
                                        {activeModule.items.filter(item => item.isPublished).length === 0 ? (
                                            <Card>
                                                <CardContent className="py-12 text-center text-gray-500">
                                                    <Calendar className="size-12 mx-auto mb-4 opacity-50" />
                                                    <p className="font-medium">No content published yet</p>
                                                    <p className="text-sm">The instructor is still preparing content for this module.</p>
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
                                                                {items.map((item, itemIdx) => (
                                                                    <Card key={itemIdx} className={`border-2 overflow-hidden ${getTypeColorBg(item.type)}`}>
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
                                                                                                            <Clock className="size-3 mr-1" />
                                                                                                            {item.duration} mins
                                                                                                        </Badge>
                                                                                                        {item.meetingLink && (
                                                                                                            <Button variant="outline" size="sm" asChild>
                                                                                                                <a
                                                                                                                    href={item.meetingLink}
                                                                                                                    target="_blank"
                                                                                                                    rel="noopener noreferrer"
                                                                                                                >
                                                                                                                    <Link className="size-3 mr-1" />
                                                                                                                    Join {item.meetingPlatform === 'zoom' ? 'Zoom' : item.meetingPlatform === 'google-meet' ? 'Google Meet' : 'Meeting'}
                                                                                                                </a>
                                                                                                            </Button>
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
                                                                                                            <Button variant="outline" size="sm" asChild>
                                                                                                                <a
                                                                                                                    href={item.resourceUrl}
                                                                                                                    target="_blank"
                                                                                                                    rel="noopener noreferrer"
                                                                                                                >
                                                                                                                    <Download className="size-3 mr-1" />
                                                                                                                    Download
                                                                                                                </a>
                                                                                                            </Button>
                                                                                                        )}
                                                                                                    </>
                                                                                                )}

                                                                                                {(item.type === 'assignment' || item.type === 'quiz') && item.dueDate && (
                                                                                                    <Badge variant="outline" className="text-xs">
                                                                                                        <Clock className="size-3 mr-1" />
                                                                                                        Due: {formatDate(item.dueDate).full} {formatTime(item.dueDate)}
                                                                                                    </Badge>
                                                                                                )}

                                                                                                {item.type === 'quiz' && (
                                                                                                    <>
                                                                                                        <Badge variant="secondary" className="text-xs">
                                                                                                            {(item as any).quizData?.quizType === 'mcq' ? 'MCQ Quiz' : 'Quiz'}
                                                                                                        </Badge>
                                                                                                        {isQuizCompleted(item) ? (
                                                                                                            <Badge variant="default" className="text-xs bg-green-600">
                                                                                                                <CheckCircle className="size-3 mr-1" />
                                                                                                                Completed
                                                                                                            </Badge>
                                                                                                        ) : (
                                                                                                            <Button
                                                                                                                variant="outline"
                                                                                                                size="sm"
                                                                                                                onClick={() => {
                                                                                                                    setSelectedQuiz(item);
                                                                                                                    resetQuiz();
                                                                                                                }}
                                                                                                            >
                                                                                                                <HelpCircle className="size-3 mr-1" />
                                                                                                                Take Quiz
                                                                                                            </Button>
                                                                                                        )}
                                                                                                    </>
                                                                                                )}                                                                                                {item.type === 'announcement' && item.announcementType !== 'general' && (
                                                                                                    <Badge
                                                                                                        variant={item.announcementType === 'cancellation' ? 'destructive' : 'default'}
                                                                                                        className="text-xs capitalize"
                                                                                                    >
                                                                                                        {item.announcementType}
                                                                                                    </Badge>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </SidebarInset>

            {/* Quiz Modal */}
            <Dialog open={!!selectedQuiz} onOpenChange={(open) => !open && setSelectedQuiz(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="flex items-center gap-2">
                                    {showResults ? (
                                        <CheckCircle className="size-5 text-green-600" />
                                    ) : (
                                        <HelpCircle className="size-5" />
                                    )}
                                    {selectedQuiz?.title} {showResults ? '- Results' : ''}
                                </DialogTitle>
                                <DialogDescription className="mt-1">
                                    {selectedQuiz?.description} • {showResults ? 'Quiz completed! Correct answers are highlighted in green.' : 'Select your answers and click Submit Quiz to see results.'}
                                </DialogDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                {!showResults ? (
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={handleQuizSubmit}
                                        disabled={Object.keys(selectedAnswers).length === 0}
                                    >
                                        <PlayCircle className="size-4 mr-1" />
                                        Submit Quiz
                                    </Button>
                                ) : null}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedQuiz(null)}
                                >
                                    <X className="size-4" />
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>

                    {selectedQuiz && (
                        <div className="flex-1 overflow-y-auto">
                            {(selectedQuiz as any).quizData ? (
                                <div className="space-y-6">
                                    {/* Quiz Status Card */}
                                    <Card className={`border-2 ${showResults ? 'border-green-200 bg-green-50/50' : 'border-blue-200 bg-blue-50/50'}`}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${showResults ? 'bg-green-100' : 'bg-blue-100'}`}>
                                                        {showResults ? (
                                                            <CheckCircle className="size-5 text-green-600" />
                                                        ) : (
                                                            <HelpCircle className="size-5 text-blue-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className={`font-semibold ${showResults ? 'text-green-900' : 'text-blue-900'}`}>
                                                            {showResults ? 'Quiz Results' : 'Interactive Quiz'}
                                                        </h3>
                                                        <p className={`text-sm ${showResults ? 'text-green-700' : 'text-blue-700'}`}>
                                                            {showResults ? 'Your answers and correct solutions' : 'Select your answers and submit'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                                                        {(selectedQuiz as any).quizData.quizType === 'mcq' ? 'Multiple Choice' : 'Open-Ended'}
                                                    </Badge>
                                                    {showResults && (
                                                        <Badge variant="default" className="bg-green-600">
                                                            ✓ Completed
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Quiz Info */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-primary">{(selectedQuiz as any).quizData.mcqQuestions?.length || 0}</div>
                                            <div className="text-xs text-muted-foreground">Questions</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-primary">{(selectedQuiz as any).quizData.timeLimit || 30}</div>
                                            <div className="text-xs text-muted-foreground">Minutes</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-primary">{(selectedQuiz as any).quizData.passingScore || 60}%</div>
                                            <div className="text-xs text-muted-foreground">Passing Score</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-primary">
                                                {(selectedQuiz as any).quizData.quizType === 'mcq' ? 'MCQ' : 'Open'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">Quiz Type</div>
                                        </div>
                                    </div>

                                    {/* Progress Indicator */}
                                    {!showResults && (
                                        <Card className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium">Progress</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {Object.keys(selectedAnswers).length} of {(selectedQuiz as any).quizData.mcqQuestions?.length || 0} answered
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                    style={{
                                                        width: `${((Object.keys(selectedAnswers).length / ((selectedQuiz as any).quizData.mcqQuestions?.length || 1)) * 100)}%`
                                                    }}
                                                />
                                            </div>
                                        </Card>
                                    )}

                                    {/* Quiz Due Date */}
                                    {selectedQuiz.dueDate && (
                                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                            <div className="flex items-center gap-2 text-amber-800">
                                                <Clock className="size-4" />
                                                <span className="font-medium">Due: {formatDate(selectedQuiz.dueDate).full} at {formatTime(selectedQuiz.dueDate)}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Interactive Questions */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold">
                                                {showResults ? 'Quiz Results & Answers' : 'Quiz Questions'}
                                            </h3>
                                            <Badge variant="secondary" className={`text-xs ${showResults ? 'bg-green-100 text-green-700 border-green-300' : 'bg-blue-100 text-blue-700 border-blue-300'}`}>
                                                {showResults ? 'Results Shown' : 'Select Your Answers'}
                                            </Badge>
                                        </div>
                                        {(selectedQuiz as any).quizData.mcqQuestions?.map((question: any, index: number) => (
                                            <Card key={index} className="p-4 border-2 border-blue-200 bg-blue-50/30">
                                                <div className="space-y-3">
                                                    <div className="flex items-start gap-3">
                                                        <Badge variant="outline" className="text-xs">
                                                            Q{index + 1}
                                                        </Badge>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-sm mb-2">{question.question}</p>

                                                            {/* Interactive MCQ Options */}
                                                            {(selectedQuiz as any).quizData.quizType === 'mcq' && question.options && (
                                                                <div className="space-y-3 mt-4">
                                                                    {question.options.map((option: any, optIndex: number) => {
                                                                        const isSelected = selectedAnswers[index] === optIndex;
                                                                        const isCorrect = option.isCorrect;
                                                                        const showCorrect = showResults && isCorrect;
                                                                        const showIncorrect = showResults && isSelected && !isCorrect;

                                                                        return (
                                                                            <div
                                                                                key={optIndex}
                                                                                className={`p-3 rounded-lg border-2 text-sm transition-all cursor-pointer ${showCorrect
                                                                                    ? 'bg-green-50 border-green-300 text-green-900'
                                                                                    : showIncorrect
                                                                                        ? 'bg-red-50 border-red-300 text-red-900'
                                                                                        : isSelected
                                                                                            ? 'bg-blue-50 border-blue-300 text-blue-900'
                                                                                            : 'bg-white border-gray-300 hover:bg-gray-50'
                                                                                    }`}
                                                                                onClick={() => !showResults && handleAnswerSelect(index, optIndex)}
                                                                            >
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${showCorrect
                                                                                        ? 'bg-green-200 border-green-400 text-green-800'
                                                                                        : showIncorrect
                                                                                            ? 'bg-red-200 border-red-400 text-red-800'
                                                                                            : isSelected
                                                                                                ? 'bg-blue-200 border-blue-400 text-blue-800'
                                                                                                : 'bg-gray-100 border-gray-300 text-gray-600'
                                                                                        }`}>
                                                                                        {String.fromCharCode(65 + optIndex)}
                                                                                    </div>
                                                                                    <span className="flex-1 font-medium">{option.text}</span>
                                                                                    {showResults && isCorrect && (
                                                                                        <div className="flex items-center gap-1">
                                                                                            <CheckCircle className="size-5 text-green-600" />
                                                                                            <span className="text-xs font-semibold text-green-700">Correct</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {showResults && isSelected && !isCorrect && (
                                                                                        <div className="flex items-center gap-1">
                                                                                            <X className="size-5 text-red-600" />
                                                                                            <span className="text-xs font-semibold text-red-700">Your Answer</span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}

                                                            {/* Points and Status */}
                                                            <div className="mt-4 flex items-center justify-between">
                                                                <Badge variant="secondary" className="text-xs">
                                                                    <Target className="size-3 mr-1" />
                                                                    {question.points || 1} point{(question.points || 1) !== 1 ? 's' : ''}
                                                                </Badge>
                                                                <div className="flex items-center gap-2">
                                                                    {showResults ? (
                                                                        selectedAnswers[index] !== undefined ? (
                                                                            question.options[selectedAnswers[index]]?.isCorrect ? (
                                                                                <Badge variant="default" className="text-xs bg-green-100 text-green-700 border-green-300">
                                                                                    ✓ Correct
                                                                                </Badge>
                                                                            ) : (
                                                                                <Badge variant="destructive" className="text-xs">
                                                                                    ✗ Incorrect
                                                                                </Badge>
                                                                            )
                                                                        ) : (
                                                                            <Badge variant="outline" className="text-xs">
                                                                                Not Answered
                                                                            </Badge>
                                                                        )
                                                                    ) : (
                                                                        selectedAnswers[index] !== undefined ? (
                                                                            <Badge variant="default" className="text-xs bg-blue-100 text-blue-700">
                                                                                ✓ Answered
                                                                            </Badge>
                                                                        ) : (
                                                                            <span className="text-xs text-muted-foreground italic">
                                                                                Select an answer
                                                                            </span>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        )) || (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    <HelpCircle className="size-12 mx-auto mb-4 opacity-50" />
                                                    <p>No questions available for this quiz.</p>
                                                </div>
                                            )}
                                    </div>

                                    {/* Quiz Configuration */}
                                    <Card className="p-4">
                                        <h4 className="font-semibold text-sm mb-3">Quiz Configuration</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Allow Multiple Attempts:</span>
                                                <span className="font-medium">
                                                    {(selectedQuiz as any).quizData.allowMultipleAttempts ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Show Answers After:</span>
                                                <span className="font-medium">
                                                    {(selectedQuiz as any).quizData.showCorrectAnswers ? 'Submission' : 'Never'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Randomize Questions:</span>
                                                <span className="font-medium">
                                                    {(selectedQuiz as any).quizData.randomizeQuestions ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Randomize Options:</span>
                                                <span className="font-medium">
                                                    {(selectedQuiz as any).quizData.randomizeOptions ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <HelpCircle className="size-12 mx-auto mb-4 opacity-50" />
                                    <h3 className="text-lg font-semibold mb-2">Quiz Not Configured</h3>
                                    <p className="text-muted-foreground">This quiz hasn't been set up yet. Please contact your instructor.</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </SidebarProvider>
    );
}