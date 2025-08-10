import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Search, 
  BookOpen, 
  Clock, 
  Star,
  TrendingUp,
  Users,
  MessageSquare,
  Video,
  ChevronRight,
  Award,
  Bot
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import AIBanner from '../components/AIBanner';
import AIRecommendedMentors from '../components/AIRecommendedMentors';
import http from '../lib/http';

const LearnerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedSessions: 0,
    upcomingBookings: 0,
    totalLearningHours: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    
    // Check for success message from booking
    const message = localStorage.getItem('dashboardMessage');
    if (message) {
      try {
        setSuccessMessage(JSON.parse(message));
        localStorage.removeItem('dashboardMessage');
        // Clear message after 5 seconds
        setTimeout(() => setSuccessMessage(null), 5000);
      } catch (e) {
        console.error('Error parsing dashboard message:', e);
      }
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user's bookings
      const { data: bookingsData } = await http.get('/bookings');
      const bookings = bookingsData.bookings || [];
      
      // Separate bookings by status and type
      const completed = bookings.filter(b => b.status === 'completed');
      const upcoming = bookings.filter(b => 
        b.status === 'confirmed' && new Date(b.date) > new Date()
      );
      const pending = bookings.filter(b => b.status === 'pending');
      const recentCompleted = completed.slice(0, 3); // Last 3 completed

      setStats({
        totalBookings: bookings.length,
        completedSessions: completed.length,
        upcomingBookings: upcoming.length,
        totalLearningHours: completed.length * 1 // Assuming 1 hour per session
      });

      // Set different booking categories
      setRecentBookings(recentCompleted);
      setUpcomingBookings(upcoming.slice(0, 3));
      setPendingBookings(pending.slice(0, 3));

      // TODO: Fetch recommended mentors based on user interests
      // For now, we'll use a placeholder
      setRecommendedMentors([]);

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
      {/* Success Message */}
      {successMessage && (
        <div className={`rounded-lg p-4 mb-6 ${
          successMessage.type === 'success' 
            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
            : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <p className="font-medium">{successMessage.message}</p>
            <button 
              onClick={() => setSuccessMessage(null)}
              className="text-current opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.fullName || user?.name}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Ready to continue your learning journey?
        </p>
      </div>

      {/* AI Banner */}
      <AIBanner userType="learner" />

      {/* AI Recommended Mentors */}
      <AIRecommendedMentors />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Bookings</p>
                <p className="text-3xl font-bold">{stats.totalBookings}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-200" />
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
                <p className="text-purple-100 text-sm font-medium">Upcoming Sessions</p>
                <p className="text-3xl font-bold">{stats.upcomingBookings}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Learning Hours</p>
                <p className="text-3xl font-bold">{stats.totalLearningHours}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link to="/mentors">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Find Mentors</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Discover expert mentors in your field</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link to="/bookings">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">My Bookings</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage your scheduled sessions</p>
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
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Update Profile</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Keep your information current</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Booking Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                Pending Requests
              </CardTitle>
              <Link to="/bookings">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {pendingBookings.length === 0 ? (
              <div className="text-center py-6">
                <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No pending requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingBookings.map((booking, index) => (
                  <div key={booking._id || index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={booking.mentorId?.avatar || '/vite.svg'}
                        alt={booking.mentorId?.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {booking.mentorId?.fullName}
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
              <Link to="/bookings">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming sessions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((booking, index) => (
                  <div key={booking._id || index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={booking.mentorId?.avatar || '/vite.svg'}
                        alt={booking.mentorId?.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {booking.mentorId?.fullName}
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

      {/* Recent Completed Sessions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Recent Completed Sessions</CardTitle>
            <Link to="/bookings">
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
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Start your learning journey by booking a session</p>
              <Link to="/mentors">
                <Button>Find Mentors</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking, index) => (
                <div key={booking._id || index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img
                      src={booking.mentorId?.avatar || '/vite.svg'}
                      alt={booking.mentorId?.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {booking.mentorId?.fullName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(booking.date)} at {booking.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20">
                      Completed
                    </span>
                    <Button variant="outline" size="sm">
                      Leave Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Goals Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Your Learning Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">Set your learning goals to get personalized recommendations</p>
            <Button variant="outline">Set Learning Goals</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearnerDashboard;
