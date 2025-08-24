import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../lib/api";

const useLogin = () => {
  const queryClient = useQueryClient();
  
  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // Clear logout flag on successful login
      localStorage.removeItem('hasLoggedOut');
      console.log("✅ Login successful - logout flag cleared");
      
      // Invalidate auth user query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      
      // Let AuthContext handle the routing flow
      // AuthContext will automatically redirect to onboarding if user is not onboarded
      // Then after onboarding, it will redirect to the appropriate dashboard
      console.log("🎯 Letting AuthContext handle routing for role:", data?.user?.role);
    },
  });

  return { error, isPending, loginMutation: mutate };
};

export default useLogin;
