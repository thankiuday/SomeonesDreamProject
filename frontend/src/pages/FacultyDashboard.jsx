import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getFacultyRooms, createRoom, startFacultyVideoCall } from "../lib/api";
import { toast } from "react-hot-toast";
import { 
  PlusIcon, 
  UsersIcon, 
  CopyIcon, 
  CalendarIcon,
  CheckCircleIcon,
  MessageCircleIcon,
  VideoIcon
} from "lucide-react";
import FacultyMessaging from "../components/FacultyMessaging";

const FacultyDashboard = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [newRoomInviteCode, setNewRoomInviteCode] = useState("");
  const [selectedRoomForMessaging, setSelectedRoomForMessaging] = useState(null);

  // Fetch faculty rooms
  const { data: roomsData, isLoading: loadingRooms, error: roomsError } = useQuery({
    queryKey: ["facultyRooms"],
    queryFn: getFacultyRooms,
  });

  // Ensure rooms is always an array
  const rooms = Array.isArray(roomsData) ? roomsData : [];
  
  // Debug logging
  console.log("FacultyDashboard - roomsData:", roomsData);
  console.log("FacultyDashboard - rooms:", rooms);

  // Create room mutation
  const { mutate: createRoomMutation, isPending: creatingRoom } = useMutation({
    mutationFn: createRoom,
    onSuccess: (data) => {
      toast.success("Room created successfully!");
      setNewRoomInviteCode(data.room.inviteCode);
      setRoomName("");
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["facultyRooms"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create room");
    },
  });

  // Start video call mutation
  const { mutate: startVideoCallMutation, isPending: startingVideoCall } = useMutation({
    mutationFn: startFacultyVideoCall,
    onSuccess: (data) => {
      toast.success(`Video call started and link sent to ${data.totalSent} members!`);
      if (data.callUrl) {
        window.open(data.callUrl, '_blank');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to start video call");
    },
  });

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!roomName.trim()) {
      toast.error("Room name is required");
      return;
    }
    createRoomMutation({ roomName: roomName.trim() });
  };

  const copyInviteCode = (inviteCode) => {
    navigator.clipboard.writeText(inviteCode);
    toast.success("Invite code copied to clipboard!");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Faculty Dashboard</h1>
            <p className="text-base-content opacity-70 mt-2">
              Manage your classroom chat rooms and monitor student interactions
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
            disabled={creatingRoom}
          >
            <PlusIcon className="mr-2 size-4" />
            Create New Room
          </button>
        </div>

        {/* Rooms List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Your Classroom Rooms</h2>
          
          {loadingRooms ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : roomsError ? (
            <div className="card bg-error/10 p-8 text-center">
              <h3 className="font-semibold text-lg mb-2 text-error">Error loading rooms</h3>
              <p className="text-error-content opacity-70 mb-4">
                {roomsError.message || "Failed to load your classroom rooms"}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-error btn-outline"
              >
                Try Again
              </button>
            </div>
          ) : rooms.length === 0 ? (
            <div className="card bg-base-200 p-8 text-center">
              <UsersIcon className="size-16 mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold text-lg mb-2">No rooms created yet</h3>
              <p className="text-base-content opacity-70 mb-4">
                Create your first classroom room to start managing student interactions
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary"
              >
                <PlusIcon className="mr-2 size-4" />
                Create Your First Room
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <div key={room._id} className="card bg-base-200 hover:shadow-lg transition-all duration-300">
                  <div className="card-body p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold text-lg">{room.roomName}</h3>
                      <div className="badge badge-primary">Active</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-sm opacity-70">
                        <UsersIcon className="size-4 mr-2" />
                        {room.members?.length || 0} members
                      </div>
                      
                      <div className="flex items-center text-sm opacity-70">
                        <CalendarIcon className="size-4 mr-2" />
                        Created {formatDate(room.createdAt)}
                      </div>
                      
                      <div className="divider my-2"></div>
                      
                      <div>
                        <label className="text-xs font-medium opacity-70 mb-1 block">
                          Invite Code
                        </label>
                        <div className="flex items-center gap-2">
                          <code className="bg-base-300 px-3 py-1 rounded text-sm font-mono">
                            {room.inviteCode}
                          </code>
                          <button
                            onClick={() => copyInviteCode(room.inviteCode)}
                            className="btn btn-ghost btn-xs"
                            title="Copy invite code"
                          >
                            <CopyIcon className="size-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="card-actions justify-end mt-4">
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => setSelectedRoomForMessaging(room)}
                      >
                        <MessageCircleIcon className="size-4 mr-1" />
                        Send Message
                      </button>
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => {
                          // Start video call directly for this room
                          const callData = {
                            roomId: room._id,
                            callTitle: `${room.roomName} - Video Call`,
                            targetUserId: null // Send to all members
                          };
                          
                          startVideoCallMutation(callData);
                        }}
                        disabled={startingVideoCall}
                      >
                        {startingVideoCall ? (
                          <span className="loading loading-spinner loading-xs" />
                        ) : (
                          <VideoIcon className="size-4 mr-1" />
                        )}
                        Start Video Call
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Create New Classroom Room</h3>
            
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Room Name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Math 101 - Period 3"
                  className="input input-bordered w-full"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  disabled={creatingRoom}
                />
              </div>
              
              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setIsModalOpen(false);
                    setRoomName("");
                  }}
                  disabled={creatingRoom}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creatingRoom || !roomName.trim()}
                >
                  {creatingRoom ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    <PlusIcon className="size-4" />
                  )}
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal for New Room */}
      {newRoomInviteCode && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="text-center">
              <CheckCircleIcon className="size-16 text-success mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-4">Room Created Successfully!</h3>
              
              <div className="bg-base-200 p-4 rounded-lg mb-4">
                <label className="text-sm font-medium opacity-70 mb-2 block">
                  Share this invite code with your students:
                </label>
                <div className="flex items-center justify-center gap-2">
                  <code className="bg-base-300 px-4 py-2 rounded text-lg font-mono font-bold">
                    {newRoomInviteCode}
                  </code>
                  <button
                    onClick={() => copyInviteCode(newRoomInviteCode)}
                    className="btn btn-ghost btn-sm"
                    title="Copy invite code"
                  >
                    <CopyIcon className="size-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm opacity-70 mb-4">
                Students and parents can use this code to join your classroom room.
              </p>
              
              <button
                className="btn btn-primary"
                onClick={() => setNewRoomInviteCode("")}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Faculty Messaging Modal */}
      {selectedRoomForMessaging && (
        <FacultyMessaging 
          room={selectedRoomForMessaging}
          onClose={() => setSelectedRoomForMessaging(null)}
        />
      )}
    </div>
  );
};

export default FacultyDashboard;
