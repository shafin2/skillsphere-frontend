import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, MessageSquare, Bot, User, Sparkles, FileText, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import http from '../lib/http';

const AILearningAssistant = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [welcomeData, setWelcomeData] = useState(null);
  const [hasTranscripts, setHasTranscripts] = useState(false);
  const [mentorContext, setMentorContext] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if we're in a specialized mentor mode
    const urlParams = new URLSearchParams(location.search);
    const mentorId = urlParams.get('mentor');
    
    if (mentorId) {
      const storedContext = sessionStorage.getItem('aiMentorContext');
      if (storedContext) {
        const context = JSON.parse(storedContext);
        setMentorContext(context);
      }
    }
  }, [location]);

  useEffect(() => {
    // Load welcome message when component mounts or mentor context changes
    loadWelcomeMessage();
    // Check if user has any transcripts
    checkForTranscripts();
  }, [mentorContext]);

  const loadWelcomeMessage = async () => {
    try {
      let welcomeMessage;
      let suggestedQuestions;
      
      if (mentorContext) {
        // Specialized mentor welcome
        welcomeMessage = `Hi ${user?.fullName || user?.name || 'there'}! I'm your ${mentorContext.mentorName}. I'm here to help you with specialized guidance in my area of expertise. What would you like to learn or discuss today?`;
        
        // Specialized questions based on mentor type
        const mentorQuestions = {
          'software-dev': [
            "How do I debug a React component that won't render?",
            "What are the best practices for API design?",
            "How can I improve my code's performance?",
            "What's the difference between SQL and NoSQL databases?",
            "How do I prepare for a technical interview?"
          ],
          'marketing': [
            "How do I create an effective marketing strategy?",
            "What are the best social media platforms for my business?",
            "How do I measure marketing ROI?",
            "What's the difference between SEO and SEM?",
            "How do I create engaging content?"
          ],
          'healthcare': [
            "What are the latest trends in healthcare technology?",
            "How do I pursue a career in healthcare?",
            "What's the importance of evidence-based medicine?",
            "How do I stay updated with medical research?",
            "What are the ethical considerations in healthcare?"
          ],
          'legal': [
            "What should I know about contract law basics?",
            "How do I conduct legal research effectively?",
            "What are the key compliance requirements for startups?",
            "How do I pursue a career in law?",
            "What's the difference between civil and criminal law?"
          ],
          'business': [
            "How do I create a business plan?",
            "What are the key metrics for startup success?",
            "How do I validate my business idea?",
            "What funding options are available for startups?",
            "How do I build a strong business strategy?"
          ]
        };
        
        suggestedQuestions = mentorQuestions[mentorContext.mentorId] || [];
      } else {
        // General AI assistant
        const response = await http.get('/ai/welcome');
        if (response.data.success) {
          welcomeMessage = response.data.welcome;
          suggestedQuestions = response.data.suggestedQuestions;
        } else {
          welcomeMessage = `Hi ${user?.fullName || user?.name || 'there'}! I'm your AI Learning Assistant. What can I help you with today?`;
          suggestedQuestions = [];
        }
      }
      
      setWelcomeData({ welcome: welcomeMessage, suggestedQuestions });
      // Add welcome message to chat
      setMessages([{
        id: 1,
        text: welcomeMessage,
        isUser: false,
        timestamp: new Date(),
        isAI: true
      }]);
      
    } catch (error) {
      console.error('Failed to load welcome message:', error);
      // Fallback welcome message
      const fallbackMessage = mentorContext 
        ? `Hi ${user?.fullName || user?.name || 'there'}! I'm your ${mentorContext.mentorName}. How can I help you today?`
        : `Hi ${user?.fullName || user?.name || 'there'}! I'm your AI Learning Assistant. What can I help you with today?`;
        
      setMessages([{
        id: 1,
        text: fallbackMessage,
        isUser: false,
        timestamp: new Date(),
        isAI: true
      }]);
    }
  };

  const checkForTranscripts = async () => {
    try {
      // This is a simplified check - in a real implementation, you'd call an API
      // For MVP, we'll assume some users have transcripts
      setHasTranscripts(true);
    } catch (error) {
      console.error('Failed to check transcripts:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      isUser: true,
      timestamp: new Date(),
      isAI: false
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare chat history (last 5 messages)
      const chatHistory = messages.slice(-5).map(msg => ({
        text: msg.text,
        isUser: msg.isUser
      }));

      // Prepare request data
      const requestData = {
        message: userMessage.text,
        chatHistory
      };

      // Add custom system prompt if in mentor mode
      if (mentorContext?.systemPrompt) {
        requestData.customSystemPrompt = mentorContext.systemPrompt;
        requestData.mentorType = mentorContext.mentorId;
      }

      const response = await http.post('/ai/ask', requestData);

      if (response.data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          text: response.data.response,
          isUser: false,
          timestamp: new Date(),
          isAI: response.data.isAI
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        isUser: false,
        timestamp: new Date(),
        isAI: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
  };

  const handleSummarizeSession = async () => {
    setIsLoading(true);
    
    try {
      // For MVP, we'll use a sample transcript
      const sampleTranscript = "In this session, we discussed React hooks, specifically useState and useEffect. The mentor explained how to manage component state and side effects in functional components.";
      
      const response = await http.post('/ai/summarize-session', {
        transcript: sampleTranscript
      });

      if (response.data.success) {
        const summaryMessage = {
          id: Date.now(),
          text: `**Session Summary:**\n${response.data.summary}\n\n**Recommended Resources:**\n${response.data.resources.map((resource, index) => `${index + 1}. ${resource}`).join('\n')}`,
          isUser: false,
          timestamp: new Date(),
          isAI: response.data.isAI,
          isSessionSummary: true
        };
        setMessages(prev => [...prev, summaryMessage]);
      }
    } catch (error) {
      console.error('Failed to get session summary:', error);
      const errorMessage = {
        id: Date.now(),
        text: "I'm sorry, I couldn't summarize your session right now. Please try again later.",
        isUser: false,
        timestamp: new Date(),
        isAI: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (text) => {
    // Simple markdown-like formatting for MVP
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar - Conversation List */}
      <div className="w-1/4 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            AI Conversations
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Powered by Advanced AI</p>
        </div>
        <div className="p-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center text-blue-700 dark:text-blue-300 mb-2">
              <Bot className="w-4 h-4 mr-2" />
              <span className="font-medium">Current Session</span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400">AI Learning Assistant</p>
          </div>
          
          {/* Session Summary Button */}
          {hasTranscripts && (
            <button
              onClick={handleSummarizeSession}
              disabled={isLoading}
              className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center disabled:opacity-50"
            >
              <FileText className="w-4 h-4 mr-2" />
              Summarize My Session
            </button>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  {mentorContext ? mentorContext.mentorName : 'AI Learning Assistant'}
                  <Sparkles className="w-5 h-5 ml-2 text-yellow-500 animate-pulse" />
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {mentorContext ? 'Specialized AI Mentor' : 'Powered by Advanced AI'} • Available 24/7
                </p>
              </div>
            </div>
            
            {mentorContext && (
              <button
                onClick={() => {
                  sessionStorage.removeItem('aiMentorContext');
                  window.location.href = '/ai-mentors';
                }}
                className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to AI Mentors
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-3xl ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.isUser 
                    ? 'bg-blue-500' 
                    : message.isAI 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                      : 'bg-gray-500'
                }`}>
                  {message.isUser ? (
                    <User className="w-5 h-5 text-white" />
                  ) : message.isAI ? (
                    <Sparkles className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className={`rounded-lg p-3 ${
                  message.isUser
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                }`}>
                  <div 
                    className={message.isSessionSummary ? 'whitespace-pre-line' : ''}
                    dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }}
                  />
                  <div className={`text-xs mt-2 ${
                    message.isUser 
                      ? 'text-blue-100' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                    {!message.isUser && !message.isAI && (
                      <span className="ml-2 italic">• Fallback response</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {welcomeData?.suggestedQuestions && messages.length <= 1 && (
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {welcomeData.suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything about programming, web development, or learning..."
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AILearningAssistant;
