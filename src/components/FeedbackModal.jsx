import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import Button from './ui/Button';
import http from '../lib/http';

const FeedbackModal = ({ 
  isOpen, 
  onClose, 
  bookingId, 
  mentorName,
  onSubmitSuccess 
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if user is authenticated
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Please log in to submit feedback');
      }

      const { data } = await http.post('/feedback', {
        bookingId,
        rating,
        comment: comment.trim()
      });

      console.log('Feedback submitted successfully:', data);
      
      // Show success state
      setIsSuccess(true);
      
      // Reset form
      setRating(0);
      setHoveredRating(0);
      setComment('');
      
      // Call success callback
      if (onSubmitSuccess) {
        onSubmitSuccess(data.feedback);
      }
      
      // Show success message briefly before closing
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Error submitting feedback:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (error.response?.status === 403) {
        setError('You are not authorized to submit feedback for this session.');
      } else if (error.response?.status === 400) {
        setError(error.response?.data?.error || 'Invalid feedback data. Please check your input.');
      } else if (error.message === 'Please log in to submit feedback') {
        setError(error.message);
      } else {
        setError(error.response?.data?.error || error.message || 'Failed to submit feedback. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating) => {
    setHoveredRating(starRating);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select a rating';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Rate Your Mentor</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors text-xl"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-6 text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-600">Your feedback has been submitted successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            {/* Mentor Info */}
            <div className="mb-6">
              <p className="text-gray-600">
                How was your session with{' '}
                <span className="font-medium text-gray-900">{mentorName}</span>?
              </p>
            </div>

            {/* Rating Stars */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              <div className="flex items-center space-x-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => handleStarHover(star)}
                    onMouseLeave={handleStarLeave}
                    className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    disabled={isSubmitting}
                  >
                    <span
                      className={`text-2xl transition-colors ${
                        star <= (hoveredRating || rating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    >
                      ⭐
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                {getRatingText(hoveredRating || rating)}
              </p>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Comment (Optional)
              </label>
              <textarea
                id="comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this mentor..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={500}
                disabled={isSubmitting}
              />
              <p className="text-sm text-gray-500 mt-1">
                {comment.length}/500 characters
              </p>
            </div>

            {/* Privacy Notice */}
            <div className="mb-6 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Privacy:</span> Your feedback will be anonymized. 
                The mentor will see your rating and comment but not your identity.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="flex-1"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
