import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, HomeIcon, ShipWheelIcon, UsersIcon, GraduationCapIcon, ShieldIcon, UserIcon, MessageCircleIcon } from "lucide-react";
import { useUnreadFacultyMessages } from "../hooks/useUnreadFacultyMessages";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Track unread faculty messages for students
  const { unreadCount, hasUnread } = useUnreadFacultyMessages();

  return (
    <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-base-300">
        <Link to="/" className="flex items-center gap-2.5">
          <ShipWheelIcon className="size-9 text-primary" />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
            COCOON
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {/* Parent Dashboard Link - Only show for parent users */}
        {authUser?.role === "parent" && (
          <Link
            to="/parent-dashboard"
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
              currentPath === "/parent-dashboard" ? "btn-active" : ""
            }`}
          >
            <ShieldIcon className="size-5 text-base-content opacity-70" />
            <span>Parent Dashboard</span>
          </Link>
        )}

        {/* Faculty Dashboard Link - Only show for faculty users */}
        {authUser?.role === "faculty" && (
          <Link
            to="/faculty-dashboard"
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
              currentPath === "/faculty-dashboard" ? "btn-active" : ""
            }`}
          >
            <GraduationCapIcon className="size-5 text-base-content opacity-70" />
            <span>Faculty Dashboard</span>
          </Link>
        )}

        {/* Student Navigation Links - Only show for student users */}
        {authUser?.role === "student" && (
          <>
            {/* 1. Student Dashboard */}
            <Link
              to="/student-dashboard"
              className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
                currentPath === "/student-dashboard" ? "btn-active" : ""
              }`}
            >
              <UserIcon className="size-5 text-base-content opacity-70" />
              <span>Student Dashboard</span>
            </Link>

            {/* 2. Classroom Members */}
            <Link
              to="/"
              className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
                currentPath === "/" ? "btn-active" : ""
              }`}
            >
              <HomeIcon className="size-5 text-base-content opacity-70" />
              <span>Classroom Members</span>
            </Link>

            {/* 3. Friends */}
            <Link
              to="/friends"
              className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
                currentPath === "/friends" ? "btn-active" : ""
              }`}
            >
              <UsersIcon className="size-5 text-base-content opacity-70" />
              <span>Friends</span>
            </Link>

            {/* 4. Faculty Messages */}
            <Link
              to="/faculty-messages"
              className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
                currentPath === "/faculty-messages" ? "btn-active" : ""
              }`}
            >
              <div className="relative">
                <MessageCircleIcon className="size-5 text-base-content opacity-70" />
                {hasUnread && (
                  <div className="absolute -top-1 -right-1 bg-error text-error-content text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </div>
              <span>Faculty Messages</span>
              {hasUnread && (
                <span className="badge badge-error badge-sm ml-auto">
                  {unreadCount}
                </span>
              )}
            </Link>
          </>
        )}

        {/* Notifications Link - Show for all users except parents */}
        {authUser?.role !== "parent" && (
          <Link
            to="/notifications"
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
              currentPath === "/notifications" ? "btn-active" : ""
            }`}
          >
            <BellIcon className="size-5 text-base-content opacity-70" />
            <span>Notifications</span>
          </Link>
        )}
      </nav>

      {/* USER PROFILE SECTION */}
      <div className="p-4 border-t border-base-300 mt-auto">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-10 rounded-full">
              <img src={authUser?.profilePic} alt="User Avatar" />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{authUser?.fullName}</p>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="size-2 rounded-full bg-success inline-block" />
              Online
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
