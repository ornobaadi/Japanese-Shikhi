"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Check } from "lucide-react";

// Facebook Pixel tracking helper
const trackFBEvent = (eventName: string, params?: any) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, params);
  }
};

interface PaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseTitle: string;
  coursePrice: number;
}

export function PaymentForm({ open, onOpenChange, courseId, courseTitle, coursePrice }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'upay' | 'rocket'>('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [screenshot, setScreenshot] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPending, setShowPending] = useState(false);

  const paymentNumbers = {
    bkash: '01XXXXXXXXX',
    nagad: '01XXXXXXXXX',
    upay: '01XXXXXXXXX',
    rocket: '01XXXXXXXXX'
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'image');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.url) {
        setScreenshot(data.url);
        toast.success('Screenshot uploaded successfully!');
      } else {
        toast.error('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionId || !senderNumber || !screenshot) {
      toast.error('Please fill all fields and upload screenshot');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          paymentMethod,
          transactionId,
          senderNumber,
          paymentScreenshot: screenshot
        })
      });

      const data = await response.json();

      if (data.success) {
        // Track Purchase event when payment is submitted
        trackFBEvent('Purchase', {
          content_name: courseTitle,
          content_ids: [courseId],
          content_type: 'product',
          value: coursePrice,
          currency: 'BDT',
          payment_method: paymentMethod
        });
        // Show pending approval message
        setShowPending(true);
        // Reset form
        setTransactionId('');
        setSenderNumber('');
        setScreenshot('');
        
        // Auto-close dialog and refresh page after 3 seconds
        setTimeout(() => {
          onOpenChange(false);
          window.location.reload();
        }, 3000);
      } else {
        toast.error(data.error || 'Failed to submit request');
      }
    } catch (error) {
      toast.error('Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            {courseTitle} - ৳{coursePrice}
          </DialogDescription>
        </DialogHeader>

        {showPending ? (
          <div className="py-12 text-center">
            <Check className="mx-auto mb-4 w-12 h-12 text-green-500" />
            <h2 className="text-2xl font-bold mb-2">Enrollment Request Submitted!</h2>
            <p className="mb-4">Your payment is under review. You will get access to the course after admin approval.</p>
            <Button onClick={() => { setShowPending(false); onOpenChange(false); }}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Method Selection */}
            <div className="space-y-3">
              <Label>Select Payment Method</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['bkash', 'nagad', 'upay', 'rocket'] as const).map((method) => (
                  <Card 
                    key={method}
                    className={`p-4 cursor-pointer transition-all ${
                      paymentMethod === method ? 'border-blue-500 border-2 bg-blue-50' : 'hover:border-gray-400'
                    }`}
                    onClick={() => setPaymentMethod(method)}
                  >
                    <div className="flex flex-col items-center">
                      <div className="text-2xl font-bold uppercase mb-1">{method}</div>
                      {paymentMethod === method && <Check className="w-5 h-5 text-blue-500" />}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Payment Instructions */}
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <h4 className="font-semibold mb-2">Payment Instructions:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Send ৳{coursePrice} to: <strong>{paymentNumbers[paymentMethod]}</strong> via {paymentMethod.toUpperCase()}</li>
                <li>Save the transaction ID and take a screenshot</li>
                <li>Fill the form below with transaction details</li>
                <li>Submit and wait for admin approval</li>
              </ol>
            </Card>

            {/* Transaction ID */}
            <div className="space-y-2">
              <Label htmlFor="transactionId">Transaction ID *</Label>
              <Input
                id="transactionId"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g., BKX123456789"
                required
              />
            </div>

            {/* Sender Number */}
            <div className="space-y-2">
              <Label htmlFor="senderNumber">Your Phone Number *</Label>
              <Input
                id="senderNumber"
                type="tel"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                placeholder="01XXXXXXXXX"
                required
              />
            </div>

            {/* Screenshot Upload */}
            <div className="space-y-2">
              <Label htmlFor="screenshot">Payment Screenshot *</Label>
              <div className="flex gap-2">
                <Input
                  id="screenshot"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleScreenshotUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <label
                  htmlFor="screenshot"
                  className={`flex-1 cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : screenshot ? '✓ Screenshot Uploaded' : 'Upload Screenshot'}
                </label>
                {screenshot && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.open(screenshot, '_blank')}
                  >
                    Preview
                  </Button>
                )}
              </div>
              {screenshot && (
                <p className="text-xs text-green-600">✓ Screenshot uploaded successfully</p>
              )}
              <p className="text-xs text-muted-foreground">Supported: JPG, PNG, GIF, WebP (Max 5MB)</p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={submitting || uploading || !screenshot}
              >
                {submitting ? 'Submitting...' : 'Submit Enrollment Request'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
