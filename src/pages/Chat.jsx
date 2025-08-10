import { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread,
  Window,
  Avatar,
  useChannelStateContext,
  useChatContext
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import http from '../lib/http';
import { useParams, useNavigate } from 'react-router-dom';

// Custom Channel Header Component - Mobile Responsive
const CustomChannelHeader = () => {
  const { channel } = useChannelStateContext();
  const navigate = useNavigate();
  
  const members = Object.values(channel?.state?.members || {});
  const otherMember = members.find(member => member.user_id !== channel?.state?.membership?.user_id);
  
  return (
    <div className="bg-white border-b border-gray-200 px-12 sm:px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center min-w-0 flex-1">
        <button
          onClick={() => navigate(-1)}
          className="mr-2 sm:mr-3 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          title="Go back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {otherMember && (
          <div className="flex items-center min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm mr-2 sm:mr-3 flex-shrink-0">
              {otherMember.user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                {otherMember.user?.name || 'User'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 capitalize truncate">
                {otherMember.user?.user_type || 'Member'}
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center ml-2 flex-shrink-0">
        <div className="hidden sm:flex items-center text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span className="hidden md:inline">Active</span>
        </div>
        <div className="sm:hidden">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

// Custom Message Input Component - Simplified
const CustomMessageInput = () => {
  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <MessageInput />
    </div>
  );
};

export default function ChatPage() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function initChat() {
      try {
        setLoading(true);
        setError(null);

        // Get chat token from backend
        const { data } = await http.get('/chat/token');
        
        // Initialize Stream Chat client
        const chatClient = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY);
        
        // Connect user to Stream Chat
        await chatClient.connectUser(
          { 
            id: data.userId.toString(),
            name: data.userName || 'User'
          },
          data.token
        );
        
        // Get the specific channel
        const activeChannel = chatClient.channel('messaging', channelId);
        await activeChannel.watch();
        
        setClient(chatClient);
        setChannel(activeChannel);
      } catch (err) {
        console.error('Error initializing chat:', err);
        setError(err.response?.data?.error || 'Failed to load chat');
      } finally {
        setLoading(false);
      }
    }

    if (channelId) {
      initChat();
    }

    // Cleanup function
    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [channelId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Setting up your chat</h3>
            <p className="text-gray-600">Please wait while we connect you...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Chat</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!client || !channel) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Chat not available</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-gray-50 px-4 overflow-hidden">
      {/* Custom Chat Container */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <Chat client={client} theme="messaging light">
          <Channel channel={channel}>
            <Window>
              <CustomChannelHeader />
              <div className="flex-1 bg-gray-50 overflow-hidden min-h-0">
                <MessageList />
              </div>
              <CustomMessageInput />
            </Window>
            <Thread />
          </Channel>
        </Chat>
      </div>
    </div>
  );
} 