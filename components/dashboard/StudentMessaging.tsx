'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { IconUser, IconLoader2, IconMessages } from '@tabler/icons-react';
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
      if (response.ok) {
        const data = await response.json();
        const adminUsers = data.admins || [];
        setAdmins(adminUsers);
        
        // Auto-select first admin if available
        if (adminUsers.length > 0) {
          setSelectedAdmin(adminUsers[0]);
        }
      } else {
        toast.error('Failed to load admin contacts');
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to load admin contacts');
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
      {/* Admin List - Sidebar */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="text-base md:text-lg">Admin Team</CardTitle>
          <CardDescription className="text-xs md:text-sm">Select an admin to chat with</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {admins.map((admin) => (
              <div
                key={admin.id}
                onClick={() => setSelectedAdmin(admin)}
                className={`p-2 md:p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                  selectedAdmin?.id === admin.id ? 'bg-accent border-primary' : ''
                }`}
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <Avatar className="size-8 md:size-10 shrink-0">
                    <AvatarImage src={admin.profilePicture} />
                    <AvatarFallback>
                      <IconUser className="size-4 md:size-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-xs md:text-sm truncate">{admin.name}</p>
                      <Badge variant="secondary" className="text-[10px] md:text-xs px-1 md:px-2 py-0">Admin</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface - Main Area */}
      <div className="lg:col-span-3">
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
            <CardContent className="py-8 md:py-12">
              <div className="text-center text-muted-foreground">
                <IconMessages className="size-12 md:size-16 mx-auto mb-3 md:mb-4 opacity-30" />
                <p className="text-base md:text-lg font-medium">Select an admin to start chatting</p>
                <p className="text-xs md:text-sm">Choose from the list on the left</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
