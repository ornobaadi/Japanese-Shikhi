'use client';

import { useEffect, useState } from 'react';
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    IconUsers,
    IconBook,
    IconTrophy,
    IconTrendingUp,
    IconTrendingDown,
    IconEye,
    IconStar,
    IconClipboard,
    IconClock,
    IconCalendar
} from '@tabler/icons-react';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';

interface AnalyticsData {
    overview: {
        totalUsers: number;
        totalCourses: number;
        totalEnrollments: number;
        totalQuizzes: number;
        totalAssignments: number;
        avgCompletionRate: number;
        activeUsers: number;
        monthlyGrowth: number;
    };
    userGrowth: Array<{
        month: string;
        users: number;
        enrollments: number;
        completions: number;
    }>;
    coursePerformance: Array<{
        courseName: string;
        enrollments: number;
        completionRate: number;
        avgScore: number;
    }>;
    userEngagement: Array<{
        name: string;
        value: number;
        color: string;
    }>;
    recentActivity: Array<{
        type: string;
        count: number;
        trend: 'up' | 'down' | 'stable';
        percentage: number;
    }>;
    topCourses: Array<{
        name: string;
        enrollments: number;
        rating: number;
        completion: number;
    }>;
    quizPerformance: Array<{
        date: string;
        completed: number;
        passed: number;
        failed: number;
    }>;
    topStudents: Array<{
        studentId: string;
        name: string;
        email: string;
        profileImage?: string;
        totalCourses: number;
        quizStats: {
            total: number;
            passed: number;
            failed: number;
            averageScore: number;
        };
        assignmentStats: {
            total: number;
            submitted: number;
            graded: number;
            pending: number;
            late: number;
            averageGrade: number;
        };
        overallPerformance: number;
    }>;
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState('30d');

    useEffect(() => {
        fetchAnalyticsData();
    }, [timeRange]);

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch analytics data from dedicated endpoint
            const response = await fetch('/api/admin/analytics');
            
            if (!response.ok) {
                throw new Error('Failed to fetch analytics');
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to load analytics');
            }

            setData(result.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setError(error instanceof Error ? error.message : 'Failed to load analytics');
            setLoading(false);
        }
    };

    const COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];

    if (loading) {
        return (
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": "calc(var(--spacing) * 72)",
                        "--header-height": "calc(var(--spacing) * 12)",
                    } as React.CSSProperties
                }
            >
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <SiteHeader />
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p>Loading analytics data...</p>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    if (error) {
        return (
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": "calc(var(--spacing) * 72)",
                        "--header-height": "calc(var(--spacing) * 12)",
                    } as React.CSSProperties
                }
            >
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <SiteHeader />
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <p className="text-red-500 mb-4">{error}</p>
                            <button
                                onClick={fetchAnalyticsData}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    if (!data) return null;
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)"
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            {/* Header */}
                            <div className="px-4 lg:px-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h1 className="text-3xl font-bold mb-2">📊 Analytics Dashboard</h1>
                                        <p className="text-muted-foreground">
                                            Real-time insights from your Japanese learning platform
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        {['7d', '30d', '90d', '1y'].map((range) => (
                                            <button
                                                key={range}
                                                onClick={() => setTimeRange(range)}
                                                className={`px-3 py-1 rounded-md text-sm ${timeRange === range
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted hover:bg-muted/80'
                                                    }`}
                                            >
                                                {range}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Overview Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* ...existing code... */}
                        </div>
                        {/* ...existing code... */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* ...existing code... */}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}