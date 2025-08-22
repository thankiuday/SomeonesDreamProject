import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { 
  getMyChildren, 
  getChildConversations, 
  analyzeChat,
  linkChildToParent,
  generateLinkCode
} from "../lib/api";
import { toast } from "react-hot-toast";
import { 
  UsersIcon, 
  MessageSquareIcon, 
  BrainIcon, 
  PlusIcon,
  UserPlusIcon,
  ShieldIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  KeyIcon,
  CopyIcon,
  GraduationCapIcon
} from "lucide-react";

const ParentDashboard = () => {
  const queryClient = useQueryClient();
  const [selectedChild, setSelectedChild] = useState(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [childEmail, setChildEmail] = useState("");
  const [analysisResults, setAnalysisResults] = useState({});
  const [linkCode, setLinkCode] = useState(null);
  const [linkCodeExpires, setLinkCodeExpires] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [conversationFilter, setConversationFilter] = useState("all"); // all, friends, classroom, direct

  // Fetch parent's children
  const { data: children = [], isLoading: loadingChildren } = useQuery({
    queryKey: ["myChildren"],
    queryFn: getMyChildren,
  });

  // Fetch child's conversations when a child is selected
  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ["childConversations", selectedChild?._id],
    queryFn: () => getChildConversations(selectedChild._id),
    enabled: !!selectedChild,
  });

  // Filter conversations based on selected filter
  const filteredConversations = conversations.filter(conversation => {
    switch (conversationFilter) {
      case "friends":
        return conversation.isFriend;
      case "classroom":
        return conversation.isRoomMember;
      case "direct":
        return conversation.hasDirectChat;
      default:
        return true; // "all"
    }
  });

  // Link child mutation
  const { mutate: linkChildMutation, isPending: linkingChild } = useMutation({
    mutationFn: linkChildToParent,
    onSuccess: () => {
      toast.success("Child linked successfully!");
      setChildEmail("");
      setIsLinkModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["myChildren"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to link child");
    },
  });

  // AI analysis mutation
  const { mutate: analyzeChatMutation, isPending: analyzing } = useMutation({
    mutationFn: analyzeChat,
    onSuccess: (data, variables) => {
      const { childUid, targetUid } = variables;
      const key = `${childUid}-${targetUid}`;
      setAnalysisResults(prev => ({
        ...prev,
        [key]: data
      }));
      toast.success("Analysis completed!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to analyze conversation");
    },
  });

  // Generate link code mutation
  const { mutate: generateLinkCodeMutation, isPending: generatingCode } = useMutation({
    mutationFn: generateLinkCode,
    onSuccess: (data) => {
      setLinkCode(data.linkCode);
      setLinkCodeExpires(new Date(data.expiresAt));
      toast.success("Link code generated successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to generate link code");
    },
  });

  const handleLinkChild = (e) => {
    e.preventDefault();
    if (!childEmail.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }
    linkChildMutation(childEmail.trim());
  };

  const handleAnalyzeChat = (childUid, targetUid) => {
    analyzeChatMutation({ childUid, targetUid });
  };

  const getAnalysisResult = (childUid, targetUid) => {
    const key = `${childUid}-${targetUid}`;
    return analysisResults[key];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Countdown timer effect
  useEffect(() => {
    if (!linkCodeExpires) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expires = new Date(linkCodeExpires).getTime();
      const difference = expires - now;

      if (difference <= 0) {
        setTimeLeft(0);
        setLinkCode(null);
        setLinkCodeExpires(null);
        clearInterval(timer);
      } else {
        setTimeLeft(Math.floor(difference / 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [linkCodeExpires]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const copyLinkCode = () => {
    if (linkCode) {
      navigator.clipboard.writeText(linkCode);
      toast.success("Link code copied to clipboard!");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4 sm:flex-row sm:items-start sm:text-left sm:justify-between sm:space-y-0">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Parent Dashboard</h1>
            <p className="text-base-content opacity-70 max-w-2xl mx-auto sm:mx-0">
              Monitor your children's online interactions and ensure their digital safety
            </p>
          </div>
          <button
            onClick={() => setIsLinkModalOpen(true)}
            className="btn btn-primary w-full sm:w-auto"
            disabled={linkingChild}
          >
            <UserPlusIcon className="mr-2 size-4" />
            Link Child
          </button>
        </div>

        {/* Link Child Account Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <KeyIcon className="size-6" />
            <h2 className="text-2xl font-semibold">Link Child Account</h2>
          </div>
          
          <div className="card bg-base-200">
            <div className="card-body p-6">
              {!linkCode ? (
                <div className="text-center space-y-4">
                  <p className="text-base-content opacity-70">
                    Generate a secure 6-digit code to link your child's account
                  </p>
                  <button
                    onClick={() => generateLinkCodeMutation()}
                    className="btn btn-primary"
                    disabled={generatingCode}
                  >
                    {generatingCode ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : (
                      <KeyIcon className="size-4" />
                    )}
                    Generate Link Code
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm opacity-70 mb-2">Share this code with your child</p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="bg-base-300 px-4 py-2 rounded text-2xl font-mono font-bold">
                        {linkCode}
                      </code>
                      <button
                        onClick={copyLinkCode}
                        className="btn btn-ghost btn-sm"
                        title="Copy link code"
                      >
                        <CopyIcon className="size-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm opacity-70 mb-1">Code expires in</p>
                    <div className={`text-lg font-mono ${
                      timeLeft < 60 ? 'text-error' : 'text-success'
                    }`}>
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <button
                      onClick={() => generateLinkCodeMutation()}
                      className="btn btn-outline btn-sm"
                      disabled={generatingCode}
                    >
                      Generate New Code
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Children List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Your Children</h2>
          
          {loadingChildren ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : children.length === 0 ? (
            <div className="card bg-base-200 p-8 text-center">
              <UsersIcon className="size-16 mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold text-lg mb-2">No children linked yet</h3>
              <p className="text-base-content opacity-70 mb-4">
                Link your children to start monitoring their online conversations
              </p>
              <button
                onClick={() => setIsLinkModalOpen(true)}
                className="btn btn-primary"
              >
                <UserPlusIcon className="mr-2 size-4" />
                Link Your First Child
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child) => (
                <div
                  key={child._id}
                  className={`card cursor-pointer transition-all duration-300 ${
                    selectedChild?._id === child._id 
                      ? "bg-primary text-primary-content" 
                      : "bg-base-200 hover:shadow-lg"
                  }`}
                  onClick={() => setSelectedChild(child)}
                >
                  <div className="card-body p-4">
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-12 rounded-full">
                          <img src={child.profilePic} alt={child.fullName} />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold">{child.fullName}</h3>
                        <p className="text-sm opacity-70">{child.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conversations Section */}
        {selectedChild && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <MessageSquareIcon className="size-6" />
              <h2 className="text-2xl font-semibold">
                {selectedChild.fullName}'s Conversations
              </h2>
            </div>

            {/* Conversation Statistics */}
            {!loadingConversations && conversations.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="stat bg-base-200 rounded-lg p-3 md:p-4">
                  <div className="stat-figure text-primary">
                    <UsersIcon className="size-4 md:size-6" />
                  </div>
                  <div className="stat-title text-xs md:text-sm">Total Contacts</div>
                  <div className="stat-value text-lg md:text-2xl text-primary">{conversations.length}</div>
                </div>
                
                <div className="stat bg-base-200 rounded-lg p-3 md:p-4">
                  <div className="stat-figure text-secondary">
                    <CheckCircleIcon className="size-4 md:size-6" />
                  </div>
                  <div className="stat-title text-xs md:text-sm">Friends</div>
                  <div className="stat-value text-lg md:text-2xl text-secondary">
                    {conversations.filter(c => c.isFriend).length}
                  </div>
                </div>
                
                <div className="stat bg-base-200 rounded-lg p-3 md:p-4">
                  <div className="stat-figure text-accent">
                    <GraduationCapIcon className="size-4 md:size-6" />
                  </div>
                  <div className="stat-title text-xs md:text-sm">Classroom</div>
                  <div className="stat-value text-lg md:text-2xl text-accent">
                    {conversations.filter(c => c.isRoomMember).length}
                  </div>
                </div>
                
                <div className="stat bg-base-200 rounded-lg p-3 md:p-4">
                  <div className="stat-figure text-info">
                    <MessageSquareIcon className="size-4 md:size-6" />
                  </div>
                  <div className="stat-title text-xs md:text-sm">Direct Chats</div>
                  <div className="stat-value text-lg md:text-2xl text-info">
                    {conversations.filter(c => c.hasDirectChat).length}
                  </div>
                </div>
              </div>
            )}

            {/* Filter Buttons */}
            {!loadingConversations && conversations.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <button
                  onClick={() => setConversationFilter("all")}
                  className={`btn btn-xs sm:btn-sm ${conversationFilter === "all" ? "btn-primary" : "btn-outline"}`}
                >
                  All ({conversations.length})
                </button>
                <button
                  onClick={() => setConversationFilter("friends")}
                  className={`btn btn-xs sm:btn-sm ${conversationFilter === "friends" ? "btn-secondary" : "btn-outline"}`}
                >
                  Friends ({conversations.filter(c => c.isFriend).length})
                </button>
                <button
                  onClick={() => setConversationFilter("classroom")}
                  className={`btn btn-xs sm:btn-sm ${conversationFilter === "classroom" ? "btn-accent" : "btn-outline"}`}
                >
                  Classroom ({conversations.filter(c => c.isRoomMember).length})
                </button>
                <button
                  onClick={() => setConversationFilter("direct")}
                  className={`btn btn-xs sm:btn-sm ${conversationFilter === "direct" ? "btn-info" : "btn-outline"}`}
                >
                  Direct ({conversations.filter(c => c.hasDirectChat).length})
                </button>
              </div>
            )}
            
            {loadingConversations ? (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="card bg-base-200 p-6 text-center">
                <MessageSquareIcon className="size-12 mx-auto mb-3 opacity-50" />
                <h3 className="font-semibold text-lg mb-2">
                  {conversationFilter === "all" 
                    ? "No conversations yet" 
                    : `No ${conversationFilter} conversations found`
                  }
                </h3>
                <p className="text-base-content opacity-70">
                  {conversationFilter === "all" 
                    ? `${selectedChild.fullName} hasn't started any conversations yet.`
                    : `Try selecting a different filter or check back later.`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredConversations.map((conversation) => {
                  const analysisResult = getAnalysisResult(selectedChild._id, conversation._id);
                  const isAnalyzing = analyzing && 
                    analysisResult === undefined;

                  // Determine conversation type badges
                  const getConversationTypeBadges = () => {
                    const badges = [];
                    if (conversation.isFriend) {
                      badges.push(
                        <span key="friend" className="badge badge-primary badge-sm">
                          Friend
                        </span>
                      );
                    }
                    if (conversation.isRoomMember) {
                      badges.push(
                        <span key="classroom" className="badge badge-secondary badge-sm">
                          Classroom
                        </span>
                      );
                    }
                    if (conversation.hasDirectChat) {
                      badges.push(
                        <span key="direct" className="badge badge-accent badge-sm">
                          Direct Chat
                        </span>
                      );
                    }
                    return badges;
                  };

                  return (
                    <div key={conversation._id} className="card bg-base-200">
                      <div className="card-body p-4 md:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="avatar flex-shrink-0">
                              <div className="w-10 md:w-12 rounded-full">
                                <img src={conversation.profilePic} alt={conversation.fullName} />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-base md:text-lg truncate">{conversation.fullName}</h3>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm opacity-70 mb-2">
                                <span className="badge badge-outline badge-xs sm:badge-sm">
                                  {conversation.role}
                                </span>
                                <span className="truncate text-xs sm:text-sm">{conversation.email}</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {getConversationTypeBadges()}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAnalyzeChat(selectedChild._id, conversation._id)}
                            disabled={isAnalyzing || analyzing}
                            className={`btn btn-xs sm:btn-sm ${
                              analysisResult ? "btn-success" : "btn-primary"
                            } flex-shrink-0`}
                          >
                            {isAnalyzing ? (
                              <span className="loading loading-spinner loading-xs" />
                            ) : analysisResult ? (
                              <CheckCircleIcon className="size-3 md:size-4" />
                            ) : (
                              <BrainIcon className="size-3 md:size-4" />
                            )}
                            <span className="hidden sm:inline ml-1">
                              {analysisResult ? "Analysis Complete" : "Get AI Summary"}
                            </span>
                            <span className="sm:hidden">
                              {analysisResult ? "Complete" : "Analyze"}
                            </span>
                          </button>
                        </div>

                        {/* AI Analysis Result */}
                        {analysisResult && (
                          <div className="mt-4 p-3 md:p-4 bg-base-300 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                              <ShieldIcon className="size-4 md:size-5 text-primary" />
                              <h4 className="font-semibold text-sm md:text-base">AI Safety Analysis</h4>
                            </div>
                            
                            <div className="space-y-3">
                              <p className="text-xs md:text-sm leading-relaxed">
                                {analysisResult.analysis}
                              </p>
                              
                              <div className="flex flex-wrap gap-2 text-xs opacity-70">
                                <span className="flex items-center gap-1">
                                  <ClockIcon className="size-3" />
                                  {analysisResult.context?.messageCount || 0} messages
                                </span>
                                <span className="flex items-center gap-1">
                                  <UsersIcon className="size-3" />
                                  {analysisResult.context?.targetRole}
                                </span>
                                {analysisResult.context?.isFriend && (
                                  <span className="flex items-center gap-1">
                                    <CheckCircleIcon className="size-3" />
                                    Friend
                                  </span>
                                )}
                                {analysisResult.context?.isClassroomMember && (
                                  <span className="flex items-center gap-1">
                                    <GraduationCapIcon className="size-3" />
                                    Classroom
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Link Child Modal */}
      {isLinkModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Link Your Child</h3>
            
            <form onSubmit={handleLinkChild} className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Child's Email Address</span>
                </label>
                <input
                  type="email"
                  placeholder="child@example.com"
                  className="input input-bordered w-full"
                  value={childEmail}
                  onChange={(e) => setChildEmail(e.target.value)}
                  disabled={linkingChild}
                />
                <label className="label">
                  <span className="label-text-alt">
                    Enter the email address of your child's account
                  </span>
                </label>
              </div>
              
              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setIsLinkModalOpen(false);
                    setChildEmail("");
                  }}
                  disabled={linkingChild}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={linkingChild || !childEmail.trim()}
                >
                  {linkingChild ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    <UserPlusIcon className="size-4" />
                  )}
                  Link Child
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
