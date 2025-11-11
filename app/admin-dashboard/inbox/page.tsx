'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatInterface } from "@/components/admin/ChatInterface";
import { toast } from "sonner";
import { 
  IconInbox, 
  IconSend, 
  IconMail, 
  IconClock,
  IconCheck,
  IconSearch,
  IconFilter,
  IconMessageCircle
} from '@tabler/icons-react';

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  receiverId: string;
  receiverName: string;
  subject: string;
  message: string;
  contextType?: string;
  isRead: boolean;
  readAt?: string;
  sentAt: string;
  threadId?: string;
  replyToId?: string;
}

interface Student {
  _id: string;
  clerkUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  profileImageUrl?: string;
}

export default function AdminInboxPage() {
  const { user } = useUser();
  const [inboxMessages, setInboxMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [chatRecipient, setChatRecipient] = useState<{ id: string; name: string; image?: string } | null>(null);
  const [sending, setSending] = useState(false);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  
  const [replyForm, setReplyForm] = useState({
    message: ''
  });

  const [composeForm, setComposeForm] = useState({
    receiverId: '',
    subject: '',
    message: '',
    contextType: 'general' as 'general' | 'course' | 'assignment' | 'quiz'
  });

  useEffect(() => {
    fetchMessages();
  }, [activeTab]);

  useEffect(() => {
    if (showComposeDialog) {
      fetchStudents();
    }
  }, [showComposeDialog]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        // Get all users (including admins) for admin-to-admin messaging
        const allUsers = Array.isArray(data) 
          ? data.filter((user: any) => user.clerkUserId !== user.id) // Exclude self if needed
          : [];
        setStudents(allUsers);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const type = activeTab === 'inbox' ? 'inbox' : 'sent';
      const response = await fetch(`/api/messages?type=${type}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();
      
      if (activeTab === 'inbox') {
        setInboxMessages(data.messages || []);
        setUnreadCount(data.unreadCount || 0);
      } else {
        setSentMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const viewMessage = async (message: Message) => {
    setSelectedMessage(message);
    setShowMessageDialog(true);

    // Mark as read if unread and in inbox
    if (activeTab === 'inbox' && !message.isRead) {
      try {
        await fetch('/api/messages', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId: message._id })
        });
        fetchMessages(); // Refresh to update read status
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const openChat = (message: Message) => {
    const isInbox = activeTab === 'inbox';
    setChatRecipient({
      id: isInbox ? message.senderId : message.receiverId,
      name: isInbox ? message.senderName : message.receiverName,
      image: undefined // Could be added if available
    });
    setShowChatInterface(true);
  };

  const openReplyDialog = () => {
    setReplyForm({ message: '' });
    setShowMessageDialog(false);
    setShowReplyDialog(true);
  };

  const sendReply = async () => {
    if (!selectedMessage || !replyForm.message) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedMessage.senderId,
          subject: `Re: ${selectedMessage.subject}`,
          message: replyForm.message,
          contextType: selectedMessage.contextType,
          replyToId: selectedMessage._id
        })
      });

      if (!response.ok) throw new Error('Failed to send reply');

      toast.success('Reply sent successfully!');
      setShowReplyDialog(false);
      setReplyForm({ message: '' });
      fetchMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const openComposeDialog = () => {
    setComposeForm({
      receiverId: '',
      subject: '',
      message: '',
      contextType: 'general'
    });
    setShowComposeDialog(true);
  };

  const sendNewMessage = async () => {
    if (!composeForm.receiverId || !composeForm.subject || !composeForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: composeForm.receiverId,
          subject: composeForm.subject,
          message: composeForm.message,
          contextType: composeForm.contextType
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      toast.success('Message sent successfully!');
      setShowComposeDialog(false);
      setComposeForm({
        receiverId: '',
        subject: '',
        message: '',
        contextType: 'general'
      });
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getFilteredMessages = () => {
    const messages = activeTab === 'inbox' ? inboxMessages : sentMessages;
    
    return messages.filter(msg => {
      const matchesSearch = 
        msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = 
        filterType === 'all' || 
        msg.contextType === filterType ||
        (filterType === 'unread' && !msg.isRead);
      
      return matchesSearch && matchesFilter;
    });
  };

  const renderMessagesList = () => {
    const filteredMessages = getFilteredMessages();

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (filteredMessages.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <IconMail className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No messages found</p>
          <p className="text-sm">
            {activeTab === 'inbox' 
              ? "You don't have any messages yet" 
              : "You haven't sent any messages yet"
            }
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {filteredMessages.map((message) => (
          <div
            key={message._id}
            className={`p-4 border rounded-lg transition-colors ${
              activeTab === 'inbox' && !message.isRead ? 'bg-blue-50 dark:bg-blue-950 border-blue-200' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {activeTab === 'inbox' ? message.senderName.charAt(0) : message.receiverName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">
                      {activeTab === 'inbox' ? message.senderName : message.receiverName}
                    </span>
                    {activeTab === 'inbox' && !message.isRead && (
                      <Badge variant="default" className="text-xs">New</Badge>
                    )}
                    {message.contextType && message.contextType !== 'general' && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {message.contextType}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openChat(message);
                      }}
                      className="h-8"
                    >
                      <IconMessageCircle className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <IconClock className="h-3 w-3" />
                      {new Date(message.sentAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <p 
                  className="text-sm font-medium mb-1 cursor-pointer hover:text-primary"
                  onClick={() => viewMessage(message)}
                >
                  {message.subject}
                </p>
                <p 
                  className="text-sm text-muted-foreground line-clamp-2 cursor-pointer"
                  onClick={() => viewMessage(message)}
                >
                  {message.message}
                </p>
                
                {activeTab === 'inbox' && (
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="text-muted-foreground">To: {message.receiverName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Inbox</h1>
              <p className="text-muted-foreground">
                Manage messages from students
              </p>
            </div>
            <Button onClick={openComposeDialog} className="flex items-center gap-2">
              <IconSend className="h-4 w-4" />
              Compose Message
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                <IconInbox className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Inbox</CardTitle>
                <IconMail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inboxMessages.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sent Messages</CardTitle>
                <IconSend className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sentMessages.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <IconSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="unread">Unread Only</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="course">Course Related</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="quiz">Quiz Related</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full md:w-[400px] grid-cols-2">
                  <TabsTrigger value="inbox" className="relative">
                    Inbox
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="sent">Sent</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {renderMessagesList()}
            </CardContent>
          </Card>
        </div>

        {/* View Message Dialog */}
        <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedMessage?.subject}</DialogTitle>
              <DialogDescription>
                {activeTab === 'inbox' ? 'From' : 'To'}: {activeTab === 'inbox' ? selectedMessage?.senderName : selectedMessage?.receiverName}
                {selectedMessage?.senderEmail && ` (${selectedMessage.senderEmail})`}
                {' • '}
                {selectedMessage?.sentAt && new Date(selectedMessage.sentAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            {selectedMessage && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {selectedMessage.contextType && selectedMessage.contextType !== 'general' && (
                    <Badge variant="outline" className="capitalize">
                      {selectedMessage.contextType}
                    </Badge>
                  )}
                  {activeTab === 'inbox' && selectedMessage.isRead && (
                    <Badge variant="secondary" className="text-xs">
                      <IconCheck className="h-3 w-3 mr-1" />
                      Read
                    </Badge>
                  )}
                </div>
                
                <div className="p-4 rounded-lg bg-muted/50 whitespace-pre-wrap text-sm">
                  {selectedMessage.message}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
                    Close
                  </Button>
                  {activeTab === 'inbox' && (
                    <Button onClick={openReplyDialog}>
                      <IconSend className="h-4 w-4 mr-2" />
                      Reply to Student
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reply Dialog */}
        <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reply to {selectedMessage?.senderName}</DialogTitle>
              <DialogDescription>
                Re: {selectedMessage?.subject}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Show original message */}
              <div className="p-3 rounded-lg bg-muted/30 border-l-4 border-muted-foreground/30">
                <p className="text-xs text-muted-foreground mb-2">Original message:</p>
                <p className="text-sm line-clamp-3">{selectedMessage?.message}</p>
              </div>

              <div>
                <Label htmlFor="reply-message">Your Reply *</Label>
                <Textarea
                  id="reply-message"
                  placeholder="Type your reply here..."
                  value={replyForm.message}
                  onChange={(e) => setReplyForm({ message: e.target.value })}
                  rows={6}
                  maxLength={5000}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {replyForm.message.length}/5000 characters
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowReplyDialog(false)}
                  disabled={sending}
                >
                  Cancel
                </Button>
                <Button onClick={sendReply} disabled={sending}>
                  {sending ? 'Sending...' : 'Send Reply'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Compose New Message Dialog */}
        <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Compose New Message</DialogTitle>
              <DialogDescription>
                Send a message to a student
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Student Selection */}
              <div>
                <Label htmlFor="student-select">Select Student *</Label>
                <Select
                  value={composeForm.receiverId}
                  onValueChange={(value) => setComposeForm({ ...composeForm, receiverId: value })}
                >
                  <SelectTrigger id="student-select">
                    <SelectValue placeholder={loadingStudents ? "Loading students..." : "Select a student"} />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingStudents ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : students.length === 0 ? (
                      <SelectItem value="none" disabled>No students found</SelectItem>
                    ) : (
                      students.map((student) => (
                        <SelectItem key={student.clerkUserId} value={student.clerkUserId}>
                          {student.firstName && student.lastName 
                            ? `${student.firstName} ${student.lastName}`
                            : student.username || student.email
                          } ({student.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Message Type */}
              <div>
                <Label htmlFor="message-type">Message Type</Label>
                <Select
                  value={composeForm.contextType}
                  onValueChange={(value: any) => setComposeForm({ ...composeForm, contextType: value })}
                >
                  <SelectTrigger id="message-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="course">Course Related</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subject */}
              <div>
                <Label htmlFor="compose-subject">Subject *</Label>
                <Input
                  id="compose-subject"
                  placeholder="Enter subject"
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {composeForm.subject.length}/200 characters
                </p>
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="compose-message">Message *</Label>
                <Textarea
                  id="compose-message"
                  placeholder="Type your message here..."
                  value={composeForm.message}
                  onChange={(e) => setComposeForm({ ...composeForm, message: e.target.value })}
                  rows={8}
                  maxLength={5000}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {composeForm.message.length}/5000 characters
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowComposeDialog(false)}
                  disabled={sending}
                >
                  Cancel
                </Button>
                <Button onClick={sendNewMessage} disabled={sending || !composeForm.receiverId || !composeForm.subject || !composeForm.message}>
                  {sending ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Chat Interface Dialog */}
        <Dialog open={showChatInterface} onOpenChange={setShowChatInterface}>
          <DialogContent className="max-w-5xl h-[90vh] p-0">
            {showChatInterface && chatRecipient && user && (
              <ChatInterface
                currentUserId={user.id}
                currentUserName={user.fullName || `${user.firstName} ${user.lastName}` || 'Admin'}
                recipientId={chatRecipient.id}
                recipientName={chatRecipient.name}
                recipientImage={chatRecipient.image}
                onBack={() => setShowChatInterface(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
