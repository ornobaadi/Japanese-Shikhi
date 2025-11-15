'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { IconUser, IconLoader2, IconMessages, IconMessageCircle } from '@tabler/icons-react';
import { ChatInterface } from '@/components/admin/ChatInterface';

interface Admin {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  profilePicture?: string;
  role: string;
}

export default function StudentMessaging() {
  const { user } = useUser();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/admins');
      if (!response.ok) {
        throw new Error('Failed to fetch admins');
      }

      const data = await response.json();
      const adminUsers = data.admins || [];
      setAdmins(adminUsers);

      // Auto-select first admin if available
      if (adminUsers.length > 0 && !selectedAdmin) {
        setSelectedAdmin(adminUsers[0]);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to load admin contacts');
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <IconLoader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (admins.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>Contact admin team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <IconMessages className="size-12 mx-auto mb-3 opacity-50" />
            <p>No admin available at the moment</p>
            <p className="text-sm">Please check back later</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <p>Please sign in to access messages</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Admin List - Sidebar */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <IconMessageCircle className="h-5 w-5" />
            Support Team
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">Chat with our team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
            {admins.map((admin) => (
              <div
                key={admin.id}
                onClick={() => setSelectedAdmin(admin)}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                  selectedAdmin?.id === admin.id ? 'bg-accent border-primary' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={admin.profilePicture} />
                    <AvatarFallback>
                      <IconUser className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm truncate">{admin.name}</p>
                      <Badge variant="secondary" className="text-xs px-2 py-0">Admin</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-xs text-green-600 dark:text-green-400">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface - Main Area */}
      <div className="lg:col-span-3 h-[calc(100vh-250px)] max-h-[700px]">
        {selectedAdmin ? (
          <ChatInterface
            currentUserId={user.id}
            currentUserName={user.fullName || user.firstName || 'Student'}
            recipientId={selectedAdmin.clerkId}
            recipientName={selectedAdmin.name}
            recipientImage={selectedAdmin.profilePicture}
          />
        ) : (
          <Card>
            <CardContent className="py-12 md:py-16">
              <div className="text-center text-muted-foreground">
                <IconMessageCircle className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Select a team member</p>
                <p className="text-sm">Choose from the list to start chatting</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
