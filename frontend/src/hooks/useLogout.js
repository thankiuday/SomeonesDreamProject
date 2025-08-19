import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { logout } from "../lib/api";
import { toast } from "react-hot-toast";

const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: logoutMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear all queries from cache
      queryClient.clear();
      // Show success message
      toast.success("Logged out successfully");
      // Navigate to login page
      navigate("/login");
    },
    onError: (error) => {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    },
  });

  return { logoutMutation, isPending, error };
};
export default useLogout;
