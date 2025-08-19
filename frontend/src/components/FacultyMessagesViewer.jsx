import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStudentFacultyMessages, markMessageAsRead } from "../lib/api";
import { 
  MessageCircleIcon, 
  FileTextIcon, 
  ImageIcon, 
  VideoIcon,
  CalendarIcon,
  UserIcon,
  GraduationCapIcon,
  ExternalLinkIcon,
  CheckIcon
} from "lucide-react";
import { toast } from "react-hot-toast";

const FacultyMessagesViewer = () => {
  const queryClient = useQueryClient();
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["studentFacultyMessages"],
    queryFn: getStudentFacultyMessages,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mutation for marking message as read
  const { mutate: markAsRead, isPending: markingAsRead } = useMutation({
    mutationFn: markMessageAsRead,
    onSuccess: (data) => {
      toast.success("Message marked as read");
      // Invalidate and refetch the messages to update the UI
      queryClient.invalidateQueries({ queryKey: ["studentFacultyMessages"] });
      // Also invalidate unread count
      queryClient.invalidateQueries({ queryKey: ["unreadFacultyMessages"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to mark message as read");
    },
  });

  const handleMarkAsRead = (messageId) => {
    markAsRead(messageId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageIcon = (messageType) => {
    switch (messageType) {
      case "image":
        return <ImageIcon className="size-4" />;
      case "file":
        return <FileTextIcon className="size-4" />;
      case "system":
        return <MessageCircleIcon className="size-4" />;
      default:
        return <MessageCircleIcon className="size-4" />;
    }
  };

  const getMessageTypeLabel = (messageType) => {
    switch (messageType) {
      case "image":
        return "Image";
      case "file":
        return "Document";
      case "system":
        return "System Message";
      default:
        return "Text Message";
    }
  };

  const handleFileDownload = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleVideoCallClick = (url) => {
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-error/10 p-6 text-center">
        <h3 className="font-semibold text-lg mb-2 text-error">Error loading messages</h3>
        <p className="text-error-content opacity-70 mb-4">
          {error.message || "Failed to load faculty messages"}
        </p>
        <button
          onClick={() => refetch()}
          className="btn btn-error btn-outline"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { messages = [], rooms = [] } = data || {};

  if (messages.length === 0) {
    return (
      <div className="card bg-base-200 p-8 text-center">
        <MessageCircleIcon className="size-16 mx-auto mb-4 opacity-50" />
        <h3 className="font-semibold text-lg mb-2">No faculty messages yet</h3>
        <p className="text-base-content opacity-70 mb-4">
          Messages from your teachers will appear here
        </p>
        <div className="text-sm opacity-70">
          <p>• Join classroom rooms to receive messages</p>
          <p>• Teachers can send text, files, and video call links</p>
          <p>• Messages are delivered in real-time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Messages Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Recent Faculty Messages</h3>
          <button
            onClick={() => refetch()}
            className="btn btn-sm btn-outline"
          >
            Refresh
          </button>
        </div>
        
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message._id} className="card bg-base-200">
              <div className="card-body p-4">
                <div className="flex items-start gap-3">
                  <div className="avatar">
                    <div className="w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <UserIcon className="size-5 text-primary" />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{message.sender.fullName}</span>
                      <span className="text-xs opacity-70">({message.sender.email})</span>
                      {message.roomId && (
                        <div className="flex items-center gap-1 text-xs opacity-70">
                          <GraduationCapIcon className="size-3" />
                          {message.roomId.roomName}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs opacity-70">
                      {getMessageIcon(message.messageType)}
                      <span>{getMessageTypeLabel(message.messageType)}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="size-3" />
                        {formatDate(message.createdAt)}
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      {message.messageType === "image" && message.content.includes("📎") ? (
                        <div className="space-y-2">
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center gap-2">
                            <ImageIcon className="size-4 text-primary" />
                            <button
                              onClick={() => handleFileDownload(message.fileUrl, message.fileName)}
                              className="btn btn-sm btn-outline"
                            >
                              View Image
                            </button>
                          </div>
                        </div>
                      ) : message.messageType === "file" && message.content.includes("📎") ? (
                        <div className="space-y-2">
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center gap-2">
                            <FileTextIcon className="size-4 text-primary" />
                            <button
                              onClick={() => handleFileDownload(message.fileUrl, message.fileName)}
                              className="btn btn-sm btn-outline"
                            >
                              Download File
                            </button>
                          </div>
                        </div>
                      ) : message.content.includes("🎥") ? (
                        <div className="space-y-2">
                          <p className="text-sm whitespace-pre-line">{message.content}</p>
                          <div className="flex items-center gap-2">
                            <VideoIcon className="size-4 text-primary" />
                            <button
                              onClick={() => handleVideoCallClick(message.content.split("Join the video call: ")[1])}
                              className="btn btn-sm btn-primary"
                            >
                              <ExternalLinkIcon className="size-3 mr-1" />
                              Join Video Call
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                      )}
                      
                      {/* Read Button */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-base-300">
                        <div className="flex items-center gap-2">
                          {message.isRead ? (
                            <div className="flex items-center gap-1 text-success text-xs">
                              <CheckIcon className="size-3" />
                              <span>Read</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-warning text-xs">
                              <span className="size-2 rounded-full bg-warning inline-block" />
                              <span>Unread</span>
                            </div>
                          )}
                        </div>
                        
                        {!message.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(message._id)}
                            disabled={markingAsRead}
                            className="btn btn-sm btn-success"
                          >
                            {markingAsRead ? (
                              <span className="loading loading-spinner loading-xs" />
                            ) : (
                              <CheckIcon className="size-3" />
                            )}
                            Mark as Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rooms Summary */}
      {rooms.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Your Classroom Rooms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div key={room._id} className="card bg-base-200">
                <div className="card-body p-4">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <GraduationCapIcon className="size-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{room.roomName}</h4>
                      <p className="text-xs opacity-70">Teacher: {room.faculty.fullName}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyMessagesViewer;
