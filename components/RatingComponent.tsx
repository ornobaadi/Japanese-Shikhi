'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { IconStar, IconLoader2, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";

interface Rating {
  _id?: string;
  courseId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  rating: number;
  review: string;
  isFakeRating?: boolean;
  isVerified?: boolean;
  createdAt: string;
}

interface RatingComponentProps {
  courseId: string;
  isAdmin?: boolean;
  isCompleted?: boolean;
  userName?: string;
  userEmail?: string;
}

export default function RatingComponent({
  courseId,
  isAdmin = false,
  isCompleted = false,
  userName,
  userEmail,
}: RatingComponentProps) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    rating: 5,
    review: '',
  });

  useEffect(() => {
    fetchRatings();
  }, [courseId]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ratings?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setRatings(data.data || []);
        setAvgRating(data.stats?.averageRating || 0);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!formData.review.trim()) {
      toast.error('Review is required');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          rating: formData.rating,
          review: formData.review,
          userName: userName || 'Anonymous',
          userEmail,
        }),
      });

      if (response.ok) {
        toast.success('Thank you for your rating!');
        setFormData({ rating: 5, review: '' });
        setShowForm(false);
        await fetchRatings();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRating = async (ratingId?: string) => {
    if (!ratingId) return;
    if (!confirm('Delete this rating?')) return;

    try {
      const response = await fetch(`/api/admin/ratings/${ratingId}`, {
        method: 'DELETE',
      });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <IconLoader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Course Ratings</CardTitle>
          <CardDescription>
            {ratings.length} {ratings.length === 1 ? 'rating' : 'ratings'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-4xl font-bold">{avgRating.toFixed(1)}</div>
              <div className="flex gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <IconStar
                    key={i}
                    className={`size-5 ${i < Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Submit Rating Button */}
          {!isAdmin && isCompleted && !showForm && (
            <Button onClick={() => setShowForm(true)} className="w-full">
              Add Your Rating
            </Button>
          )}

          {/* Rating Form */}
          {(isAdmin || isCompleted) && showForm && (
            <div className="space-y-4 p-4 bg-secondary/50 rounded-lg">
              <div>
                <Label>Rating</Label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1"
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
                <Label htmlFor="review">Review</Label>
                <Textarea
                  id="review"
                  placeholder="Share your thoughts about this course..."
                  value={formData.review}
                  onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                  rows={4}
                />
              </div>

              {isAdmin && (
                <div>
                  <Label htmlFor="ratingName">Name (for admin ratings)</Label>
                  <Input
                    id="ratingName"
                    placeholder="Reviewer name"
                    value={userName}
                    readOnly
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitRating}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <IconLoader2 className="size-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Rating'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ratings List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Student Reviews</h3>
        {ratings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No ratings yet. Be the first to rate this course!</p>
            </CardContent>
          </Card>
        ) : (
          ratings.map((rating) => (
            <Card key={rating._id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{rating.userName}</span>
                    {rating.isFakeRating && (
                      <Badge variant="secondary" className="text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <IconStar
                        key={i}
                        className={`size-4 ${
                          i < rating.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{rating.review}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRating(rating._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <IconTrash className="size-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
