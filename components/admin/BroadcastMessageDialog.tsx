'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { IconSend, IconLoader2, IconPaperclip } from '@tabler/icons-react';

interface BroadcastMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
}

export function BroadcastMessageDialog({
  open,
  onOpenChange,
  currentUserId
}: BroadcastMessageDialogProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in both subject and message');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/messages/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          message
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send broadcast message');
      }

      toast.success(`Message sent to ${data.sentCount} students`);
      setSubject('');
      setMessage('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>📢 Broadcast Message to All Students</DialogTitle>
          <DialogDescription>
            Send an announcement or important message to all enrolled students
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="e.g., Important Announcement, New Course Update"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={sending}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Type your announcement here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={sending}
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This message will be sent to all students individually
            </p>
          </div>

          {/* Preview */}
          {(subject || message) && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Preview:</p>
              {subject && (
                <p className="font-semibold mb-2">{subject}</p>
              )}
              {message && (
                <p className="text-sm whitespace-pre-wrap">{message}</p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !message.trim()}
          >
            {sending ? (
              <>
                <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <IconSend className="h-4 w-4 mr-2" />
                Send to All Students
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
