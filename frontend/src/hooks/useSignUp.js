import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { signup } from "../lib/api";

const useSignUp = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
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

  return { isPending, error, signupMutation: mutate };
};
export default useSignUp;
