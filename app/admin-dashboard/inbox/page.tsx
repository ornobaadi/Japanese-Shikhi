'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatInterface } from "@/components/admin/ChatInterface";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  IconInbox,
  IconMessageCircle,
  IconSearch,
  IconLoader2
} from '@tabler/icons-react';

interface Conversation {
  userId: string;
  userName: string;
  userEmail: string;
  userImage?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export default function AdminInboxPage() {
  const { user } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    fetchConversations();
    // Refresh conversations every 10 seconds
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages?type=inbox');
      if (!response.ok) throw new Error('Failed to fetch messages');

      const data = await response.json();
      const messages = data.messages || [];

      // Group messages by sender/receiver to create conversations
      const conversationMap = new Map<string, Conversation>();

      messages.forEach((msg: any) => {
        // For admin, we want to group by the other person (student)
        const otherUserId = msg.senderId === user?.id ? msg.receiverId : msg.senderId;
        const otherUserName = msg.senderId === user?.id ? msg.receiverName : msg.senderName;
        const otherUserEmail = msg.senderId === user?.id ? msg.receiverEmail : msg.senderEmail;

        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            userId: otherUserId,
            userName: otherUserName,
            userEmail: otherUserEmail,
            userImage: undefined, // Will be loaded below
            lastMessage: msg.message,
            lastMessageTime: msg.sentAt,
            unreadCount: 0
          });
        }

        const conversation = conversationMap.get(otherUserId)!;

        // Update with most recent message
        if (new Date(msg.sentAt) > new Date(conversation.lastMessageTime)) {
          conversation.lastMessage = msg.message;
          conversation.lastMessageTime = msg.sentAt;
        }

        // Count unread messages (messages sent TO admin that are unread)
        if (msg.receiverId === user?.id && !msg.isRead) {
          conversation.unreadCount++;
        }
      });

      // Convert map to array and sort by last message time
      const conversationList = Array.from(conversationMap.values()).sort((a, b) =>
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );

      // Fetch profile images for all users
      await Promise.all(
        conversationList.map(async (conversation) => {
          try {
            const userResponse = await fetch(`/api/users/by-clerk-id/${conversation.userId}`);
            if (userResponse.ok) {
              const userData = await userResponse.json();
              conversation.userImage = userData.profileImageUrl || userData.imageUrl;
            }
          } catch (error) {
            // Silently fail - avatar will show initials
            console.error(`Failed to load image for ${conversation.userId}`);
          }
        })
      );

      setConversations(conversationList);

      // Auto-select first conversation if none selected
      if (!selectedConversation && conversationList.length > 0) {
        setSelectedConversation(conversationList[0]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredConversations = () => {
    return conversations.filter(conv =>
      conv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex items-center justify-center h-[600px]">
            <div className="flex flex-col items-center space-y-4">
              <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading conversations...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

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
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Conversations List */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <IconMessageCircle className="h-5 w-5" />
                  Conversations
                  {conversations.reduce((acc, c) => acc + c.unreadCount, 0) > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {conversations.reduce((acc, c) => acc + c.unreadCount, 0)}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <IconSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Conversations */}
                <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
                  {getFilteredConversations().length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <IconInbox className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No conversations yet</p>
                    </div>
                  ) : (
                    getFilteredConversations().map((conversation) => (
                      <div
                        key={conversation.userId}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                          selectedConversation?.userId === conversation.userId
                            ? 'bg-accent border-primary'
                            : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage src={conversation.userImage} />
                            <AvatarFallback>
                              {conversation.userName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold text-sm truncate">
                                {conversation.userName}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {conversation.lastMessage}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {getTimeAgo(conversation.lastMessageTime)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <div className="lg:col-span-3 h-[calc(100vh-250px)] max-h-[700px]">
              {selectedConversation ? (
                <ChatInterface
                  currentUserId={user?.id || ''}
                  currentUserName={user?.fullName || user?.firstName || 'Admin'}
                  recipientId={selectedConversation.userId}
                  recipientName={selectedConversation.userName}
                  recipientImage={selectedConversation.userImage}
                  onBack={() => setSelectedConversation(null)}
                />
              ) : (
                <Card>
                  <CardContent className="py-12 md:py-16">
                    <div className="text-center text-muted-foreground">
                      <IconMessageCircle className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium">Select a conversation</p>
                      <p className="text-sm">Choose a student from the list to start chatting</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
