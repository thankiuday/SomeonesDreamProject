import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";

const useAuthUser = () => {
  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false, // auth check
    staleTime: 0, // Always refetch when needed
    refetchOnWindowFocus: false, // Don't refetch on window focus to avoid issues
    refetchOnMount: true, // Refetch when component mounts
  });

  // If the query fails with 401, we're definitely not authenticated
  const isAuthenticated = authUser.data?.user && !authUser.isError;

  return { 
    isLoading: authUser.isLoading, 
    authUser: authUser.data?.user,
    isAuthenticated: Boolean(isAuthenticated),
    error: authUser.error
  };
};
export default useAuthUser;
