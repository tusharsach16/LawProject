// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { fetchCurrentUser } from '../redux/slices/userSlice'
import Header from '../components/dashboard/Header'
import Sidebar from '../components/dashboard/Sidebar'
import Overview from './Overview' // <-- import your new page

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch()
  const { user, status, error } = useAppSelector(state => state.user)

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser())
    }
  }, [dispatch, user])

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
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setIsSidebarOpen(true)} />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Overview /> {/* <-- your new overview section */}
        </main>
      </div>
    </div>
  )
}

export default Dashboard
