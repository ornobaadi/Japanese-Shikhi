'use client';

import { useEffect, useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  IconSend, 
  IconPaperclip, 
  IconTrash,
  IconCheck,
  IconChecks,
  IconPhone,
  IconVideo,
  IconX,
  IconDownload,
  IconFile
} from '@tabler/icons-react';
import { toast } from "sonner";

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  message: string;
  messageType?: 'text' | 'image' | 'video' | 'audio' | 'file';
  isRead: boolean;
  sentAt: string;
  isDeleted?: boolean;
  attachments?: {
    type: string;
    url: string;
    name: string;
    size?: number;
  }[];
}

interface ChatInterfaceProps {
  currentUserId: string;
  currentUserName: string;
  recipientId: string;
  recipientName: string;
  recipientImage?: string;
  onBack?: () => void;
}

export function ChatInterface({
  currentUserId,
  currentUserName,
  recipientId,
  recipientName,
  recipientImage,
  onBack
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [recipientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?studentId=${recipientId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        
        // Mark unread messages as read
        const unreadMessages = data.messages?.filter(
          (msg: Message) => msg.receiverId === currentUserId && !msg.isRead
        );
        
        if (unreadMessages && unreadMessages.length > 0) {
          for (const msg of unreadMessages) {
            await fetch('/api/messages', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ messageId: msg._id })
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Upload failed');
    
    const data = await response.json();
    return data.url;
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    setSending(true);
    try {
      let attachments = [];

      // Upload files if any
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const url = await uploadFile(file);
          const fileType = file.type.startsWith('image/') ? 'image' :
                          file.type.startsWith('video/') ? 'video' :
                          file.type.startsWith('audio/') ? 'audio' : 'file';
          
          attachments.push({
            type: fileType,
            url,
            name: file.name,
            size: file.size,
            mimeType: file.type
          });
        }
      }

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: recipientId,
          subject: 'Chat Message',
          message: newMessage || '📎 Attachment',
          contextType: 'general',
          attachments
        })
      });

      if (!response.ok) throw new Error('Failed to send');

      setNewMessage('');
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchMessages();
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages?messageId=${messageId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success('Message deleted');
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const canDelete = (message: Message) => {
    if (message.senderId !== currentUserId) return false;
    const sentTime = new Date(message.sentAt).getTime();
    const now = Date.now();
    return (now - sentTime) < 5 * 60 * 1000; // 5 minutes
  };

  const renderAttachment = (attachment: any) => {
    if (attachment.type === 'image') {
      return (
        <img 
          src={attachment.url} 
          alt={attachment.name}
          className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
          onClick={() => window.open(attachment.url, '_blank')}
        />
      );
    }

    if (attachment.type === 'video') {
      return (
        <video 
          src={attachment.url} 
          controls
          className="max-w-xs rounded-lg"
        />
      );
    }

    if (attachment.type === 'audio') {
      return (
        <audio 
          src={attachment.url} 
          controls
          className="max-w-xs"
        />
      );
    }

    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-3 bg-muted rounded-lg hover:bg-muted/80"
      >
        <IconFile className="h-5 w-5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{attachment.name}</p>
          {attachment.size && (
            <p className="text-xs text-muted-foreground">
              {(attachment.size / 1024).toFixed(1)} KB
            </p>
          )}
        </div>
        <IconDownload className="h-4 w-4" />
      </a>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <IconX className="h-4 w-4" />
            </Button>
          )}
          <Avatar>
            <AvatarImage src={recipientImage} />
            <AvatarFallback>{recipientName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{recipientName}</p>
            <p className="text-xs text-muted-foreground">Active now</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" title="Voice Call (Coming Soon)" disabled>
            <IconPhone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Video Call (Coming Soon)" disabled>
            <IconVideo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isSender = message.senderId === currentUserId;
            const canDeleteMsg = canDelete(message);

            return (
              <div
                key={message._id}
                className={`flex items-end gap-2 ${isSender ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {isSender ? currentUserName.charAt(0) : recipientName.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className={`flex flex-col max-w-[70%] ${isSender ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isSender
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.message && message.message !== '📎 Attachment' && (
                      <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                    )}
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {message.attachments.map((attachment, idx) => (
                          <div key={idx}>{renderAttachment(attachment)}</div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 px-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.sentAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    {isSender && (
                      <>
                        {message.isRead ? (
                          <IconChecks className="h-3 w-3 text-blue-500" />
                        ) : (
                          <IconCheck className="h-3 w-3 text-muted-foreground" />
                        )}
                        {canDeleteMsg && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={() => deleteMessage(message._id)}
                          >
                            <IconTrash className="h-3 w-3 text-red-500" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        {selectedFiles.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {selectedFiles.map((file, idx) => (
              <Badge key={idx} variant="secondary" className="flex items-center gap-2">
                {file.name}
                <button onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== idx))}>
                  <IconX className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
          >
            <IconPaperclip className="h-5 w-5" />
          </Button>

          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={sending}
            className="flex-1"
          />

          <Button
            onClick={sendMessage}
            disabled={sending || (!newMessage.trim() && selectedFiles.length === 0)}
            size="sm"
          >
            <IconSend className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
