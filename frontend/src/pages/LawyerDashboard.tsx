import React, { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchCurrentUser } from "../redux/slices/userSlice";
import Header from "../components/dashboard/Header";
import Sidebar from "../components/dashboard/Sidebar";
import SearchBar from "../components/SearchBar";
import FollowRequests from "./FollowRequests";
import { useNotifications } from "../hooks/useNotifications";

const LawyerOverview = lazy(() => import("./LawyerOverview"));
const LawyerAppointments = lazy(() => import("./LawyerAppointments"));
const AiChatbot = lazy(() => import("./AIchatbot"));
const QuizPage = lazy(() => import("./QuizPage"));
const QuizHistoryPage = lazy(() => import("./QuizHistoryPage"));
const ProfilePage = lazy(() => import("./ProfilePage"));
const ConnectionsPage = lazy(() => import("./ConnectionsPage"));
const UserProfilePage = lazy(() => import("./UserProfilePage"));
const MockTrialLobby = lazy(() => import("./MockTrialLobby"));
const TrialRoomPage = lazy(() => import("./TrialRoomPage"));
const TrialResultPage = lazy(() => import("./TrialResultPage"));
const PastTrialsPage = lazy(() => import("./PastTrialsPage"));
const AllActivities = lazy(() => import("./AllActivities"));
const LawyerAvailabilityManager = lazy(
  () => import("../components/LawyerAvailabilityManager")
);

const LawyerDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { user, status, error } = useAppSelector(state => state.user);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFollowRequestsOpen, setIsFollowRequestsOpen] = useState(false);

  const { requests, processingId, handleResponse } = useNotifications(user);

  const hideHeaderRoutes = [
    "/lawyer-dashboard/chatbot",
    "/lawyer-dashboard/profile",
  ];

  const shouldShowHeader =
    !hideHeaderRoutes.includes(location.pathname) &&
    !location.pathname.startsWith("/lawyer-dashboard/profile/");

  useEffect(() => {
    if (!user) dispatch(fetchCurrentUser());
  }, [dispatch, user]);

  if (status === "loading") return <div className="p-6">Loading...</div>;
  if (status === "failed") return <div className="p-6 text-red-500">{error}</div>;
  if (!user || user.role !== "lawyer") return <div className="p-6">Access denied</div>;

  return (
    <>
      <div className="flex h-screen">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSearchClick={() => setIsSearchOpen(true)}
          onNotificationsClick={() => setIsFollowRequestsOpen(true)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isLawyer
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {shouldShowHeader && (
            <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
          )}

          <main className="flex-1 overflow-auto bg-gray-50">
            <Suspense fallback={<div className="p-6">Loading...</div>}>
              <Routes>
                <Route index element={<LawyerOverview />} />
                <Route path="appointments" element={<LawyerAppointments />} />
                <Route path="all-activities" element={<AllActivities />} />
                <Route path="chatbot" element={<AiChatbot />} />
                <Route path="quiz" element={<QuizPage />} />
                <Route path="quiz-history" element={<QuizHistoryPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="connections" element={<ConnectionsPage />} />
                <Route path="profile/:username" element={<UserProfilePage />} />
                <Route path="mock-trials" element={<MockTrialLobby />} />
                <Route path="past-trials" element={<PastTrialsPage />} />
                <Route path="mock-trial/room/:trialId" element={<TrialRoomPage />} />
                <Route path="trial-result/:trialId" element={<TrialResultPage />} />
                <Route path="availability" element={<LawyerAvailabilityManager />} />
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

export default LawyerDashboard;
