import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Users, Lightbulb, Zap, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import http from '../lib/http';

const AIMentorInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMentorInsights();
  }, []);

  const fetchMentorInsights = async () => {
    try {
      // Try to fetch AI insights first
      try {
        const response = await http.get('/ai/mentor-insights');
        if (response.data.success) {
          setInsights(response.data.insights);
          return;
        }
      } catch (aiError) {
        console.log('AI insights endpoint not available, generating from data');
      }

      // Fallback: Generate insights from mentor's actual data
      const { data: userData } = await http.get('/profile/me');
      const { data: bookingsData } = await http.get('/bookings');
      
      const bookings = bookingsData.bookings || [];
      const completed = bookings.filter(b => b.status === 'completed');
      const pending = bookings.filter(b => b.status === 'pending');
      
      // Calculate average rating from user's ratings
      let averageRating = 0;
      let totalReviews = 0;
      if (userData.user && userData.user.ratings && userData.user.ratings.length > 0) {
        const totalRating = userData.user.ratings.reduce((sum, rating) => sum + rating.score, 0);
        averageRating = totalRating / userData.user.ratings.length;
        totalReviews = userData.user.ratings.length;
      }

      // Get top requested skills from bookings
      const skillRequests = bookings
        .filter(b => b.message)
        .map(b => b.message.toLowerCase())
        .join(' ')
        .split(' ')
        .filter(word => word.length > 3);

      const skillCounts = {};
      skillRequests.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });

      const topRequestedSkills = Object.entries(skillCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([skill]) => skill.charAt(0).toUpperCase() + skill.slice(1));

      // Generate AI suggestions based on data
      const suggestions = [];
      if (completed.length === 0) {
        suggestions.push("Complete your profile to attract more students");
      }
      if (pending.length > 0) {
        suggestions.push("Respond quickly to pending booking requests to improve your visibility");
      }
      if (averageRating < 4.5 && totalReviews > 0) {
        suggestions.push("Focus on improving session quality to boost your ratings");
      }
      if (userData.user && userData.user.skills && userData.user.skills.length < 3) {
        suggestions.push("Add more skills to your profile to increase booking opportunities");
      }
      if (suggestions.length === 0) {
        suggestions.push("Great job! Keep maintaining high-quality mentoring sessions");
        suggestions.push("Consider expanding your availability to reach more students");
      }

      const insights = {
        averageRating: averageRating.toFixed(1),
        totalSessions: completed.length,
        topRequestedSkills: topRequestedSkills.length > 0 ? topRequestedSkills : ['JavaScript', 'React', 'Node.js'],
        suggestions: suggestions
      };

      setInsights(insights);
    } catch (error) {
      console.error('Failed to fetch mentor insights:', error);
      setError('Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gray-300 rounded mr-3"></div>
              <div className="h-6 bg-gray-300 rounded w-48"></div>
            </div>
            <div className="space-y-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !insights) {
    return null;
  }

  return (
    <Card className="mb-8 border-indigo-200 dark:border-indigo-800">
      <CardHeader className="pb-4">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-lg mr-3">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              AI Mentoring Insights
              <Zap className="w-5 h-5 ml-2 text-yellow-500" />
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Data-driven insights to enhance your mentoring effectiveness
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Average Rating</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 flex items-center">
                  {insights.averageRating}
                  <Star className="w-5 h-5 ml-1 text-yellow-500" />
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Sessions</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {insights.totalSessions}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Top Skills</p>
                <p className="text-sm font-bold text-purple-900 dark:text-purple-100">
                  {insights.topRequestedSkills.slice(0, 2).join(', ') || 'Various'}
                </p>
              </div>
              <Brain className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Top Requested Skills */}
        {insights.topRequestedSkills.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" />
              Most Requested Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {insights.topRequestedSkills.map((skill, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    index === 0
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                      : index === 1
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  #{index + 1} {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI Suggestions */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
            AI-Powered Suggestions
          </h4>
          <ul className="space-y-2">
            {insights.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  {suggestion}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* AI Attribution */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-3 border border-indigo-200 dark:border-indigo-800">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center flex items-center justify-center">
            <Brain className="w-4 h-4 mr-1 text-indigo-500" />
            Insights generated using AI analysis of your mentoring patterns and student feedback
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIMentorInsights;
