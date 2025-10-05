import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom'; 
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchCurrentUser } from '../redux/slices/userSlice';
import Header from '../components/dashboard/Header';
import Sidebar from '../components/dashboard/Sidebar';
import SearchBar from '../components/SearchBar'; 
import FollowRequests from './FollowRequests'; 

import Overview from './Overview';
import AiChatbot from './AIchatbot'; 
import QuizPage from './QuizPage';
import ProfilePage from  './ProfilePage';
import ConnectionsPage from './ConnectionsPage';
import UserProfilePage from './UserProfilePage';
import { useNotifications } from '../hooks/useNotifications';
import ConnectWithLawyers from './ConnectWithLawyers';
import MockTrialLobby from './MockTrialLobby';
import TrialRoomPage from './TrialRoomPage';
import TrialResultPage from './TrialResultPage';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, status, error } = useAppSelector(state => state.user);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { requests, processingId, handleResponse } = useNotifications(user);

  const [isFollowRequestsOpen, setIsFollowRequestsOpen] = useState(false);

  // User fetch karo agar load nahi hai
  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  if (status === 'loading') { return <div className="p-6">Loading...</div>; }
  if (status === 'failed') { return <div className="p-6 text-red-500">Error: {error}</div>; }
  if (!user) { return <div className="p-6">No user found</div>; }

  return (
    <>
      <div className="flex h-screen">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          onSearchClick={() => setIsSearchOpen(true)}
          onNotificationsClick={() => setIsFollowRequestsOpen(true)}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onToggleSidebar={() => setIsSidebarOpen(true)} />

          <main className="flex-1 overflow-auto bg-gray-50">
            <Routes>
              <Route index element={<Overview />} /> 
              <Route path="chatbot" element={<AiChatbot />} />
              <Route path="quiz" element={<QuizPage />} />
              <Route path='profile' element={<ProfilePage/>} />
              <Route path="connections" element={<ConnectionsPage />} />
              <Route path='profile/:username' element={<UserProfilePage />} />
              <Route path="talk-to-lawyer" element={<ConnectWithLawyers />} />
              <Route path="mock-trials" element={<MockTrialLobby />} />
              <Route path="mock-trial/room/:trialId" element={<TrialRoomPage />} /> 
              <Route path="trial-result/:trialId" element={<TrialResultPage/>}/>
            </Routes>
          </main>
        </div>
      </div>
      
      <SearchBar 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Friend Requests */}
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
