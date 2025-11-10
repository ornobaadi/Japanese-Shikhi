'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import { IconMail, IconSend, IconInbox, IconClock, IconCheck } from '@tabler/icons-react';

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  subject: string;
  message: string;
  contextType?: string;
  isRead: boolean;
  readAt?: string;
  sentAt: string;
  threadId?: string;
}

export default function StudentMessaging() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [sending, setSending] = useState(false);
  
  const [messageForm, setMessageForm] = useState({
    subject: '',
    message: '',
    contextType: 'general' as 'course' | 'assignment' | 'quiz' | 'general'
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages?type=inbox');
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();
      setMessages(data.messages || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageForm.subject || !messageForm.message) {
      toast.error('Please fill in subject and message');
      return;
    }

    setSending(true);
    try {
      console.log('Sending message:', {
        receiverId: 'admin',
        subject: messageForm.subject,
        message: messageForm.message,
        contextType: messageForm.contextType
      });

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: 'admin', // Send to all admins
          subject: messageForm.subject,
          message: messageForm.message,
          contextType: messageForm.contextType
        })
      });

      const data = await response.json();
      console.log('Response:', data);

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to send message');
      }

      toast.success('Message sent to admin team!');
      setShowComposeDialog(false);
      setMessageForm({ subject: '', message: '', contextType: 'general' });
      fetchMessages(); // Refresh messages
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const viewMessage = async (message: Message) => {
    setSelectedMessage(message);
    setShowMessageDialog(true);

    // Mark as read if unread
    if (!message.isRead) {
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

  const replyToMessage = () => {
    if (!selectedMessage) return;
    
    setMessageForm({
      subject: `Re: ${selectedMessage.subject}`,
      message: '',
      contextType: (selectedMessage.contextType as any) || 'general'
    });
    setShowMessageDialog(false);
    setShowComposeDialog(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconInbox className="h-5 w-5" />
                Messages
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount} new
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Contact admin team or view their responses
              </CardDescription>
            </div>
            <Button onClick={() => setShowComposeDialog(true)}>
              <IconSend className="h-4 w-4 mr-2" />
              Contact Admin
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <IconMail className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No messages yet</p>
              <p className="text-sm">Click "Contact Admin" to send your first message</p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((message) => (
                <div
                  key={message._id}
                  onClick={() => viewMessage(message)}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                    !message.isRead ? 'bg-blue-50 dark:bg-blue-950 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{message.subject}</h4>
                        {!message.isRead && (
                          <Badge variant="default" className="text-xs">New</Badge>
                        )}
                        {message.contextType && message.contextType !== 'general' && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {message.contextType}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        From: {message.senderName}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <IconClock className="h-3 w-3" />
                        {new Date(message.sentAt).toLocaleDateString()}
                      </div>
                      {message.isRead && (
                        <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                          <IconCheck className="h-3 w-3" />
                          Read
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {message.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compose Message Dialog */}
      <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Admin Team</DialogTitle>
            <DialogDescription>
              Send a message to the admin team. Any admin can respond to your message.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="What is this about?"
                value={messageForm.subject}
                onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                value={messageForm.message}
                onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                rows={6}
                maxLength={5000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {messageForm.message.length}/5000 characters
              </p>
            </div>

            <div>
              <Label htmlFor="contextType">Message Category</Label>
              <Select 
                value={messageForm.contextType} 
                onValueChange={(value: any) => setMessageForm(prev => ({ ...prev, contextType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Question</SelectItem>
                  <SelectItem value="course">Course Related</SelectItem>
                  <SelectItem value="assignment">Assignment Help</SelectItem>
                  <SelectItem value="quiz">Quiz Related</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowComposeDialog(false)}
                disabled={sending}
              >
                Cancel
              </Button>
              <Button onClick={sendMessage} disabled={sending}>
                {sending ? 'Sending...' : 'Send to Admin'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
            <DialogDescription>
              From: {selectedMessage?.senderName} • {selectedMessage?.sentAt && new Date(selectedMessage.sentAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4">
              {selectedMessage.contextType && selectedMessage.contextType !== 'general' && (
                <Badge variant="outline" className="capitalize">
                  {selectedMessage.contextType}
                </Badge>
              )}
              
              <div className="whitespace-pre-wrap text-sm">
                {selectedMessage.message}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
                  Close
                </Button>
                <Button onClick={replyToMessage}>
                  <IconSend className="h-4 w-4 mr-2" />
                  Reply
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
