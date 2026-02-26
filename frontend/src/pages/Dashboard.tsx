import React, { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchCurrentUser } from "../redux/slices/userSlice";
import Header from "../components/dashboard/Header";
import Sidebar from "../components/dashboard/Sidebar";
import SearchBar from "../components/SearchBar";
import FollowRequests from "./FollowRequests";
import { useNotifications } from "../hooks/useNotifications";

const Overview = lazy(() => import("./Overview"));
const AiChatbot = lazy(() => import("./AIchatbot"));
const QuizPage = lazy(() => import("./QuizPage"));
const QuizHistoryPage = lazy(() => import("./QuizHistoryPage"));
const ProfilePage = lazy(() => import("./ProfilePage"));
const ConnectionsPage = lazy(() => import("./ConnectionsPage"));
const UserProfilePage = lazy(() => import("./UserProfilePage"));
const ConnectWithLawyers = lazy(() => import("./ConnectWithLawyers"));
const MockTrialLobby = lazy(() => import("./MockTrialLobby"));
const TrialRoomPage = lazy(() => import("./TrialRoomPage"));
const TrialResultPage = lazy(() => import("./TrialResultPage"));
const PastTrialsPage = lazy(() => import("./PastTrialsPage"));
const AllActivities = lazy(() => import("./AllActivities"));
const PendingPayments = lazy(() => import("./PendingPayments"));
const UserAppointments = lazy(() => import("./UserAppointments"));

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { user, status, error } = useAppSelector(state => state.user);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFollowRequestsOpen, setIsFollowRequestsOpen] = useState(false);

  const { requests, processingId, handleResponse } = useNotifications(user);

  const hideHeaderRoutes = [
    "/dashboard/chatbot",
    "/dashboard/profile",
  ];

  const isTrialRoom = location.pathname.startsWith("/dashboard/mock-trial/room/");

  const shouldShowHeader =
    !isTrialRoom &&
    !hideHeaderRoutes.includes(location.pathname) &&
    !location.pathname.startsWith("/dashboard/profile/");

  useEffect(() => {
    if (!user && status !== 'loading') {
      console.log('Dashboard: Fetching user profile...');
      const startTime = Date.now();

      dispatch(fetchCurrentUser()).then(() => {
        console.log(`User profile loaded in ${Date.now() - startTime}ms`);
      });
    }
  }, [dispatch, user, status]);


  const LoadingSkeleton = () => (
    <div className="p-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
  if (status === "loading") return <LoadingSkeleton />;
  if (status === "failed") return <div className="p-6 text-red-500">{error}</div>;
  if (!user) return <div className="p-6">No user found</div>;

  return (
    <>
      <div className="flex h-screen">
        {!isTrialRoom && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onSearchClick={() => setIsSearchOpen(true)}
            onNotificationsClick={() => setIsFollowRequestsOpen(true)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            notificationCount={requests.length}
          />
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          {shouldShowHeader && (
            <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
          )}

          <main className="flex-1 overflow-auto bg-gray-50">
            <Suspense fallback={<div className="p-6">Loading...</div>}>
              <Routes>
                <Route index element={<Overview />} />
                <Route path="all-activities" element={<AllActivities />} />
                <Route path="chatbot" element={<AiChatbot />} />
                <Route path="quiz" element={<QuizPage />} />
                <Route path="quiz-history" element={<QuizHistoryPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="connections" element={<ConnectionsPage />} />
                <Route path="profile/:username" element={<UserProfilePage />} />
                <Route path="talk-to-lawyer" element={<ConnectWithLawyers />} />
                <Route path="mock-trials" element={<MockTrialLobby />} />
                <Route path="past-trials" element={<PastTrialsPage />} />
                <Route path="mock-trial/room/:trialId" element={<TrialRoomPage />} />
                <Route path="trial-result/:trialId" element={<TrialResultPage />} />
                <Route path="pending-payments" element={<PendingPayments />} />
                <Route path="user-appointments" element={<UserAppointments />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>

      <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <FollowRequests
        isOpen={isFollowRequestsOpen}
        onClose={() => setIsFollowRequestsOpen(false)}
        requests={requests}
        onResponse={handleResponse}
        isProcessingId={processingId}
      />
    </>
  );
};

export default Dashboard;
