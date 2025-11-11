"use client";

import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, X, Eye, RefreshCw } from "lucide-react";

interface EnrollmentRequest {
  _id: string;
  userId: string;
  userEmail: string;
  userName: string;
  courseId: {
    _id: string;
    title: string;
    thumbnailUrl?: string;
  };
  courseName: string;
  coursePrice: number;
  paymentMethod: string;
  transactionId: string;
  senderNumber: string;
  paymentScreenshot?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export default function EnrollmentManagementPage() {
  const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
  const [allRequests, setAllRequests] = useState<EnrollmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<EnrollmentRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchRequests = async (status: string = 'all') => {
    setLoading(true);
    try {
      // Always fetch ALL requests for accurate counts
      const allResponse = await fetch(`/api/admin/enrollments?status=all`);
      const allData = await allResponse.json();
      
      if (allData.success) {
        setAllRequests(allData.data);
        
        // Filter for current tab
        if (status === 'all') {
          setRequests(allData.data);
        } else {
          setRequests(allData.data.filter((r: EnrollmentRequest) => r.status === status));
        }
      }
    } catch (error) {
      toast.error('Failed to fetch enrollment requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(activeTab);
  }, [activeTab]);

  const handleApprove = async (requestId: string) => {
    if (!confirm('Approve this enrollment request?')) return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/enrollments/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'approved',
          adminNotes: adminNotes || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Enrollment approved successfully!');
        fetchRequests(activeTab);
        setShowDetails(false);
        setAdminNotes('');
      } else {
        toast.error(data.error || 'Failed to approve');
      }
    } catch (error) {
      toast.error('Failed to approve enrollment');
    } finally {
      setProcessing(false);
    }
  };

  const handleUnenroll = async (requestId: string, userId: string, courseId: any) => {
    if (!confirm('Remove this student from the course? This will delete their enrollment and progress.')) return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/enrollments/${requestId}/unenroll`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, courseId })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Student unenrolled successfully');
        fetchRequests(activeTab);
      } else {
        toast.error(data.error || 'Failed to unenroll');
      }
    } catch (error) {
      toast.error('Failed to unenroll student');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!adminNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    if (!confirm('Reject this enrollment request?')) return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/enrollments/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'rejected',
          rejectionReason: adminNotes
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Enrollment rejected');
        fetchRequests(activeTab);
        setShowDetails(false);
        setAdminNotes('');
      } else {
        toast.error(data.error || 'Failed to reject');
      }
    } catch (error) {
      toast.error('Failed to reject enrollment');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Use requests directly as they're already filtered
  const filteredRequests = requests;

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
          <div className="@container/main flex flex-1 flex-col gap-2 p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">Enrollment Management</h1>
                <p className="text-gray-600">Review and approve student enrollment requests</p>
              </div>
              <Button onClick={() => fetchRequests(activeTab)}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pending ({allRequests.filter(r => r.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({allRequests.filter(r => r.status === 'approved').length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({allRequests.filter(r => r.status === 'rejected').length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({allRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No enrollment requests found
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredRequests.map((request) => (
                <Card key={request._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {request.userName}
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.toUpperCase()}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{request.userEmail}</CardDescription>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetails(true);
                          setAdminNotes(request.rejectionReason || '');
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Course</p>
                        <p className="font-medium">{request.courseName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Payment Method</p>
                        <p className="font-medium uppercase">{request.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="font-medium">৳{request.coursePrice}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Transaction ID</p>
                        <p className="font-medium">{request.transactionId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone Number</p>
                        <p className="font-medium">{request.senderNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Submitted</p>
                        <p className="font-medium">
                          {new Date(request.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {request.status === 'pending' && (
                      <div className="mt-4 flex gap-2">
                        <Button 
                          size="sm" 
                          variant="default"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => handleApprove(request._id)}
                          disabled={processing}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={async () => {
                            const reason = prompt('Please provide a reason for rejection:');
                            if (!reason || !reason.trim()) {
                              toast.error('Rejection reason is required');
                              return;
                            }
                            
                            if (!confirm('Reject this enrollment request?')) return;

                            setProcessing(true);
                            try {
                              const response = await fetch(`/api/admin/enrollments/${request._id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                  status: 'rejected',
                                  rejectionReason: reason.trim()
                                })
                              });

                              const data = await response.json();

                              if (data.success) {
                                toast.success('Enrollment rejected');
                                fetchRequests(activeTab);
                              } else {
                                toast.error(data.error || 'Failed to reject');
                              }
                            } catch (error) {
                              toast.error('Failed to reject enrollment');
                            } finally {
                              setProcessing(false);
                            }
                          }}
                          disabled={processing}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {request.status === 'approved' && (
                      <div className="mt-4 flex gap-2">
                        <Badge className="bg-green-100 text-green-800">
                          ✓ Approved on {new Date(request.approvedAt!).toLocaleDateString()}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleUnenroll(request._id, request.userId, request.courseId)}
                          disabled={processing}
                        >
                          Remove Enrollment
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Details Modal */}
      {selectedRequest && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Enrollment Request Details</DialogTitle>
              <DialogDescription>
                Review payment information and approve/reject
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Student Name</Label>
                  <p className="font-medium">{selectedRequest.userName}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedRequest.userEmail}</p>
                </div>
                <div>
                  <Label>Course</Label>
                  <p className="font-medium">{selectedRequest.courseName}</p>
                </div>
                <div>
                  <Label>Amount Paid</Label>
                  <p className="font-medium">৳{selectedRequest.coursePrice}</p>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <p className="font-medium uppercase">{selectedRequest.paymentMethod}</p>
                </div>
                <div>
                  <Label>Transaction ID</Label>
                  <p className="font-medium">{selectedRequest.transactionId}</p>
                </div>
                <div>
                  <Label>Sender Phone</Label>
                  <p className="font-medium">{selectedRequest.senderNumber}</p>
                </div>
                <div>
                  <Label>Submitted At</Label>
                  <p className="font-medium">
                    {new Date(selectedRequest.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedRequest.paymentScreenshot && (
                <div>
                  <Label>Payment Screenshot</Label>
                  <div className="mt-2 border rounded-lg overflow-hidden">
                    <img 
                      src={selectedRequest.paymentScreenshot} 
                      alt="Payment Screenshot"
                      className="w-full max-h-96 object-contain bg-gray-50"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => window.open(selectedRequest.paymentScreenshot, '_blank')}
                  >
                    Open in New Tab
                  </Button>
                </div>
              )}

              {selectedRequest.status === 'pending' && (
                <>
                  <div>
                    <Label>Admin Notes (Optional)</Label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes or reason for rejection..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-green-500 hover:bg-green-600"
                      onClick={() => handleApprove(selectedRequest._id)}
                      disabled={processing}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {processing ? 'Processing...' : 'Approve Enrollment'}
                    </Button>
                    <Button 
                      className="flex-1"
                      variant="destructive"
                      onClick={() => handleReject(selectedRequest._id)}
                      disabled={processing || !adminNotes.trim()}
                    >
                      <X className="w-4 h-4 mr-2" />
                      {processing ? 'Processing...' : 'Reject'}
                    </Button>
                  </div>
                </>
              )}

              {selectedRequest.status === 'approved' && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      ✓ Approved on {new Date(selectedRequest.approvedAt!).toLocaleDateString()}
                    </p>
                    {selectedRequest.approvedBy && (
                      <p className="text-sm text-green-600 mt-1">
                        Approved by: {selectedRequest.approvedBy}
                      </p>
                    )}
                  </div>
                  <Button 
                    className="w-full"
                    variant="destructive"
                    onClick={() => {
                      setShowDetails(false);
                      handleUnenroll(selectedRequest._id, selectedRequest.userId, selectedRequest.courseId);
                    }}
                    disabled={processing}
                  >
                    Remove Student from Course
                  </Button>
                </div>
              )}

              {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                <div>
                  <Label>Rejection Reason</Label>
                  <p className="text-red-600 mt-1">{selectedRequest.rejectionReason}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
