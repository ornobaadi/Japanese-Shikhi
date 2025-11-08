'use client';

import { useState, useEffect } from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IconSearch, IconDownload, IconMail, IconUser, IconTrophy, IconLoader2 } from "@tabler/icons-react"
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface User {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  profilePicture?: string;
  isActive: boolean;
  isPremium: boolean;
  isAdmin: boolean;
  role: 'admin' | 'student';
  createdAt: string;
  lastLoginAt?: string;
  totalSpent: number;
  enrolledCourses: any[];
  coursesEnrolled: number;
  statistics?: any;
}

export default function UsersPage() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);  // Store all users for filtering
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    totalRevenue: 0
  });

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/users');
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched users data:', data);
          const fetchedUsers = data.users || [];
          setAllUsers(fetchedUsers); // Store all users for filtering
          setUsers(fetchedUsers); // Initially show all users

          // Use stats from API if available, otherwise calculate from users data
          if (data.stats) {
            setStats({
              totalUsers: data.stats.total,
              activeUsers: data.stats.activeUsers,
              premiumUsers: data.stats.premiumUsers,
              totalRevenue: data.stats.totalRevenue
            });
          } else {
            setStats({
              totalUsers: data.users?.length || 0,
              activeUsers: data.users?.filter((user: User) => user.isActive)?.length || 0,
              premiumUsers: data.users?.filter((user: User) => user.isPremium)?.length || 0,
              totalRevenue: data.users?.reduce((sum: number, user: User) => sum + (user.totalSpent || 0), 0) || 0
            });
          }
        } else {
          console.error('Failed to fetch users:', response.status, response.statusText);
          toast.error('Failed to fetch users data');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [t]);

  // Filter users based on search and filter criteria
  useEffect(() => {
    let filteredUsers = [...allUsers];

    // Apply search filter
    if (searchTerm.trim()) {
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.clerkId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filteredUsers = filteredUsers.filter(user => user.isActive);
      } else if (statusFilter === 'inactive') {
        filteredUsers = filteredUsers.filter(user => !user.isActive);
      }
    }

    // Apply subscription filter
    if (subscriptionFilter !== 'all') {
      if (subscriptionFilter === 'premium') {
        filteredUsers = filteredUsers.filter(user => user.isPremium);
      } else if (subscriptionFilter === 'free') {
        filteredUsers = filteredUsers.filter(user => !user.isPremium);
      }
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
    }

    setUsers(filteredUsers);
  }, [allUsers, searchTerm, statusFilter, subscriptionFilter, roleFilter]);

  // Export data functionality
  const handleExportData = async () => {
    try {
      setExporting(true);

      // Create CSV data
      const csvHeaders = [
        'ID',
        'Clerk ID',
        'Name',
        'Email',
        'Role',
        'Status',
        'Subscription',
        'Registration Date',
        'Last Login',
        'Total Spent',
        'Courses Enrolled'
      ];

      let csvData = [];

      if (users.length > 0) {
        // Export actual user data
        csvData = users.map(user => [
          user.id || 'N/A',
          user.clerkId || 'N/A',
          user.name || 'N/A',
          user.email || 'N/A',
          user.role || 'student',
          user.isActive ? 'Active' : 'Inactive',
          user.isPremium ? 'Premium' : 'Free',
          user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
          user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never',
          user.totalSpent || '0',
          user.coursesEnrolled || '0'
        ]);
      } else {
        // Export empty template with headers only
        csvData = [
          ['', '', '', '', '', '', '', ''], // Empty row as example
          ['Example User', 'user@example.com', 'Active', 'Free', new Date().toLocaleDateString(), '0', '0']
        ];
      }

      // Create CSV content
      const csvContent = [
        csvHeaders.join(','),
        ...csvData.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(users.length > 0
        ? `${t('users.exportSuccess')} (${users.length} ${t('users.users')})`
        : t('users.exportTemplateSuccess')
      );
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error(t('users.exportError'));
    } finally {
      setExporting(false);
    }
  };

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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{t('users.title')}</h1>
                <p className="text-muted-foreground">{t('users.subtitle')}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportData} disabled={exporting}>
                  {exporting ? (
                    <IconLoader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <IconDownload className="size-4 mr-2" />
                  )}
                  {exporting ? t('users.exporting') : t('users.exportData')}
                </Button>
                <Button variant="outline">
                  <IconMail className="size-4 mr-2" />
                  {t('users.sendNotification')}
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <IconUser className="size-4" />
                    {t('users.totalUsers')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? '...' : stats.totalUsers}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loading ? t('common.loading') : (stats.totalUsers === 0 ? t('users.noUsersYet') : `${stats.totalUsers} ${t('users.users')}`)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <IconTrophy className="size-4" />
                    {t('users.activeUsers')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? '...' : stats.activeUsers}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loading ? t('common.loading') : (stats.activeUsers === 0 ? t('users.noActiveUsers') : `${stats.activeUsers} ${t('users.activeUsersText')}`)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{t('users.premiumUsers')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? '...' : stats.premiumUsers}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loading ? t('common.loading') : (stats.premiumUsers === 0 ? t('users.noPremiumUsers') : `${stats.premiumUsers} ${t('users.premiumUsersText')}`)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{t('admin.totalRevenue')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? '...' : `৳${stats.totalRevenue.toFixed(2)}`}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loading ? t('common.loading') : (stats.totalRevenue === 0 ? t('users.noRevenueYet') : `${t('users.revenueGenerated')}: ৳${stats.totalRevenue.toFixed(2)}`)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Users List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle>{t('users.allUsers')}</CardTitle>
                  <CardDescription>{t('users.enrollmentTracking')}</CardDescription>
                </div>
                <div className="text-sm text-muted-foreground">
                  Showing {users.length} of {allUsers.length} users
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters Section */}
                <div className="mb-6 flex flex-wrap items-end gap-4 rounded-lg border bg-card p-4">
                  <div className="flex-1">
                    <Label htmlFor="search">{t('users.searchUsers')}</Label>
                    <div className="relative">
                      <IconSearch className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder={t('users.searchPlaceholder')}
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('users.status')}</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder={t('users.allStatus')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('users.allStatus')}</SelectItem>
                        <SelectItem value="active">{t('users.active')}</SelectItem>
                        <SelectItem value="inactive">{t('users.inactive')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('users.subscription')}</Label>
                    <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder={t('users.allTypes')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('users.allTypes')}</SelectItem>
                        <SelectItem value="free">{t('users.free')}</SelectItem>
                        <SelectItem value="premium">{t('users.premium')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setRoleFilter('all');
                      setStatusFilter('all');
                      setSubscriptionFilter('all');
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Clear Filters
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <IconLoader2 className="size-8 animate-spin mx-auto mb-4" />
                    <div className="text-muted-foreground">{t('common.loading')}</div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-muted-foreground">
                      {t('users.noUsersFound')}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {t('users.willAppearHere')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={user.name}
                              className="size-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                              <IconUser className="size-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{user.name}</h3>
                              {user.isAdmin && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  Admin
                                </span>
                              )}
                              {user.isPremium && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                  <IconTrophy className="size-3 mr-1" />
                                  Premium
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span>Courses: {user.coursesEnrolled}</span>
                              <span>Role: {user.role}</span>
                              <span>
                                Status: {user.isActive ? (
                                  <span className="text-green-600">Active</span>
                                ) : (
                                  <span className="text-red-600">Inactive</span>
                                )}
                              </span>
                              <span>
                                Joined: {new Date(user.createdAt).toLocaleDateString()}
                              </span>
                              {user.lastLoginAt && (
                                <span>
                                  Last login: {new Date(user.lastLoginAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                          <Button variant="outline" size="sm">
                            <IconMail className="size-4 mr-1" />
                            Message
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}