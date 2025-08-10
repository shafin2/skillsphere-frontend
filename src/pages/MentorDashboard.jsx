import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Star,
  TrendingUp,
  Clock,
  MessageSquare,
  Video,
  ChevronRight,
  Award,
  DollarSign,
  Eye,
  Bot
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import AIBanner from '../components/AIBanner';
import AIMentorInsights from '../components/AIMentorInsights';
import http from '../lib/http';

const MentorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedSessions: 0,
    pendingRequests: 0,
    totalStudents: 0,
    averageRating: 0,
    totalReviews: 0,
    thisMonthEarnings: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch mentor's bookings
      const { data: bookingsData } = await http.get('/bookings');
      const bookings = bookingsData.bookings || [];
      
      // Separate bookings by status and type
      const completed = bookings.filter(b => b.status === 'completed');
      const pending = bookings.filter(b => b.status === 'pending');
      const upcoming = bookings.filter(b => 
        b.status === 'confirmed' && new Date(b.date) > new Date()
      );
      const uniqueStudents = new Set(bookings.map(b => b.learnerId._id)).size;

      setStats(prev => ({
        ...prev,
        totalBookings: bookings.length,
        completedSessions: completed.length,
        pendingRequests: pending.length,
        totalStudents: uniqueStudents,
        thisMonthEarnings: completed.length * 50 // Assuming $50 per session
      }));

      // Set different booking categories
      setRecentBookings(completed.slice(0, 3));
      setPendingRequests(pending.slice(0, 3));
      setUpcomingSessions(upcoming.slice(0, 3));

      // Fetch mentor ratings and feedback
      if (user?.id) {
        try {
          const { data: statsData } = await http.get(`/feedback/mentor/${user.id}/stats`);
          setStats(prev => ({
            ...prev,
            averageRating: statsData.averageRating || 0,
            totalReviews: statsData.totalReviews || 0
          }));

          const { data: feedbackData } = await http.get(`/feedback/mentor/${user.id}?limit=3`);
          setRecentFeedback(feedbackData.feedbacks || []);
        } catch (error) {
          console.error('Error fetching feedback:', error);
        }
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'confirmed': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'completed': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'cancelled': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.fullName || user?.name}! 🎓
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Ready to inspire and guide your students today?
        </p>
      </div>

      {/* AI Banner */}
      <AIBanner userType="mentor" />

      {/* AI Mentor Insights */}
      <AIMentorInsights />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold">{stats.totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Completed Sessions</p>
                <p className="text-3xl font-bold">{stats.completedSessions}</p>
              </div>
              <Award className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Pending Requests</p>
                <p className="text-3xl font-bold">{stats.pendingRequests}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">This Month</p>
                <p className="text-3xl font-bold">${stats.thisMonthEarnings}</p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Your Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(stats.averageRating)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/mentor-bookings">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Booking Requests</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stats.pendingRequests} pending requests
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/profile">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">View Profile</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">See how students see you</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>

      {/* Booking Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                Pending Requests
              </CardTitle>
              <Link to="/mentor-bookings">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-6">
                <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No pending requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((booking, index) => (
                  <div key={booking._id || index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={booking.learnerId?.avatar || '/vite.svg'}
                        alt={booking.learnerId?.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {booking.learnerId?.fullName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formatDate(booking.date)} at {booking.time}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-green-600 dark:text-green-400">
                Upcoming Sessions
              </CardTitle>
              <Link to="/mentor-bookings">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming sessions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((booking, index) => (
                  <div key={booking._id || index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={booking.learnerId?.avatar || '/vite.svg'}
                        alt={booking.learnerId?.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {booking.learnerId?.fullName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formatDate(booking.date)} at {booking.time}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20">
                      Confirmed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Completed Sessions */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Recent Completed Sessions</CardTitle>
              <Link to="/mentor-bookings">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No completed sessions yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Students will start booking sessions with you soon!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking, index) => (
                  <div key={booking._id || index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img
                        src={booking.learnerId?.avatar || '/vite.svg'}
                        alt={booking.learnerId?.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {booking.learnerId?.fullName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(booking.date)} at {booking.time}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20">
                      Completed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Feedback */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">Recent Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            {recentFeedback.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No feedback yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Complete sessions to receive student feedback</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentFeedback.map((feedback, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {renderStars(feedback.rating)}
                        <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                          {feedback.rating}/5
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(feedback.createdAt)}
                      </span>
                    </div>
                    {feedback.comment && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        "{feedback.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Tips to Improve</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Complete Your Profile</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                A complete profile attracts more students and builds trust.
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">Respond Quickly</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Quick responses to booking requests improve your visibility.
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
              <h4 className="font-medium text-purple-900 dark:text-purple-200 mb-2">Gather Feedback</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Encourage students to leave reviews after sessions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MentorDashboard;
