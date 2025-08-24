import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { login } from "../lib/api";

const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // Clear logout flag on successful login
      localStorage.removeItem('hasLoggedOut');
      console.log("✅ Login successful - logout flag cleared");
      
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      
      // Get user role from the response and redirect accordingly
      const userRole = data?.user?.role;
      if (userRole) {
        switch (userRole) {
          case "faculty":
            navigate("/faculty-dashboard");
            break;
          case "parent":
            navigate("/parent-dashboard");
            break;
          case "student":
            navigate("/student-dashboard");
            break;
          default:
            navigate("/");
        }
      } else {
        navigate("/");
      }
    },
  });

  return { error, isPending, loginMutation: mutate };
};

export default useLogin;
