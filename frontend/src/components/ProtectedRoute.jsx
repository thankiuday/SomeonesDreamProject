import { useAuth } from "../contexts/AuthContext.jsx";
import PageLoader from "./PageLoader.jsx";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isLoading, isAuthenticated, isOnboarded, authUser } = useAuth();
  
  // Check if user has logged out
  const hasLoggedOut = localStorage.getItem('hasLoggedOut') === 'true';

  // Show loading spinner while auth is being checked, but not if user has logged out
  if (isLoading && !hasLoggedOut) {
    return <PageLoader />;
  }

  // If user has logged out, don't render protected content
  if (hasLoggedOut) {
    return null; // AuthContext will handle redirect to login
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return null; // AuthContext will handle redirect to login
  }

  // Check if user is onboarded
  if (!isOnboarded) {
    return null; // AuthContext will handle redirect to onboarding
  }

  // Check if specific role is required
  if (requiredRole && authUser?.role !== requiredRole) {
    return null; // AuthContext will handle redirect to appropriate dashboard
  }

  // All checks passed, render the protected content
  return children;
};

export default ProtectedRoute;
