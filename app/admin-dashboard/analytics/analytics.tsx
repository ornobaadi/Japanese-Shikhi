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
    IconClipboard,
    IconTrendingUp,
    IconTrendingDown,
    IconEye,
    IconClock,
    IconStar
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
    ResponsiveContainer,
    LineChart,
    Line,
    Tooltip,
    Legend
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
    }>;
    coursePerformance: Array<{
        courseName: string;
        enrollments: number;
        completionRate: number;
        avgScore: number;
    }>;
    userEngagement: Array<{
        category: string;
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
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7d');

    useEffect(() => {
        fetchAnalyticsData();
    }, [timeRange]);

    const fetchAnalyticsData = async () => {
        try {
            // Mock data for demonstration
            const mockData: AnalyticsData = {
                overview: {
                    totalUsers: 1247,
                    totalCourses: 23,
                    totalEnrollments: 3891,
                    totalQuizzes: 156,
                    totalAssignments: 89,
                    avgCompletionRate: 78.5,
                    activeUsers: 892,
                    monthlyGrowth: 15.3
                },
                userGrowth: [
                    { month: 'Jan', users: 650, enrollments: 1200 },
                    { month: 'Feb', users: 720, enrollments: 1450 },
                    { month: 'Mar', users: 890, enrollments: 1890 },
                    { month: 'Apr', users: 1020, enrollments: 2340 },
                    { month: 'May', users: 1150, enrollments: 2890 },
                    { month: 'Jun', users: 1247, enrollments: 3891 }
                ],
                coursePerformance: [
                    { courseName: 'Japanese N5 Foundation', enrollments: 456, completionRate: 85, avgScore: 87 },
                    { courseName: 'Hiragana Mastery', enrollments: 389, completionRate: 92, avgScore: 91 },
                    { courseName: 'Katakana Practice', enrollments: 334, completionRate: 88, avgScore: 89 },
                    { courseName: 'Basic Grammar', enrollments: 298, completionRate: 76, avgScore: 82 },
                    { courseName: 'Vocabulary Builder', enrollments: 267, completionRate: 81, avgScore: 85 }
                ],
                userEngagement: [
                    { category: 'Active Users', value: 892, color: '#10b981' },
                    { category: 'Inactive Users', value: 245, color: '#f59e0b' },
                    { category: 'New Users', value: 110, color: '#3b82f6' }
                ],
                recentActivity: [
                    { type: 'Course Enrollments', count: 156, trend: 'up', percentage: 12.5 },
                    { type: 'Quiz Completions', count: 234, trend: 'up', percentage: 8.3 },
                    { type: 'Assignment Submissions', count: 89, trend: 'down', percentage: -3.2 },
                    { type: 'User Registrations', count: 45, trend: 'up', percentage: 18.7 }
                ],
                topCourses: [
                    { name: 'Japanese N5 Foundation', enrollments: 456, rating: 4.8, completion: 85 },
                    { name: 'Hiragana Mastery', enrollments: 389, rating: 4.9, completion: 92 },
                    { name: 'Katakana Practice', enrollments: 334, rating: 4.7, completion: 88 },
                    { name: 'Basic Grammar', enrollments: 298, rating: 4.6, completion: 76 },
                    { name: 'Vocabulary Builder', enrollments: 267, rating: 4.5, completion: 81 }
                ]
            };

            setData(mockData);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];

    if (loading) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <SiteHeader />
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p>Loading analytics...</p>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    if (!data) return null;

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <SiteHeader />
                <div className="container mx-auto p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">📊 Analytics Dashboard</h1>
                            <p className="text-muted-foreground">
                                Comprehensive overview of platform performance and user engagement
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

                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <IconUsers className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.overview.totalUsers.toLocaleString()}</div>
                                <div className="flex items-center text-sm text-green-600">
                                    <IconTrendingUp className="h-3 w-3 mr-1" />
                                    +{data.overview.monthlyGrowth}% from last month
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                                <IconEye className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.overview.activeUsers.toLocaleString()}</div>
                                <div className="text-sm text-muted-foreground">
                                    {((data.overview.activeUsers / data.overview.totalUsers) * 100).toFixed(1)}% of total users
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                                <IconBook className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.overview.totalEnrollments.toLocaleString()}</div>
                                <div className="text-sm text-muted-foreground">
                                    Across {data.overview.totalCourses} courses
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg Completion Rate</CardTitle>
                                <IconTrophy className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.overview.avgCompletionRate}%</div>
                                <Progress value={data.overview.avgCompletionRate} className="mt-2" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* User Growth Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>📈 User Growth Trend</CardTitle>
                                <CardDescription>Monthly user registration and enrollment growth</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={data.userGrowth}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="users"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            name="Users"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="enrollments"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            name="Enrollments"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* User Engagement Pie Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>👥 User Engagement</CardTitle>
                                <CardDescription>Active vs inactive user breakdown</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={data.userEngagement}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ category, percent }) =>
                                                `${category}: ${(percent * 100).toFixed(0)}%`
                                            }
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {data.userEngagement.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Course Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle>🎓 Course Performance Overview</CardTitle>
                            <CardDescription>Enrollment numbers and completion rates by course</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={data.coursePerformance}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="courseName"
                                        angle={-45}
                                        textAnchor="end"
                                        height={100}
                                    />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="enrollments" fill="#3b82f6" name="Enrollments" />
                                    <Bar dataKey="completionRate" fill="#10b981" name="Completion Rate %" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Bottom Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>⚡ Recent Activity</CardTitle>
                                <CardDescription>Platform activity in the last 7 days</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.recentActivity.map((activity, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                        <div>
                                            <p className="font-medium">{activity.type}</p>
                                            <p className="text-sm text-muted-foreground">{activity.count} total</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {activity.trend === 'up' ? (
                                                <IconTrendingUp className="h-4 w-4 text-green-600" />
                                            ) : activity.trend === 'down' ? (
                                                <IconTrendingDown className="h-4 w-4 text-red-600" />
                                            ) : (
                                                <IconClock className="h-4 w-4 text-yellow-600" />
                                            )}
                                            <span className={`text-sm font-medium ${activity.trend === 'up' ? 'text-green-600' :
                                                    activity.trend === 'down' ? 'text-red-600' : 'text-yellow-600'
                                                }`}>
                                                {activity.percentage > 0 ? '+' : ''}{activity.percentage}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Top Performing Courses */}
                        <Card>
                            <CardHeader>
                                <CardTitle>🏆 Top Performing Courses</CardTitle>
                                <CardDescription>Most popular courses by enrollment and rating</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.topCourses.map((course, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary">#{index + 1}</Badge>
                                                <span className="font-medium">{course.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <IconStar className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm">{course.rating}</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                                            <div>📚 Enrollments: {course.enrollments}</div>
                                            <div>✅ Completion: {course.completion}%</div>
                                        </div>
                                        <Progress value={course.completion} className="h-2" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold">{data.overview.totalQuizzes}</p>
                                        <p className="text-xs text-muted-foreground">Total Quizzes</p>
                                    </div>
                                    <IconTrophy className="h-8 w-8 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold">{data.overview.totalAssignments}</p>
                                        <p className="text-xs text-muted-foreground">Assignments</p>
                                    </div>
                                    <IconClipboard className="h-8 w-8 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold">{data.overview.totalCourses}</p>
                                        <p className="text-xs text-muted-foreground">Total Courses</p>
                                    </div>
                                    <IconBook className="h-8 w-8 text-purple-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold">98.5%</p>
                                        <p className="text-xs text-muted-foreground">Satisfaction</p>
                                    </div>
                                    <IconStar className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}