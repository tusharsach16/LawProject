import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { fetchCurrentUser } from '../redux/slices/userSlice'
import Header from '../components/dashboard/Header'
import Sidebar from '../components/dashboard/Sidebar'
import Overview from './Overview'
import AiChatbot from '../pages/AIchatbot' // Apne chatbot component ko import karein

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch()
  const { user, status, error } = useAppSelector(state => state.user)

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activePage, setActivePage] = useState('overview') // Default page 'overview' set hai

  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser())
    }
  }, [dispatch, user])

  // Yeh function check karega kaunsa page dikhana hai
  const renderContent = () => {
    switch (activePage) {
      case 'overview':
        return <Overview />;
      case 'chatbot':
        return <AiChatbot />;
      // Yahan aap baaki pages ke liye bhi cases add kar sakte hain
      default:
        return <Overview />;
    }
  }

  if (status === 'loading') {
    return <div className="p-6">Loading...</div>
  }

  if (status === 'failed') {
    return <div className="p-6 text-red-500">Error: {error}</div>
  }

  if (!user) {
    return <div className="p-6">No user found</div>
  }

  return (
    <div className="flex h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNavigate={setActivePage} 
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-auto bg-gray-50">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default Dashboard