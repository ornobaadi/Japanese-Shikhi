'use client';

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { IconSearch, IconDownload, IconMail, IconUser, IconTrophy, IconLoader2, IconShield, IconShieldOff } from "@tabler/icons-react"
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
  const { user: currentUser } = useUser();
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);  // Store all users for filtering
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
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

  // Toggle admin role
  const handleToggleAdminRole = (user: User) => {
    if (user.clerkId === currentUser?.id) {
      toast.error('Cannot change your own admin status');
      return;
    }
    setSelectedUser(user);
    setShowAdminDialog(true);
  };

  const confirmToggleAdmin = async () => {
    if (!selectedUser) return;

    setUpdatingRole(true);
    try {
      const isCurrentlyAdmin = selectedUser.role === 'admin';
      const endpoint = '/api/admin/users/make-admin';
      const method = isCurrentlyAdmin ? 'DELETE' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: selectedUser.clerkId })
      });

      if (response.ok) {
        toast.success(
          isCurrentlyAdmin 
            ? `${selectedUser.name} is no longer an admin` 
            : `${selectedUser.name} is now an admin`
        );
        
        // Refresh users list
        const refreshResponse = await fetch('/api/admin/users');
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setAllUsers(data.users || []);
          setUsers(data.users || []);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    } finally {
      setUpdatingRole(false);
      setShowAdminDialog(false);
      setSelectedUser(null);
    }
  };

  // Delete user functionality
  const handleDeleteUser = (user: User) => {
    if (user.clerkId === currentUser?.id) {
      toast.error('You cannot delete your own account.');
      return;
    }
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    setDeletingUser(true);
    try {
      const response = await fetch('/api/admin/users/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: selectedUser.clerkId })
      });
      if (response.ok) {
        toast.success(`${selectedUser.name} has been deleted.`);
        // Refresh users list
        const refreshResponse = await fetch('/api/admin/users');
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setAllUsers(data.users || []);
          setUsers(data.users || []);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setDeletingUser(false);
      setShowDeleteDialog(false);
      setSelectedUser(null);
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
                  <div className="space-y-3 md:space-y-4">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3 sm:gap-0"
                      >
                        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={user.name}
                              className="size-8 md:size-10 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="size-8 md:size-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                              <IconUser className="size-4 md:size-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-medium text-sm md:text-base truncate">{user.name}</h3>
                              {user.isAdmin && (
                                <span className="inline-flex items-center px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 shrink-0">
                                  Admin
                                </span>
                              )}
                              {user.isPremium && (
                                <span className="inline-flex items-center px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 shrink-0">
                                  <IconTrophy className="size-2 md:size-3 mr-1" />
                                  Premium
                                </span>
                              )}
                            </div>
                            <p className="text-xs md:text-sm text-muted-foreground truncate">{user.email}</p>
                            <div className="flex items-center flex-wrap gap-2 md:gap-4 mt-1 text-[10px] md:text-xs text-muted-foreground">
                              <span className="shrink-0">Courses: {user.coursesEnrolled}</span>
                              <span className="shrink-0">Role: {user.role}</span>
                              <span className="shrink-0">
                                Status: {user.isActive ? (
                                  <span className="text-green-600">Active</span>
                                ) : (
                                  <span className="text-red-600">Inactive</span>
                                )}
                              </span>
                              <span className="hidden sm:inline shrink-0">
                                Joined: {new Date(user.createdAt).toLocaleDateString()}
                              </span>
                              {user.lastLoginAt && (
                                <span className="hidden md:inline shrink-0">
                                  Last login: {new Date(user.lastLoginAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs md:text-sm h-8 md:h-9"
                          >
                            View Profile
                          </Button>
                          <Button
                            variant={user.role === 'admin' ? 'destructive' : 'default'}
                            size="sm"
                            onClick={() => handleToggleAdminRole(user)}
                            disabled={user.clerkId === currentUser?.id}
                            className="text-xs md:text-sm h-8 md:h-9"
                          >
                            {user.role === 'admin' ? (
                              <>
                                <IconShieldOff className="size-3 md:size-4 mr-1" />
                                <span className="hidden sm:inline">Remove Admin</span>
                                <span className="sm:hidden">Remove</span>
                              </>
                            ) : (
                              <>
                                <IconShield className="size-3 md:size-4 mr-1" />
                                <span className="hidden sm:inline">Make Admin</span>
                                <span className="sm:hidden">Admin</span>
                              </>
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            disabled={user.clerkId === currentUser?.id}
                            className="text-xs md:text-sm h-8 md:h-9"
                          >
                            Delete
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

      {/* Admin Role Confirmation Dialog */}
      <AlertDialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.role === 'admin' ? 'Remove Admin Role' : 'Make User Admin'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.role === 'admin' ? (
                <>
                  Are you sure you want to remove admin privileges from <strong>{selectedUser.name}</strong>?
                  They will lose access to the admin dashboard and all admin features.
                </>
              ) : (
                <>
                  Are you sure you want to make <strong>{selectedUser?.name}</strong> an admin?
                  They will have full access to the admin dashboard and can manage all users, courses, and content.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updatingRole}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmToggleAdmin}
              disabled={updatingRole}
              className={selectedUser?.role === 'admin' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {updatingRole ? (
                <>
                  <IconLoader2 className="size-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                selectedUser?.role === 'admin' ? 'Remove Admin' : 'Make Admin'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingUser}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              disabled={deletingUser}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deletingUser ? (
                <>
                  <IconLoader2 className="size-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}