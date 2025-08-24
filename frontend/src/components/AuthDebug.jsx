import { useAuth } from "../contexts/AuthContext.jsx";

const AuthDebug = () => {
  const { authUser, isAuthenticated, isOnboarded, isLoading, error, logout } = useAuth();
  
  // Get logout state from localStorage
  const hasLoggedOut = localStorage.getItem('hasLoggedOut') === 'true';

  // Only show in development
  if (import.meta.env.PROD) return null;

  const handleManualLogout = () => {
    console.log("🔘 Manual logout triggered from debug component");
    logout();
  };

  const handleClearLogoutFlag = () => {
    localStorage.removeItem('hasLoggedOut');
    console.log("🧹 Logout flag cleared");
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-base-300 p-4 rounded-lg shadow-lg text-xs max-w-xs z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <div>Loading: {isLoading ? "Yes" : "No"}</div>
        <div>Authenticated: {isAuthenticated ? "Yes" : "No"}</div>
        <div>Onboarded: {isOnboarded ? "Yes" : "No"}</div>
        <div>User: {authUser?.fullName || "None"}</div>
        <div>Role: {authUser?.role || "None"}</div>
        <div>Has Logged Out: {hasLoggedOut ? "Yes" : "No"}</div>
        {error && <div className="text-error">Error: {error.message}</div>}
      </div>
      
      <div className="mt-3 space-y-1">
        <button 
          onClick={handleManualLogout}
          className="btn btn-xs btn-error w-full"
        >
          Manual Logout
        </button>
        <button 
          onClick={handleClearLogoutFlag}
          className="btn btn-xs btn-warning w-full"
        >
          Clear Logout Flag
        </button>
      </div>
    </div>
  );
};

export default AuthDebug;
