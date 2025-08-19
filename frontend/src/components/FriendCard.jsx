import { Link } from "react-router";
import { VideoIcon, MessageCircleIcon, UserMinusIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeFriend } from "../lib/api";
import { toast } from "react-hot-toast";
import { LANGUAGE_TO_FLAG } from "../constants";

const FriendCard = ({ friend }) => {
  const queryClient = useQueryClient();

  const { mutate: removeFriendMutation, isPending: removingFriend } = useMutation({
    mutationFn: removeFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast.success(`${friend.fullName} removed from friends`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to remove friend");
    },
  });

  const handleRemoveFriend = () => {
    if (window.confirm(`Are you sure you want to remove ${friend.fullName} from your friends?`)) {
      removeFriendMutation(friend._id);
    }
  };
  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar size-12">
            <img src={friend.profilePic} alt={friend.fullName} />
          </div>
          <h3 className="font-semibold truncate">{friend.fullName}</h3>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="badge badge-secondary text-xs">
            {getLanguageFlag(friend.nativeLanguage)}
            Native: {friend.nativeLanguage}
          </span>
          <span className="badge badge-outline text-xs">
            {getLanguageFlag(friend.learningLanguage)}
            Learning: {friend.learningLanguage}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link 
            to={`/chat/${friend._id}`} 
            className="btn btn-outline btn-sm flex-1"
          >
            <MessageCircleIcon className="size-4 mr-1" />
            Chat
          </Link>
          
          <Link 
            to={`/call/${friend._id}`} 
            className="btn btn-success btn-sm"
          >
            <VideoIcon className="size-4" />
          </Link>
        </div>

        {/* Remove Friend Button */}
        <div className="mt-3 pt-3 border-t border-base-300">
          <button
            className="btn btn-error btn-sm w-full"
            onClick={handleRemoveFriend}
            disabled={removingFriend}
          >
            <UserMinusIcon className="size-4 mr-1" />
            {removingFriend ? "Removing..." : "Remove Friend"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default FriendCard;

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }
  return null;
}
