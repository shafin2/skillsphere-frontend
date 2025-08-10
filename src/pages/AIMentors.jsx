import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Code, 
  Megaphone, 
  Heart, 
  Scale, 
  Briefcase,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  MessageSquare,
  Star,
  Clock,
  Users
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';

const AIMentors = () => {
  const navigate = useNavigate();
  const [selectedMentor, setSelectedMentor] = useState(null);

  const aiMentors = [
    {
      id: 'general',
      name: 'General Learning Assistant',
      description: 'Your all-purpose AI mentor for general learning, career guidance, and problem-solving',
      icon: Bot,
      color: 'from-gray-500 to-slate-600',
      expertise: ['General Guidance', 'Learning Tips', 'Career Advice', 'Problem Solving', 'Study Methods'],
      specialties: 'All-around learning support, study strategies, career planning, general questions',
      systemPrompt: `You are a helpful and friendly general learning assistant and mentor. You have broad knowledge across many fields and specialize in helping users with:

- General learning strategies and study techniques
- Career guidance and professional development
- Problem-solving approaches
- Educational planning and goal setting
- General questions across various topics

Your role is to:
- Provide clear, helpful explanations on any topic
- Suggest effective learning methods and strategies
- Help with career planning and decision-making
- Break down complex problems into manageable steps
- Encourage continuous learning and growth

Be supportive, encouraging, and focus on practical advice that helps users achieve their learning and career goals.`
    },
    {
      id: 'software-dev',
      name: 'Software Development Expert',
      description: 'Expert in programming, web development, mobile apps, and software architecture',
      icon: Code,
      color: 'from-blue-500 to-cyan-500',
      expertise: ['React', 'Node.js', 'Python', 'System Design', 'Best Practices'],
      specialties: 'Full-stack development, debugging, code review, career guidance',
      systemPrompt: `You are an expert software development mentor with 10+ years of experience in full-stack development. You specialize in React, Node.js, Python, system design, and software architecture. 

Your role is to:
- Help with coding problems and debugging
- Provide code reviews and best practices
- Guide career development in tech
- Explain complex technical concepts simply
- Suggest learning paths and resources

Always be practical, provide code examples when helpful, and focus on real-world applications. Keep responses concise but comprehensive.`
    },
    {
      id: 'marketing',
      name: 'Marketing Expert',
      description: 'Specialist in digital marketing, brand strategy, and business growth',
      icon: Megaphone,
      color: 'from-purple-500 to-pink-500',
      expertise: ['Digital Marketing', 'SEO', 'Social Media', 'Brand Strategy', 'Analytics'],
      specialties: 'Content marketing, campaign strategy, market research, ROI optimization',
      systemPrompt: `You are a seasoned marketing expert with extensive experience in digital marketing, brand strategy, and business growth. You specialize in SEO, social media marketing, content strategy, and data analytics.

Your role is to:
- Develop marketing strategies and campaigns
- Provide insights on brand positioning
- Help with market research and analysis
- Guide social media and content strategies
- Explain marketing metrics and ROI

Focus on actionable advice, current trends, and measurable results. Provide specific examples and tools when possible.`
    },
    {
      id: 'healthcare',
      name: 'Healthcare Specialist',
      description: 'Expert in healthcare systems, medical research, and health technology',
      icon: Heart,
      color: 'from-green-500 to-emerald-500',
      expertise: ['Healthcare Systems', 'Medical Research', 'Health Tech', 'Public Health', 'Clinical Practice'],
      specialties: 'Healthcare innovation, medical technology, research methodology, patient care',
      systemPrompt: `You are a healthcare specialist with deep knowledge in healthcare systems, medical research, and health technology. You have experience in clinical practice, public health, and healthcare innovation.

Your role is to:
- Provide guidance on healthcare career paths
- Explain medical concepts and research methods
- Discuss healthcare technology and innovation
- Share insights on public health and policy
- Help with medical education and training

Important: Always remind users that you provide educational guidance only and cannot give medical advice. Encourage consulting qualified healthcare professionals for medical decisions.`
    },
    {
      id: 'legal',
      name: 'Legal Service Advisor',
      description: 'Knowledgeable in business law, regulations, and legal procedures',
      icon: Scale,
      color: 'from-amber-500 to-orange-500',
      expertise: ['Business Law', 'Contract Law', 'Compliance', 'Legal Research', 'Regulations'],
      specialties: 'Legal research, contract review, business compliance, legal career guidance',
      systemPrompt: `You are a legal service advisor with extensive knowledge in business law, regulations, and legal procedures. You specialize in contract law, compliance, legal research, and business legal matters.

Your role is to:
- Provide general legal education and guidance
- Help understand legal concepts and procedures
- Assist with legal research methods
- Guide legal career development
- Explain business law and compliance basics

Important: Always clarify that you provide educational information only and cannot give legal advice. Recommend consulting qualified attorneys for specific legal matters and decisions.`
    },
    {
      id: 'business',
      name: 'Business Strategy Expert',
      description: 'Specialist in entrepreneurship, business planning, and strategic management',
      icon: Briefcase,
      color: 'from-indigo-500 to-purple-500',
      expertise: ['Entrepreneurship', 'Business Planning', 'Strategy', 'Finance', 'Operations'],
      specialties: 'Startup guidance, business model development, strategic planning, growth strategies',
      systemPrompt: `You are a business strategy expert with extensive experience in entrepreneurship, business planning, and strategic management. You specialize in startup development, business model innovation, and growth strategies.

Your role is to:
- Help develop business plans and strategies
- Provide startup and entrepreneurship guidance
- Explain business concepts and frameworks
- Assist with market analysis and planning
- Guide business career development

Focus on practical, actionable business advice with real-world examples and proven frameworks. Help users think strategically about their business challenges.`
    }
  ];

  const handleMentorClick = (mentor) => {
    // Store the selected mentor's system prompt in sessionStorage
    sessionStorage.setItem('aiMentorContext', JSON.stringify({
      mentorId: mentor.id,
      mentorName: mentor.name,
      systemPrompt: mentor.systemPrompt
    }));
    
    // Navigate to the AI assistant with the mentor context
    navigate('/ai-assistant?mentor=' + mentor.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full mr-4">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              AI Mentors
            </h1>
            <Sparkles className="w-6 h-6 text-yellow-500 ml-2 animate-pulse" />
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            Specialized AI assistants ready to guide you in different fields
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 max-w-2xl mx-auto">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 More AI mentors are on the way! We're constantly expanding our expertise areas.
            </p>
          </div>
        </div>

        {/* AI Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {aiMentors.map((mentor) => {
            const IconComponent = mentor.icon;
            return (
              <Card 
                key={mentor.id}
                className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-200 dark:hover:border-purple-700 cursor-pointer transform hover:scale-105"
                onClick={() => handleMentorClick(mentor)}
              >
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-center mb-4">
                    <div className={`bg-gradient-to-r ${mentor.color} p-3 rounded-lg mr-3`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {mentor.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Bot className="w-4 h-4 mr-1" />
                        AI Powered
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {mentor.description}
                  </p>

                  {/* Expertise Tags */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {mentor.expertise.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {mentor.expertise.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                          +{mentor.expertise.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Specialties */}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                    <strong>Specializes in:</strong> {mentor.specialties}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      24/7 Available
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Instant Response
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className={`w-full bg-gradient-to-r ${mentor.color} text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center group-hover:scale-105`}>
                    Start Mentoring Session
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Coming Soon Card */}
        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
          <CardContent className="p-8 text-center">
            <div className="bg-gradient-to-r from-gray-400 to-gray-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-2">
              More AI Mentors Coming Soon!
            </h3>
            <p className="text-gray-500 dark:text-gray-500 mb-4">
              We're working on additional specialized AI mentors in areas like:
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {['Finance', 'Design', 'Data Science', 'Sales', 'HR', 'Education'].map((area, index) => (
                <span key={index} className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm px-3 py-1 rounded-full">
                  {area}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Stay tuned for more expert AI assistants!
            </p>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Important Disclaimer
              </h3>
              <div className="text-yellow-700 dark:text-yellow-300 text-sm space-y-2">
                <p>
                  <strong>🤖 AI-Based Mentorship:</strong> These AI mentors provide general guidance and educational information based on their training. While they strive for accuracy, they may not always provide perfect or complete information.
                </p>
                <p>
                  <strong>⚠️ Potential Biases:</strong> AI systems can have biases based on their training data. Please use their advice as a starting point for your own research and decision-making.
                </p>
                <p>
                  <strong>💡 For Ideation & Learning:</strong> These AI mentors are excellent for brainstorming, learning concepts, and getting different perspectives on problems.
                </p>
                <p>
                  <strong>👨‍🏫 Consider Human Mentors:</strong> For personalized, nuanced guidance and real-world experience, we highly recommend booking sessions with our human mentors who can provide tailored advice based on your specific situation.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-yellow-200 dark:border-yellow-700">
                <a 
                  href="/mentors" 
                  className="text-yellow-800 dark:text-yellow-200 font-medium hover:underline flex items-center"
                >
                  Browse Human Mentors
                  <ChevronRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMentors;
