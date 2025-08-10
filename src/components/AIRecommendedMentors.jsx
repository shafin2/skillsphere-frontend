import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Bot, Zap, ArrowRight, User } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import Button from './ui/Button';
import http from '../lib/http';

const AIRecommendedMentors = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecommendedMentors();
  }, []);

  const fetchRecommendedMentors = async () => {
    try {
      const response = await http.get('/ai/recommended-mentors');
      if (response.data.success) {
        setMentors(response.data.mentors);
      }
    } catch (error) {
      console.error('Failed to fetch AI recommended mentors:', error);
      setError('Failed to load recommendations');
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
              <div className="w-6 h-6 bg-gray-300 rounded mr-2"></div>
              <div className="h-6 bg-gray-300 rounded w-48"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || mentors.length === 0) {
    return null;
  }

  return (
    <Card className="mb-8 border-purple-200 dark:border-purple-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg mr-3">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                AI Recommended Mentors
                <Zap className="w-5 h-5 ml-2 text-yellow-500" />
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Personalized matches based on your profile and learning goals
              </p>
            </div>
          </div>
          <Link
            to="/mentors"
            className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium text-sm flex items-center"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mentors.map((mentor) => (
            <div
              key={mentor._id}
              className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-600"
            >
              {/* AI Score Badge */}
              <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                <Zap className="w-3 h-3 mr-1" />
                {mentor.aiScore}%
              </div>

              <div className="text-center">
                {/* Avatar */}
                <div className="relative mb-3">
                  {mentor.avatar ? (
                    <img
                      src={mentor.avatar}
                      alt={mentor.fullName}
                      className="w-16 h-16 rounded-full mx-auto border-2 border-purple-200 dark:border-purple-700"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>

                {/* Name */}
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 truncate">
                  {mentor.fullName}
                </h4>

                {/* Skills */}
                <div className="flex flex-wrap justify-center gap-1 mb-2">
                  {mentor.skills?.slice(0, 2).map((skill, index) => (
                    <span
                      key={index}
                      className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs px-2 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Match Reason */}
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {mentor.matchReason}
                </p>

                {/* Price */}
                {mentor.hourlyRate && (
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-3">
                    ${mentor.hourlyRate}/hour
                  </p>
                )}

                {/* Book Button */}
                <Link
                  to={`/mentors/${mentor._id}`}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center group-hover:shadow-md"
                >
                  View Profile
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* AI Attribution */}
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center flex items-center justify-center">
            <Bot className="w-4 h-4 mr-1 text-purple-500" />
            Recommendations powered by AI analysis of your skills, goals, and learning preferences
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIRecommendedMentors;
