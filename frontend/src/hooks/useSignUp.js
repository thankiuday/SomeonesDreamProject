import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../lib/api";

const useSignUp = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      // Clear logout flag on successful signup
      localStorage.removeItem('hasLoggedOut');
      console.log("✅ Signup successful - logout flag cleared");
      console.log("🎯 Signup response:", {
        user: data?.user,
        role: data?.user?.role,
        isOnboarded: data?.user?.isOnboarded
      });
      
      // Invalidate auth user query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      console.log("🔄 Auth query invalidated - should trigger refetch");
      
      // Let AuthContext handle the routing flow
      // AuthContext will automatically redirect to onboarding if user is not onboarded
      // Then after onboarding, it will redirect to the appropriate dashboard
      console.log("🎯 Letting AuthContext handle routing for role:", data?.user?.role);
    },
    onError: (error) => {
      console.error("❌ Signup failed:", error);
    }
  });

  return { isPending, error, signupMutation: mutate };
};
export default useSignUp;
