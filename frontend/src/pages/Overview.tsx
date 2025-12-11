import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  getQuizCount, 
  getDetailedQuizResults, 
  getPastMockTrials, 
  getChatHistory, 
  getRecentActivities,
  getQuizStatistics,
  getMockTrialStatistics
} from '@/services/authService'
import { useAppSelector } from '../redux/hooks'
import LoadingScreen from '@/components/overview/LoadingScreen'
import WelcomeHeader from '@/components/overview/WelcomeHeader'
import StatsGrid from '@/components/overview/StatsGrid'
import QuickActionsGrid from '@/components/overview/QuickActionsGrid'
import ActivityAndStats from '@/components/overview/ActivityAndStats'

const Overview: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAppSelector(state => state.user)
  
  // Show UI immediately with loading states
  const [chatCount, setChatCount] = useState<number | null>(null)
  const [pastTrialCount, setPastTrialCount] = useState<number | null>(null)
  const [quizCount, setQuizCount] = useState<number | null>(null)
  const [lastQuizPercent, setLastQuizPercent] = useState<number | null>(null)
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [quizStats, setQuizStats] = useState<any>(null)
  const [trialStats, setTrialStats] = useState<any>(null)
  
  // Only show loading screen on initial mount
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    // Load data in background - don't block UI
    const fetchOverviewData = async () => {
      try {
        // Show UI after 300ms even if data isn't loaded
        setTimeout(() => setInitialLoad(false), 300)

        // Load critical stats first
        const [chatRes, trialsRes, quizCountRes] = await Promise.all([
          getChatHistory().catch(() => []),
          getPastMockTrials().catch(() => []),
          getQuizCount().catch(() => ({ quizCount: 0 }))
        ])

        const chats = Array.isArray(chatRes) ? chatRes : []
        const userMessages = chats.filter((msg: any) => msg.sender === 'user')
        setChatCount(userMessages.length || 0)

        const trials = Array.isArray(trialsRes) ? trialsRes : trialsRes?.trials || []
        setPastTrialCount(trials.length || 0)

        setQuizCount(Number(quizCountRes?.quizCount || 0))

        // Load secondary data after initial render
        const [quizDetailsRes, activitiesRes, quizStatsRes, trialStatsRes] = await Promise.all([
          getDetailedQuizResults().catch(() => ({ attempts: [] })),
          getRecentActivities().catch(() => ({ activities: [] })),
          getQuizStatistics().catch(() => null),
          getMockTrialStatistics().catch(() => null)
        ])

        const attempts = Array.isArray(quizDetailsRes?.attempts) ? quizDetailsRes.attempts : []
        setLastQuizPercent(attempts.length > 0 ? Number(attempts[0]?.percentage) || 0 : null)

        const activities = Array.isArray(activitiesRes?.activities) ? activitiesRes.activities : []
        setRecentActivities(activities)

        setQuizStats(quizStatsRes)
        setTrialStats(trialStatsRes)

      } catch (e: any) {
        console.error('Failed to load some overview data:', e)
        setInitialLoad(false)
      }
    }

    fetchOverviewData()
  }, [])

  // Only show loading screen briefly on first load
  if (initialLoad) {
    return <LoadingScreen />
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-full">
      <WelcomeHeader userName={user?.name || 'User'} />
      
      {/* Show skeleton/loading state for null values */}
      <StatsGrid 
        chatCount={chatCount ?? 0}
        pastTrialCount={pastTrialCount ?? 0}
        quizCount={quizCount ?? 0}
        lastQuizPercent={lastQuizPercent}
        
      />

      <QuickActionsGrid navigate={navigate} />

      <ActivityAndStats
        recentActivities={recentActivities}
        quizStats={quizStats}
        trialStats={trialStats}
        navigate={navigate}
        
      />
    </div>
  )
}

export default Overview