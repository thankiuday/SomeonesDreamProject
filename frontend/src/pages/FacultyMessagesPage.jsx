import FacultyMessagesViewer from "../components/FacultyMessagesViewer";
import { MessageCircleIcon } from "lucide-react";

const FacultyMessagesPage = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <MessageCircleIcon className="size-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Faculty Messages</h1>
              <p className="text-base-content opacity-70 mt-2">
                View messages, files, and video call links from your teachers
              </p>
            </div>
          </div>
        </div>

        {/* Faculty Messages Viewer */}
        <div className="space-y-6">
          <FacultyMessagesViewer />
        </div>

        {/* Help Section */}
        <div className="card bg-base-200">
          <div className="card-body p-6">
            <h3 className="text-lg font-semibold mb-3">How to use Faculty Messages</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">📝 Text Messages</h4>
                <p className="opacity-70">Read announcements, instructions, and updates from your teachers</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">📎 File Attachments</h4>
                <p className="opacity-70">Download assignments, study materials, and other documents</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">🎥 Video Call Links</h4>
                <p className="opacity-70">Join virtual classroom sessions and one-on-one meetings</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">🔄 Real-time Updates</h4>
                <p className="opacity-70">Messages refresh automatically every 30 seconds</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyMessagesPage;
