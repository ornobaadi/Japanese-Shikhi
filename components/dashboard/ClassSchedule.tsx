'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock,
  Video,
  MapPin,
  Users,
  ExternalLink,
  Plus
} from "lucide-react";

interface ClassSession {
  _id: string;
  title: string;
  course: {
    title: string;
    level: 'beginner' | 'intermediate' | 'advanced';
  };
  instructor: {
    name: string;
    avatar?: string;
  };
  scheduledDate: string;
  duration: number; // in minutes
  meetingLink: string;
  meetingType: 'zoom' | 'google-meet' | 'teams';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  maxParticipants: number;
  currentParticipants: number;
  description?: string;
  topics: string[];
}

export default function ClassSchedule() {
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        // Mock data for demonstration
        const mockSessions: ClassSession[] = [
          {
            _id: '1',
            title: 'Katakana Practice Session',
            course: {
              title: 'Japanese for Beginners',
              level: 'beginner'
            },
            instructor: {
              name: 'Tanaka Sensei'
            },
            scheduledDate: '2025-09-22T10:00:00Z',
            duration: 60,
            meetingLink: 'https://meet.google.com/abc-defg-hij',
            meetingType: 'google-meet',
            status: 'upcoming',
            maxParticipants: 20,
            currentParticipants: 15,
            description: 'Interactive session to practice Katakana writing and pronunciation',
            topics: ['Katakana Characters', 'Writing Practice', 'Pronunciation']
          },
          {
            _id: '2',
            title: 'Grammar Q&A Session',
            course: {
              title: 'Japanese Grammar Fundamentals',
              level: 'intermediate'
            },
            instructor: {
              name: 'Sato Sensei'
            },
            scheduledDate: '2025-09-25T14:00:00Z',
            duration: 90,
            meetingLink: 'https://zoom.us/j/123456789',
            meetingType: 'zoom',
            status: 'upcoming',
            maxParticipants: 15,
            currentParticipants: 8,
            description: 'Ask questions about Japanese particles and sentence structure',
            topics: ['Particles', 'Sentence Structure', 'Common Mistakes']
          },
          {
            _id: '3',
            title: 'Conversation Practice',
            course: {
              title: 'Japanese Conversation',
              level: 'intermediate'
            },
            instructor: {
              name: 'Yamada Sensei'
            },
            scheduledDate: '2025-09-20T16:00:00Z',
            duration: 45,
            meetingLink: 'https://teams.microsoft.com/l/meetup-join/...',
            meetingType: 'teams',
            status: 'completed',
            maxParticipants: 12,
            currentParticipants: 12,
            description: 'Practice everyday conversations in Japanese',
            topics: ['Daily Conversations', 'Role Playing', 'Pronunciation']
          }
        ];
        
        setSessions(mockSessions);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMeetingIcon = (type: string) => {
    switch (type) {
      case 'zoom': return '🔵';
      case 'google-meet': return '🟢';
      case 'teams': return '🟣';
      default: return '📹';
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return session.status === 'upcoming' || session.status === 'ongoing';
    if (filter === 'completed') return session.status === 'completed';
    return true;
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Class Schedule</CardTitle>
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
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Class Schedule</CardTitle>
              <CardDescription>
                View and join your scheduled classes
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={filter === 'upcoming' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('upcoming')}
              >
                Upcoming
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('completed')}
              >
                Completed
              </Button>
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No {filter === 'all' ? '' : filter} classes found.
              </p>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Browse Available Classes
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => {
                const { date, time } = formatDateTime(session.scheduledDate);
                const isUpcoming = new Date(session.scheduledDate) > new Date();
                
                return (
                  <Card key={session._id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* Session Info */}
                        <div className="lg:col-span-2 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {session.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {session.course.title}
                              </p>
                            </div>
                            <Badge className={getStatusColor(session.status)}>
                              {session.status}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <Badge className={getLevelColor(session.course.level)}>
                              {session.course.level}
                            </Badge>
                            <Badge variant="outline">
                              {session.instructor.name}
                            </Badge>
                          </div>
                          
                          {session.description && (
                            <p className="text-sm text-gray-600">
                              {session.description}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-1">
                            {session.topics.map((topic, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {/* Date & Time */}
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-sm">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span>{date}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span>{time} ({session.duration} min)</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-sm">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span>
                              {session.currentParticipants}/{session.maxParticipants} participants
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-sm">
                            <Video className="h-4 w-4 text-gray-500" />
                            <span>
                              {getMeetingIcon(session.meetingType)} {session.meetingType}
                            </span>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex flex-col space-y-2">
                          {isUpcoming && session.status === 'upcoming' && (
                            <>
                              <Button 
                                onClick={() => window.open(session.meetingLink, '_blank')}
                                className="w-full"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Join Class
                              </Button>
                              <Button variant="outline" className="w-full">
                                Add to Calendar
                              </Button>
                            </>
                          )}
                          
                          {session.status === 'completed' && (
                            <Button variant="outline" className="w-full">
                              View Recording
                            </Button>
                          )}
                          
                          {session.status === 'cancelled' && (
                            <Button variant="outline" className="w-full" disabled>
                              Cancelled
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}