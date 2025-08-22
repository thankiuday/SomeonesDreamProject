import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
import BackButton from "../components/BackButton";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [targetUser, setTargetUser] = useState(null);
  const [isOnline, setIsOnline] = useState(false);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser, // this will run only when authUser is available
  });

  // Fetch target user details
  const { data: targetUserData } = useQuery({
    queryKey: ["targetUser", targetUserId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/users/${targetUserId}`);
        if (!response.ok) {
          console.error('Failed to fetch user:', response.status, response.statusText);
          throw new Error('Failed to fetch user');
        }
        const data = await response.json();
        console.log('Target user data:', data);
        return data;
      } catch (error) {
        console.error('Error fetching target user:', error);
        throw error;
      }
    },
    enabled: !!targetUserId,
    retry: 3,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (targetUserData) {
      setTargetUser(targetUserData);
    }
  }, [targetUserData]);

  // Fallback: Get user info from channel data if API fails
  useEffect(() => {
    if (channel && !targetUser) {
      const members = channel.state.members;
      const targetMember = Object.values(members).find(member => member.user.id === targetUserId);
      if (targetMember) {
        setTargetUser({
          _id: targetMember.user.id,
          fullName: targetMember.user.name || targetMember.user.id,
          profilePic: targetMember.user.image,
        });
      }
    }
  }, [channel, targetUser, targetUserId]);

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        console.log("Initializing stream chat client...");

        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        //
        const channelId = [authUser._id, targetUserId].sort().join("-");

        // you and me
        // if i start the chat => channelId: [myId, yourId]
        // if you start the chat => channelId: [yourId, myId]  => [myId,yourId]

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        // Listen for presence events
        client.on('presence.new', (event) => {
          if (event.user.id === targetUserId) {
            setIsOnline(true);
          }
        });

        client.on('presence.offline', (event) => {
          if (event.user.id === targetUserId) {
            setIsOnline(false);
          }
        });

        // Check initial online status
        try {
          const user = await client.queryUsers({ id: { $eq: targetUserId } });
          if (user.users.length > 0 && user.users[0].online) {
            setIsOnline(true);
          }
        } catch (error) {
          console.log('Could not check initial online status:', error);
        }

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, targetUserId]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success("Video call link sent successfully!");
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[calc(100vh-4rem)] sm:h-[93vh] bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative h-full flex flex-col">
            {/* WhatsApp-style Header */}
            <div className="bg-green-600 dark:bg-green-700 text-white px-4 py-3 flex items-center justify-between shadow-lg relative">
              <div className="flex items-center gap-3">
                <BackButton 
                  variant="primary" 
                  className="text-white hover:text-white/80 hover:bg-white/10 rounded-full p-2 flex-shrink-0"
                  showText={false}
                />
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {targetUser?.profilePic ? (
                    <img 
                      src={targetUser.profilePic} 
                      alt={targetUser.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold">
                      {targetUser?.fullName?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-lg truncate">
                    {targetUser?.fullName || 'Unknown User'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <p className="text-sm opacity-90 truncate">
                      {isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <CallButton handleVideoCall={handleVideoCall} />
              </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 relative overflow-hidden">
              <Window className="h-full bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
                <MessageList 
                  className="!p-2 sm:!p-4 !bg-transparent"
                  messageStyles={{
                    message: 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700',
                    messageBubble: 'bg-blue-500 text-white rounded-lg shadow-sm',
                    messageBubbleMe: 'bg-green-500 text-white rounded-lg shadow-sm',
                  }}
                />
                <MessageInput 
                  focus 
                  className="!p-3 sm:!p-4 !bg-white dark:!bg-gray-800 !border-t !border-gray-200 dark:!border-gray-700"
                  placeholder="Type a message..."
                  sendButtonStyle={{
                    backgroundColor: '#22c55e',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '8px',
                  }}
                />
              </Window>
            </div>
          </div>
          <Thread className="!w-full sm:!w-80 !bg-white dark:!bg-gray-800" />
        </Channel>
      </Chat>
    </div>
  );
};
export default ChatPage;
