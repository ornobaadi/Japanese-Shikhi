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
import { CallDialog } from './CallDialog';

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
  isAdminView?: boolean; // true for admin dashboard, false for student dashboard
}

export function ChatInterface({
  currentUserId,
  currentUserName,
  recipientId,
  recipientName,
  recipientImage,
  onBack,
  isAdminView = false
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video'>('audio');
  const [callingEnabled, setCallingEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if Agora calling is configured
    const agoraAppId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    setCallingEnabled(!!agoraAppId && agoraAppId !== 'your_agora_app_id_here');
  }, []);

  useEffect(() => {
    fetchMessages();
    // Poll every 5 seconds (reduced from 3 for better performance)
    const interval = setInterval(() => {
      // Only poll if component is still mounted and not currently sending
      if (!sending) {
        fetchMessages();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [recipientId, sending]);

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
        // Sort messages by sentAt date (ascending - oldest first)
        const sortedMessages = (data.messages || []).sort((a: Message, b: Message) =>
          new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        );
        setMessages(sortedMessages);

        // Mark unread messages as read (do this asynchronously to avoid blocking)
        const unreadMessages = sortedMessages.filter(
          (msg: Message) => msg.receiverId === currentUserId && !msg.isRead
        );

        if (unreadMessages && unreadMessages.length > 0) {
          // Mark messages as read in background without awaiting
          Promise.all(
            unreadMessages.map((msg: Message) =>
              fetch('/api/messages', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageId: msg._id })
              }).catch((err: Error) => console.error('Failed to mark message as read:', err))
            )
          );
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Don't show error toast during polling to avoid spam
      if (loading) {
        toast.error('Failed to load messages');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate file sizes
    const maxSize = 50 * 1024 * 1024; // 50MB
    const invalidFiles = files.filter(f => f.size > maxSize);

    if (invalidFiles.length > 0) {
      toast.error(`Some files are too large (max 50MB): ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }

    // Limit number of files
    if (files.length > 5) {
      toast.error('You can only send up to 5 files at once');
      return;
    }

    setSelectedFiles(files);
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

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
        toast.loading('Uploading files...', { id: 'upload' });
        for (const file of selectedFiles) {
          try {
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
          } catch (uploadError) {
            toast.dismiss('upload');
            throw new Error(`Failed to upload ${file.name}: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
          }
        }
        toast.dismiss('upload');
      }

      const payload = {
        receiverId: recipientId,
        subject: 'Chat Message',
        message: newMessage || '📎 Attachment',
        contextType: 'general',
        attachments
      };

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Message send error:', errorData);
        throw new Error(errorData.error || errorData.details || 'Failed to send message');
      }

      setNewMessage('');
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchMessages();
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message? This will delete it for everyone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/messages?messageId=${messageId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete');
      }

      toast.success('Message deleted for everyone');
      await fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete message');
    }
  };

  const canDelete = (message: Message) => {
    // Both sender and receiver can delete (Telegram-style)
    return message.senderId === currentUserId || message.receiverId === currentUserId;
  };

  const renderAttachment = (attachment: any) => {
    if (attachment.type === 'image') {
      return (
        <img 
          src={attachment.url} 
          alt={attachment.name}
          className="max-w-[200px] sm:max-w-xs rounded-lg cursor-pointer hover:opacity-90"
          onClick={() => window.open(attachment.url, '_blank')}
        />
      );
    }

    if (attachment.type === 'video') {
      return (
        <video 
          src={attachment.url} 
          controls
          className="max-w-[200px] sm:max-w-xs rounded-lg"
        />
      );
    }

    if (attachment.type === 'audio') {
      return (
        <audio 
          src={attachment.url} 
          controls
          className="max-w-[200px] sm:max-w-xs w-full"
        />
      );
    }

    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-2 md:p-3 bg-muted rounded-lg hover:bg-muted/80"
      >
        <IconFile className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs md:text-sm font-medium truncate">{attachment.name}</p>
          {attachment.size && (
            <p className="text-xs text-muted-foreground">
              {(attachment.size / 1024).toFixed(1)} KB
            </p>
          )}
        </div>
        <IconDownload className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
      </a>
    );
  };

  const startCall = (type: 'audio' | 'video') => {
    setCallType(type);
    setShowCallDialog(true);
  };

  const getChannelName = () => {
    // Create a unique channel name based on user IDs
    const ids = [currentUserId, recipientId].sort();
    return `call_${ids[0]}_${ids[1]}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b bg-muted/30 shrink-0">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="shrink-0">
              <IconX className="h-4 w-4" />
            </Button>
          )}
          <Avatar className="h-8 w-8 md:h-10 md:w-10 shrink-0">
            <AvatarImage src={recipientImage} />
            <AvatarFallback>{recipientName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm md:text-base truncate">{recipientName}</p>
            <p className="text-xs text-muted-foreground">Active now</p>
          </div>
        </div>
        
        {callingEnabled && (
          <div className="flex items-center gap-1 md:gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => startCall('audio')} title="Voice Call" className="h-8 w-8 md:h-9 md:w-9 p-0">
              <IconPhone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => startCall('video')} title="Video Call" className="h-8 w-8 md:h-9 md:w-9 p-0">
              <IconVideo className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isSender = message.senderId === currentUserId;
            const canDeleteMsg = canDelete(message);
            
            // Determine message positioning based on view
            // Admin view: Student messages RIGHT (blue), Admin messages LEFT (gray)
            // Student view: Student messages RIGHT (blue), Admin messages LEFT (gray)
            const isRightSide = isAdminView 
              ? message.senderId === recipientId  // In admin view, recipient (student) messages go right
              : message.senderId === currentUserId; // In student view, current user (student) messages go right

            return (
              <div
                key={message._id}
                className={`flex items-start gap-2 group ${isRightSide ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={isRightSide ? recipientImage : undefined} />
                  <AvatarFallback className="text-xs">
                    {isRightSide ? recipientName.charAt(0) : currentUserName.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className={`flex flex-col max-w-[75%] sm:max-w-[70%] ${isRightSide ? 'items-end' : 'items-start'}`}>
                  <div className="relative">
                    <div
                      className={`rounded-2xl px-3 py-2 md:px-4 md:py-2.5 ${
                        isRightSide
                          ? 'bg-blue-500 text-white'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {message.message && message.message !== '📎 Attachment' && (
                        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.message}</p>
                      )}

                      {message.attachments && message.attachments.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {message.attachments.map((attachment, idx) => (
                            <div key={idx}>{renderAttachment(attachment)}</div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Delete button - appears on hover */}
                    {canDeleteMsg && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`absolute -top-1 ${isRightSide ? '-left-8' : '-right-8'} h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100`}
                        onClick={() => deleteMessage(message._id)}
                        title="Delete message"
                      >
                        <IconTrash className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    )}
                  </div>

                  {/* Time and read status - hidden by default, shown on hover */}
                  <div className={`flex items-center gap-1.5 mt-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity ${isRightSide ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.sentAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {isSender && (
                      message.isRead ? (
                        <IconChecks className="h-3.5 w-3.5 text-blue-500" title="Read" />
                      ) : (
                        <IconCheck className="h-3.5 w-3.5 text-muted-foreground" title="Sent" />
                      )
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
      <div className="border-t p-3 md:p-4 shrink-0">
        {selectedFiles.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {selectedFiles.map((file, idx) => (
              <Badge key={idx} variant="secondary" className="flex items-center gap-2 text-xs">
                <span className="truncate max-w-[120px] md:max-w-none">{file.name}</span>
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
            className="h-9 w-9 p-0 shrink-0"
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
            className="flex-1 text-sm"
          />

          <Button
            onClick={sendMessage}
            disabled={sending || (!newMessage.trim() && selectedFiles.length === 0)}
            size="sm"
            className="h-9 w-9 p-0 shrink-0"
            title={sending ? "Sending..." : "Send message"}
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-current"></div>
            ) : (
              <IconSend className="h-4 w-4 md:h-5 md:w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Call Dialog */}
      {showCallDialog && (
        <CallDialog
          isOpen={showCallDialog}
          onClose={() => setShowCallDialog(false)}
          callType={callType}
          recipientName={recipientName}
          recipientImage={recipientImage}
          channelName={getChannelName()}
        />
      )}
    </div>
  );
}
