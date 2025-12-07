'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { IconStar, IconLoader2 } from '@tabler/icons-react';
import { useUser } from '@clerk/nextjs';

interface RatingFormProps {
  courseId: string;
  onRatingSubmitted: () => void;
}

export default function RatingForm({ courseId, onRatingSubmitted }: RatingFormProps) {
  const { user } = useUser();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!user) {
      toast.error('Please sign in to submit a review');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          userId: user.id,
          userName: user.fullName || user.username || user.emailAddresses[0]?.emailAddress || 'Anonymous',
          userEmail: user.emailAddresses[0]?.emailAddress,
          rating,
          review,
        }),
      });

      if (response.ok) {
        toast.success('Thank you for your review!');
        setRating(0);
        setReview('');
        onRatingSubmitted();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Star Rating */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">Your Rating:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <IconStar
                className={`w-6 h-6 ${
                  star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && <span className="text-sm text-gray-600">{rating} out of 5</span>}
      </div>

      {/* Review Text */}
      <div>
        <label className="text-sm font-semibold block mb-2">Your Review (Optional)</label>
        <Textarea
          placeholder="Share your experience with this course..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={4}
          className="resize-none"
        />
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={loading || rating === 0}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-500"
      >
        {loading ? (
          <>
            <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Review'
        )}
      </Button>
    </div>
  );
}
