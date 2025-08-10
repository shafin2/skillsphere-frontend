import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, User, Calendar, Clock, MessageSquare } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import BookingModal from '../components/BookingModal';
import { useAuth } from '../context/AuthContext';
import http from '../lib/http';

const MentorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mentor, setMentor] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [hasMoreFeedback, setHasMoreFeedback] = useState(true);
  const [bookingMessage, setBookingMessage] = useState(null);

  const handleBookSession = () => {
    if (!user) {
      // Store current path and redirect to login
      localStorage.setItem('redirectAfterLogin', `/mentors/${id}`)
      navigate('/auth/login')
      return
    }
    
    if (!user.roles?.includes('learner')) {
      setBookingMessage({ 
        text: 'Only learners can book sessions with mentors.', 
        type: 'error' 
      })
      return
    }
    console.log(mentor);
    if (!mentor.isApproved) {
      setBookingMessage({ 
        text: 'This mentor is not available for booking.', 
        type: 'error' 
      })
      return
    }
    
    setShowBookingModal(true)
  }

  const handleBookingSuccess = (message) => {
    setShowBookingModal(false)
    // Store success message in localStorage and redirect to dashboard
    localStorage.setItem('dashboardMessage', JSON.stringify(message))
    navigate('/dashboard')
  }

  const getBookingButtonConfig = () => {
    if (!user) {
      return {
        text: 'Book Session',
        disabled: false,
        tooltip: 'Login to book a session'
      }
    }

    if (!user.roles?.includes('learner')) {
      return {
        text: 'Book Session',
        disabled: true,
        tooltip: 'Only learners can book sessions'
      }
    }
    if (!mentor?.isApproved) {
      return {
        text: 'Not Available',
        disabled: true,
        tooltip: 'This mentor is not available for booking'
      }
    }

    return {
      text: 'Book Session',
      disabled: false,
      tooltip: 'Book a mentoring session'
    }
  }

  const handleShareProfile = async () => {
    const profileUrl = window.location.href
    try {
      await navigator.clipboard.writeText(profileUrl)
      alert('Profile link copied to clipboard!')
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = profileUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Profile link copied to clipboard!')
    }
  }

  useEffect(() => {
    fetchMentorDetails();
    fetchMentorStats();
    fetchMentorFeedback();
  }, [id]);

  const fetchMentorDetails = async () => {
    try {
      const { data } = await http.get(`/mentors/${id}`);
      setMentor(data.mentor);
    } catch (error) {
      console.error('Error fetching mentor details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMentorStats = async () => {
    try {
      const { data } = await http.get(`/feedback/mentor/${id}/stats`);
      setStats(data);
    } catch (error) {
      console.error('Error fetching mentor stats:', error);
    }
  };

  const fetchMentorFeedback = async (page = 1, append = false) => {
    setFeedbackLoading(true);
    
    try {
      const { data } = await http.get(`/feedback/mentor/${id}?page=${page}&limit=5`);
      
      if (append) {
        setFeedback(prev => [...prev, ...data.feedbacks]);
      } else {
        setFeedback(data.feedbacks);
      }
      
      setHasMoreFeedback(data.pagination.hasNext);
      setFeedbackPage(page);
    } catch (error) {
      console.error('Error fetching mentor feedback:', error);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const loadMoreFeedback = () => {
    if (!feedbackLoading && hasMoreFeedback) {
      fetchMentorFeedback(feedbackPage + 1, true);
    }
  };

  const renderStars = (rating, size = 'text-base') => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${size} ${
              star <= rating
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!stats?.ratingDistribution) return null;

    const total = stats.totalReviews;
    
    return (
      <div className="space-y-2">
        <h4 className="font-medium text-gray-900">Rating Distribution</h4>
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.ratingDistribution[rating] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center space-x-2 text-sm">
              <span className="w-2">{rating}</span>
              <span className="text-yellow-400">⭐</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-gray-600">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Mentor Not Found</h2>
          <p className="text-gray-600">The mentor you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Booking Message */}
      {bookingMessage && (
        <div className={`mb-6 p-4 rounded-lg ${
          bookingMessage.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {bookingMessage.text}
        </div>
      )}

      {/* Mentor Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            <img
              src={mentor.avatar || '/vite.svg'}
              alt={mentor.fullName}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{mentor.fullName}</h1>
                    
                    {stats && (
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center space-x-1">
                          {renderStars(stats.averageRating)}
                          <span className="font-medium text-gray-900">
                            {stats.averageRating?.toFixed(1) || '0.0'}
                          </span>
                          <span className="text-gray-600">
                            ({stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''})
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleShareProfile}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                    title="Share profile"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Share
                  </button>
                </div>
                
                {mentor.bio && (
                  <p className="text-gray-600 mb-4">{mentor.bio}</p>
                )}
                
                {mentor.skills && mentor.skills.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {mentor.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {mentor.experience && (
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 mb-2">Experience</h3>
                    <p className="text-gray-600">{mentor.experience}</p>
                  </div>
                )}
              </div>
              
              <div className="text-right">
                {(() => {
                  const buttonConfig = getBookingButtonConfig()
                  return (
                    <div className="relative group">
                      <Button 
                        onClick={handleBookSession}
                        disabled={buttonConfig.disabled}
                        className={`mb-2 ${buttonConfig.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={buttonConfig.tooltip}
                      >
                        📅 {buttonConfig.text}
                      </Button>
                      {buttonConfig.disabled && (
                        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                          {buttonConfig.tooltip}
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ratings Overview */}
        {stats && stats.totalReviews > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Ratings & Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {stats.averageRating?.toFixed(1) || '0.0'}
                  </div>
                  {renderStars(stats.averageRating, 'w-6 h-6')}
                  <p className="text-gray-600 mt-2">
                    Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <div>
                  {renderRatingDistribution()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Student Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {feedback.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl text-gray-400 mb-4">💬</div>
                <p className="text-gray-600">No reviews yet</p>
                <p className="text-sm text-gray-500">Be the first to book and review this mentor!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {feedback.map((review, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-600">👤</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Anonymous Student</p>
                          <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                        </div>
                      </div>
                      {renderStars(review.rating)}
                    </div>
                    
                    {review.comment && (
                      <p className="text-gray-700 ml-13">{review.comment}</p>
                    )}
                  </div>
                ))}
                
                {hasMoreFeedback && (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={loadMoreFeedback}
                      disabled={feedbackLoading}
                    >
                      {feedbackLoading ? 'Loading...' : 'Load More Reviews'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          mentor={mentor}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default MentorDetails;
