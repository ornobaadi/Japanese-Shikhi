'use client';

import { useState, useEffect } from 'react';
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { IconPlus, IconTrash, IconLoader2, IconStar } from "@tabler/icons-react";
import { toast } from "sonner";

interface Rating {
  _id?: string;
  courseId: string;
  courseName?: string;
  userId: string;
  userName: string;
  userEmail?: string;
  rating: number;
  review: string;
  isVerified: boolean;
  createdAt?: string;
}

export default function AdminRatingsPage() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Rating>({
    courseId: '',
    userId: '',
    userName: '',
    rating: 5,
    review: '',
    isVerified: true,
  });

  useEffect(() => {
    fetchRatings();
    fetchCourses();
  }, []);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/ratings');
      if (response.ok) {
        const data = await response.json();
        setRatings(data.data || []);
      } else {
        toast.error('Failed to fetch ratings');
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      toast.error('Failed to load ratings');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      courseId: '',
      userId: 'admin-' + Date.now(),
      userName: '',
      rating: 5,
      review: '',
      isVerified: true,
    });
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  const handleSubmit = async () => {
    if (!formData.courseId || !formData.userName || formData.rating === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Rating added successfully');
        await fetchRatings();
        handleCloseDialog();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add rating');
      }
    } catch (error) {
      console.error('Error adding rating:', error);
      toast.error('Failed to add rating');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (ratingId?: string) => {
    if (!ratingId) return;
    if (!confirm('Are you sure you want to delete this rating?')) return;

    try {
      const response = await fetch(`/api/admin/ratings/${ratingId}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Rating deleted');
        await fetchRatings();
      } else {
        toast.error('Failed to delete rating');
      }
    } catch (error) {
      console.error('Error deleting rating:', error);
      toast.error('Failed to delete rating');
    }
  };

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Ratings Management</h1>
                <p className="text-muted-foreground">Manage student ratings and add fake ratings</p>
              </div>
              <Button onClick={handleOpenDialog} className="gap-2">
                <IconPlus className="size-4" />
                Add Rating
              </Button>
            </div>

            {/* Ratings List */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <IconLoader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : ratings.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">No ratings yet</p>
                    <Button onClick={handleOpenDialog}>Add First Rating</Button>
                  </CardContent>
                </Card>
              ) : (
                ratings.map((rating) => (
                  <Card key={rating._id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{rating.userName}</h3>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <IconStar
                                key={star}
                                className={`size-4 ${
                                  star <= rating.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          {rating.isVerified && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Verified
                            </Badge>
                          )}
                        </div>
                        {rating.review && (
                          <p className="text-sm text-muted-foreground mb-2">{rating.review}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Course: {rating.courseName || rating.courseId}</span>
                          {rating.createdAt && (
                            <span>{new Date(rating.createdAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(rating._id)}
                      >
                        <IconTrash className="size-4" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Add Rating Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Rating</DialogTitle>
              <DialogDescription>
                Add a fake rating to boost course credibility
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="course">Course *</Label>
                <select
                  id="course"
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="userName">Student Name *</Label>
                <Input
                  id="userName"
                  placeholder="e.g., Ahmed Rahman"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                />
              </div>

              <div>
                <Label>Rating *</Label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="focus:outline-none"
                    >
                      <IconStar
                        className={`size-6 ${
                          star <= formData.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="review">Review (Optional)</Label>
                <textarea
                  id="review"
                  placeholder="Enter review text..."
                  value={formData.review}
                  onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="verified"
                  checked={formData.isVerified}
                  onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="verified" className="cursor-pointer">
                  Mark as Verified Purchase
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <IconLoader2 className="size-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Rating'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
