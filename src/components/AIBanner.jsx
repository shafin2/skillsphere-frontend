import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Sparkles, ArrowRight, Zap } from 'lucide-react';

const AIBanner = ({ userType = 'learner' }) => {
  const learnerContent = {
    title: "Ask AI for Mentorship Guidance",
    subtitle: "Get instant, personalized learning advice from our AI Learning Assistant",
    buttonText: "Chat with AI Assistant",
    features: ["24/7 Availability", "Personalized Responses", "Learning Path Suggestions"]
  };

  const mentorContent = {
    title: "AI-Powered Mentoring Insights",
    subtitle: "Discover teaching strategies and student insights with AI assistance",
    buttonText: "Access AI Insights",
    features: ["Student Analytics", "Teaching Tips", "Content Suggestions"]
  };

  const content = userType === 'mentor' ? mentorContent : learnerContent;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white mb-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-4">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
        <div className="absolute top-8 right-8">
          <Zap className="w-6 h-6 animate-bounce" />
        </div>
        <div className="absolute bottom-4 left-12">
          <Bot className="w-10 h-10 animate-pulse" />
        </div>
        <div className="absolute bottom-8 right-4">
          <Sparkles className="w-6 h-6 animate-pulse delay-1000" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
        <div className="flex-1 mb-4 md:mb-0">
          <div className="flex items-center mb-2">
            <Bot className="w-8 h-8 mr-3 text-yellow-300" />
            <span className="bg-yellow-300 text-purple-900 px-3 py-1 rounded-full text-sm font-semibold">
              AI Powered
            </span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            {content.title}
          </h2>
          
          <p className="text-blue-100 mb-4 max-w-md">
            {content.subtitle}
          </p>
          
          <div className="flex flex-wrap gap-3 mb-4">
            {content.features.map((feature, index) => (
              <div key={index} className="flex items-center bg-white/20 rounded-lg px-3 py-1">
                <Sparkles className="w-4 h-4 mr-2 text-yellow-300" />
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0">
          <Link
            to="/ai-assistant"
            className="group bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center"
          >
            {content.buttonText}
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AIBanner;
