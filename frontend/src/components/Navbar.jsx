import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon, MenuIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";
import useNotificationCount from "../hooks/useNotificationCount";
import Logo from "./Logo";

const Navbar = ({ onMenuClick }) => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");
  const { logoutMutation, forceLogout, isPending } = useLogout();
  const { count } = useNotificationCount();

  const handleLogout = () => {
    console.log("🔘 Logout button clicked");
    
    // Use a timeout to ensure logout happens even if API is slow
    const timeoutId = setTimeout(() => {
      console.log("⏰ Logout timeout - forcing logout");
      forceLogout();
    }, 2000); // 2 second timeout
    
    logoutMutation(undefined, {
      onSuccess: () => {
        clearTimeout(timeoutId);
      },
      onError: () => {
        clearTimeout(timeoutId);
      }
    });
  };

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full">
          {/* Left side - Menu button and logo */}
          <div className="flex items-center gap-4">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="btn btn-ghost btn-sm btn-circle lg:hidden"
                aria-label="Open menu"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
            )}
            
            {isChatPage && (
              <Link to="/" className="flex items-center gap-2.5">
                <Logo showText={false} />
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                  COCOON
                </span>
              </Link>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <Link to={"/notifications"}>
              <button className="btn btn-ghost btn-circle btn-sm sm:btn-md">
                <div className="indicator">
                  <BellIcon className="h-5 w-5 sm:h-6 sm:w-6 text-base-content opacity-70" />
                  {count > 0 && (
                    <span className="badge badge-xs badge-primary indicator-item">{count}</span>
                  )}
                </div>
              </button>
            </Link>

            <ThemeSelector />

            <div className="avatar">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full">
                <img src={authUser?.profilePic} alt="User Avatar" rel="noreferrer" />
              </div>
            </div>

            <button 
              className="btn btn-ghost btn-circle btn-sm sm:btn-md" 
              onClick={handleLogout}
              disabled={isPending}
              title="Logout"
            >
              <LogOutIcon className="h-5 w-5 sm:h-6 sm:w-6 text-base-content opacity-70" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
