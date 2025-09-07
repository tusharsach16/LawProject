import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom'; 
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchCurrentUser } from '../redux/slices/userSlice';
import Header from '../components/dashboard/Header';
import Sidebar from '../components/dashboard/Sidebar';
import SearchBar from '../components/SearchBar'; 

import Overview from './Overview';
import AiChatbot from './AIchatbot'; 
import QuizPage from './QuizPage';
import ProfilePage from  './ProfilePage';
import ConnectionsPage from './ConnectionsPage';
import UserProfilePage from './UserProfilePage';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, status, error } = useAppSelector(state => state.user);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // 2. Search modal ko control karne ke liye nayi state banayein
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  if (status === 'loading') {
    return <div className="p-6">Loading...</div>;
  }

  if (status === 'failed') {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  if (!user) {
    return <div className="p-6">No user found</div>;
  }

  return (
    // Fragment ka istemal karein taaki SearchBar ko add kar sakein
    <>
      <div className="flex h-screen">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          // 3. Search modal kholne ke liye function pass karein
          onSearchClick={() => setIsSearchOpen(true)}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onToggleSidebar={() => setIsSidebarOpen(true)} />

          <main className="flex-1 overflow-auto bg-gray-50">
            <Routes>
              <Route index element={<Overview />} /> 
              {/* Search ke liye alag se route ki zaroorat nahi hai */}
              <Route path="chatbot" element={<AiChatbot />} />
              <Route path="quiz" element={<QuizPage />} />
              <Route path='profile' element={<ProfilePage/>} />
              <Route path="connections" element={<ConnectionsPage />} />
              <Route path='profile/:username' element={<UserProfilePage />} />
            </Routes>
          </main>
        </div>
      </div>
      
      {/* 4. SearchBar modal ko yahan render karein */}
      <SearchBar 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};

export default Dashboard;

