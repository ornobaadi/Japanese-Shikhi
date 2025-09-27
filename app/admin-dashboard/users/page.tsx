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
  name: string;
  email: string;
  isActive: boolean;
  isPremium: boolean;
  createdAt: string;
  totalSpent: number;
  enrolledCourses: any[];
}

export default function UsersPage() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
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
          const data: { users: User[] } = await response.json();
          setUsers(data.users || []);
          setStats({
            totalUsers: data.users?.length || 0,
            activeUsers: data.users?.filter((user: User) => user.isActive)?.length || 0,
            premiumUsers: data.users?.filter((user: User) => user.isPremium)?.length || 0,
            totalRevenue: data.users?.reduce((sum: number, user: User) => sum + (user.totalSpent || 0), 0) || 0
          });
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

  // Export data functionality
  const handleExportData = async () => {
    try {
      setExporting(true);

      // Create CSV data
      const csvHeaders = [
        'ID',
        'Name',
        'Email',
        'Status',
        'Subscription',
        'Registration Date',
        'Total Spent',
        'Courses Enrolled'
      ];

      let csvData = [];

      if (users.length > 0) {
        // Export actual user data
        csvData = users.map(user => [
          user.id || 'N/A',
          user.name || 'N/A',
          user.email || 'N/A',
          user.isActive ? 'Active' : 'Inactive',
          user.isPremium ? 'Premium' : 'Free',
          user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
          user.totalSpent || '0',
          user.enrolledCourses?.length || '0'
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

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('users.searchAndFilter')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search">{t('users.searchUsers')}</Label>
                    <div className="relative">
                      <IconSearch className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Input id="search" placeholder={t('users.searchPlaceholder')} className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <Label>{t('users.status')}</Label>
                    <Select>
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
                    <Select>
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
                </div>
              </CardContent>
            </Card>

            {/* Empty State */}
            <Card>
              <CardHeader>
                <CardTitle>{t('users.allUsers')}</CardTitle>
                <CardDescription>{t('users.enrollmentTracking')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-muted-foreground">
                    {t('users.noUsersFound')}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t('users.willAppearHere')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}