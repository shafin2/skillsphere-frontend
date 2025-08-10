import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, MessageSquare, X, Sparkles } from 'lucide-react';

const FloatingAIButton = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link
        to="/ai-assistant"
        className="group relative flex items-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Main Button */}
        <div className="flex items-center px-4 py-3 rounded-full">
          <div className="relative">
            <Bot className="w-6 h-6 mr-2" />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
          </div>
          <span className="font-medium text-sm whitespace-nowrap">Ask AI</span>
        </div>

        {/* Hover Tooltip */}
        {isHovered && (
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap opacity-90">
            Get instant AI assistance
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
          </div>
        )}

        {/* Pulse Effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-ping opacity-20"></div>
      </Link>
    </div>
  );
};

export default FloatingAIButton;
