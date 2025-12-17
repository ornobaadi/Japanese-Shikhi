'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell,
  FileText,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  Megaphone,
  Award,
  ExternalLink,
  RefreshCw,
  Filter
} from "lucide-react";

interface Notification {
  type: 'assignment' | 'resource' | 'announcement' | 'submission';
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  createdAt: string;
  link: string;
  
  // Assignment specific
  dueDate?: string;
  timeRemaining?: string;
  isOverdue?: boolean;
  hasSubmitted?: boolean;
  
  // Resource specific
  resourceType?: string;
  attachments?: any[];
  
  // Submission specific
  grade?: number;
  maxGrade?: number;
  feedback?: string;
  gradedAt?: string;
}

interface GroupedNotifications {
  courseId: string;
  courseTitle: string;
  notifications: Notification[];
}

interface NotificationStats {
  total: number;
  assignments: number;
  resources: number;
  announcements: number;
  graded: number;
  pendingAssignments: number;
  overdueAssignments: number;
}

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [groupedByCourse, setGroupedByCourse] = useState<GroupedNotifications[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    assignments: 0,
    resources: 0,
    announcements: 0,
    graded: 0,
    pendingAssignments: 0,
    overdueAssignments: 0
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'grouped'>('all');
  const [filterType, setFilterType] = useState<'all' | 'assignment' | 'resource' | 'announcement' | 'submission'>('all');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/notifications');
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications || []);
        setGroupedByCourse(data.groupedByCourse || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment': return FileText;
      case 'resource': return BookOpen;
      case 'announcement': return Megaphone;
      case 'submission': return Award;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'assignment': return 'bg-blue-100 text-blue-800';
      case 'resource': return 'bg-green-100 text-green-800';
      case 'announcement': return 'bg-purple-100 text-purple-800';
      case 'submission': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderNotificationCard = (notif: Notification, index: number) => {
    const Icon = getNotificationIcon(notif.type);
    
    return (
      <Card key={index} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 md:p-6">
          <div className="flex gap-3 md:gap-4">
            <div className={`flex-shrink-0 p-2 md:p-3 rounded-lg ${getNotificationColor(notif.type)} h-fit`}>
              <Icon className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm md:text-base line-clamp-2">{notif.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{notif.courseTitle}</p>
                </div>
                <Badge variant="outline" className="text-xs w-fit">
                  {formatTimeAgo(notif.createdAt)}
                </Badge>
              </div>

              {notif.description && (
                <p className="text-xs md:text-sm text-muted-foreground mb-3 line-clamp-2">
                  {notif.description}
                </p>
              )}

              {/* Assignment specific info */}
              {notif.type === 'assignment' && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {notif.hasSubmitted ? (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Submitted
                    </Badge>
                  ) : notif.isOverdue ? (
                    <Badge className="bg-red-100 text-red-800 text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {notif.timeRemaining}
                    </Badge>
                  ) : notif.timeRemaining ? (
                    <Badge className="bg-orange-100 text-orange-800 text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {notif.timeRemaining}
                    </Badge>
                  ) : null}
                  
                  {notif.dueDate && (
                    <Badge variant="outline" className="text-xs">
                      Due: {new Date(notif.dueDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Badge>
                  )}
                </div>
              )}

              {/* Resource specific info */}
              {notif.type === 'resource' && notif.attachments && notif.attachments.length > 0 && (
                <div className="mb-3">
                  <Badge variant="outline" className="text-xs">
                    {notif.attachments.length} file{notif.attachments.length > 1 ? 's' : ''} attached
                  </Badge>
                </div>
              )}

              {/* Submission specific info */}
              {notif.type === 'submission' && notif.grade !== undefined && (
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className={`${
                      (notif.grade / (notif.maxGrade || 100)) >= 0.8 ? 'bg-green-100 text-green-800' :
                      (notif.grade / (notif.maxGrade || 100)) >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    } text-xs md:text-sm`}>
                      Grade: {notif.grade}/{notif.maxGrade || 100}
                    </Badge>
                  </div>
                  {notif.feedback && (
                    <p className="text-xs md:text-sm text-muted-foreground italic">
                      "{notif.feedback}"
                    </p>
                  )}
                </div>
              )}

              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className="w-full md:w-auto text-xs md:text-sm"
              >
                <Link href={notif.link}>
                  View Details
                  <ExternalLink className="h-3 w-3 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const filteredNotifications = filterType === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filterType);

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Updates & Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Assignments</p>
                <p className="text-lg md:text-2xl font-bold">{stats.assignments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Pending</p>
                <p className="text-lg md:text-2xl font-bold">{stats.pendingAssignments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Resources</p>
                <p className="text-lg md:text-2xl font-bold">{stats.resources}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Graded</p>
                <p className="text-lg md:text-2xl font-bold">{stats.graded}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg md:text-xl">Updates & Notifications</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Stay updated with assignments, resources, and announcements
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchNotifications}
              disabled={loading}
              className="w-full md:w-auto text-xs md:text-sm"
            >
              <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
              <TabsList className="grid w-full md:w-auto grid-cols-2">
                <TabsTrigger value="all" className="text-xs md:text-sm">All Updates</TabsTrigger>
                <TabsTrigger value="grouped" className="text-xs md:text-sm">By Course</TabsTrigger>
              </TabsList>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('all')}
                  className="text-xs"
                >
                  All
                </Button>
                <Button
                  variant={filterType === 'assignment' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('assignment')}
                  className="text-xs"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Assignments
                </Button>
                <Button
                  variant={filterType === 'resource' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('resource')}
                  className="text-xs"
                >
                  <BookOpen className="h-3 w-3 mr-1" />
                  Resources
                </Button>
                <Button
                  variant={filterType === 'announcement' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('announcement')}
                  className="text-xs"
                >
                  <Megaphone className="h-3 w-3 mr-1" />
                  News
                </Button>
              </div>
            </div>

            <TabsContent value="all" className="space-y-3 md:space-y-4 mt-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <Bell className="h-12 w-12 md:h-16 md:w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm md:text-base text-muted-foreground">No notifications yet</p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-2">
                    Check back later for updates on your courses
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notif, index) => renderNotificationCard(notif, index))
              )}
            </TabsContent>

            <TabsContent value="grouped" className="space-y-4 md:space-y-6 mt-4">
              {groupedByCourse.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <Bell className="h-12 w-12 md:h-16 md:w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm md:text-base text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                groupedByCourse.map((course, idx) => (
                  <div key={idx}>
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-base md:text-lg font-semibold">{course.courseTitle}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {course.notifications.length}
                      </Badge>
                    </div>
                    <div className="space-y-3 md:space-y-4">
                      {course.notifications
                        .filter(n => filterType === 'all' || n.type === filterType)
                        .map((notif, index) => renderNotificationCard(notif, index))}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
