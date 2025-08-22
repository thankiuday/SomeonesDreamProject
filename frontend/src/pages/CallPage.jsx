import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";
import BackButton from "../components/BackButton";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState(null);

  const { authUser, isLoading: authLoading } = useAuthUser();

  const { data: tokenData, error: tokenError, isLoading: tokenLoading } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
    retry: 3,
    retryDelay: 1000,
  });

  useEffect(() => {
    const initCall = async () => {
      // Reset error state
      setError(null);
      
      // Check if we have all required data
      if (!authUser) {
        setError("Authentication required. Please log in.");
        setIsConnecting(false);
        return;
      }

      if (!tokenData?.token) {
        if (tokenError) {
          setError("Failed to get video call token. Please try again.");
        }
        setIsConnecting(false);
        return;
      }

      if (!callId) {
        setError("Invalid call ID.");
        setIsConnecting(false);
        return;
      }

      if (!STREAM_API_KEY) {
        setError("Video call service is not configured.");
        setIsConnecting(false);
        return;
      }

      try {
        console.log("Initializing Stream video client...", {
          callId,
          userId: authUser._id,
          userName: authUser.fullName
        });

        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        const callInstance = videoClient.call("default", callId);

        await callInstance.join({ create: true });

        console.log("Joined call successfully");

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.error("Error joining call:", error);
        
        // Provide more specific error messages
        let errorMessage = "Could not join the call. Please try again.";
        
        if (error.message?.includes("token")) {
          errorMessage = "Authentication failed. Please log in again.";
        } else if (error.message?.includes("network")) {
          errorMessage = "Network error. Please check your connection.";
        } else if (error.message?.includes("permission")) {
          errorMessage = "You don't have permission to join this call.";
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsConnecting(false);
      }
    };

    // Only initialize if we're not loading auth or token
    if (!authLoading && !tokenLoading) {
      initCall();
    }
  }, [tokenData, authUser, callId, authLoading, tokenLoading, tokenError]);

  // Show loading state while authentication or token is loading
  if (authLoading || tokenLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-base-100 p-4">
        <div className="text-center">
          <PageLoader />
          <p className="mt-4 text-base-content opacity-70 text-sm sm:text-base">
            {authLoading ? "Checking authentication..." : "Getting video call token..."}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-base-100 p-4">
        <div className="absolute top-6 left-6 z-10">
          <BackButton 
            className="hover:bg-base-200/50 rounded-full p-2 transition-all duration-300 shadow-lg" 
            variant="outline"
          />
        </div>
        <div className="card bg-error/10 p-4 sm:p-8 text-center max-w-md w-full">
          <h3 className="font-semibold text-lg mb-4 text-error">Video Call Error</h3>
          <p className="text-error-content opacity-70 mb-6 text-sm sm:text-base">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="btn btn-error btn-outline"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/")}
              className="btn btn-ghost"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show connecting state
  if (isConnecting) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-base-100 p-4">
        <div className="absolute top-6 left-6 z-10">
          <BackButton 
            className="hover:bg-base-200/50 rounded-full p-2 transition-all duration-300 shadow-lg" 
            variant="outline"
          />
        </div>
        <div className="text-center">
          <PageLoader />
          <p className="mt-4 text-base-content opacity-70 text-sm sm:text-base">Joining video call...</p>
          <div className="mt-2 text-sm text-base-content opacity-50">
            This may take a few moments
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-base-100">
      <div className="relative w-full h-full">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full p-4">
            <div className="absolute top-6 left-6 z-10">
              <BackButton 
                className="hover:bg-base-200/50 rounded-full p-2 transition-all duration-300 shadow-lg" 
                variant="outline"
              />
            </div>
            <div className="card bg-base-200 p-4 sm:p-8 text-center max-w-md w-full">
              <h3 className="font-semibold text-lg mb-4">Call Not Available</h3>
              <p className="text-base-content opacity-70 mb-6 text-sm sm:text-base">
                Could not initialize call. Please refresh or try again later.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-primary"
                >
                  Refresh
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="btn btn-ghost"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const navigate = useNavigate();

  if (callingState === CallingState.LEFT) {
    // Add a small delay before navigating to show the leaving state
    setTimeout(() => navigate("/"), 1000);
    return (
      <div className="h-screen flex items-center justify-center bg-base-100">
        <div className="text-center">
          <p className="text-base-content opacity-70">Leaving call...</p>
        </div>
      </div>
    );
  }

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

export default CallPage;
