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
  const [chatCount, setChatCount] = useState(0)
  const [pastTrialCount, setPastTrialCount] = useState(0)
  const [quizCount, setQuizCount] = useState(0)
  const [lastQuizPercent, setLastQuizPercent] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [, setError] = useState<string | null>(null)
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [quizStats, setQuizStats] = useState<any>(null)
  const [trialStats, setTrialStats] = useState<any>(null)

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [
          chatRes, 
          trialsRes, 
          quizCountRes, 
          quizDetailsRes, 
          activitiesRes,
          quizStatsRes,
          trialStatsRes
        ] = await Promise.all([
          getChatHistory().catch(() => []),
          getPastMockTrials().catch(() => []),
          getQuizCount().catch(() => ({ quizCount: 0 })),
          getDetailedQuizResults().catch(() => ({ attempts: [] })),
          getRecentActivities().catch(() => ({ activities: [] })),
          getQuizStatistics().catch(() => null),
          getMockTrialStatistics().catch(() => null)
        ])

        // Process chat history
        const chats = Array.isArray(chatRes) ? chatRes : []
        const userMessages = chats.filter((msg: any) => msg.sender === 'user')
        setChatCount(userMessages.length || 0)

        // Process trials
        const trials = Array.isArray(trialsRes) ? trialsRes : trialsRes?.trials || []
        setPastTrialCount(trials.length || 0)

        // Process quiz data
        setQuizCount(Number(quizCountRes?.quizCount || 0))
        const attempts = Array.isArray(quizDetailsRes?.attempts) ? quizDetailsRes.attempts : []
        setLastQuizPercent(attempts.length > 0 ? Number(attempts[0]?.percentage) || 0 : null)

        // Set recent activities
        const activities = Array.isArray(activitiesRes?.activities) ? activitiesRes.activities : []
        setRecentActivities(activities)

        // Set statistics
        setQuizStats(quizStatsRes)
        setTrialStats(trialStatsRes)

      } catch (e: any) {
        setError(e?.message || 'Failed to load overview data')
      } finally {
        setLoading(false)
      }
    }

    fetchOverviewData()
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-full">
      <WelcomeHeader userName={user?.name || 'User'} />
      
      <StatsGrid 
        chatCount={chatCount}
        pastTrialCount={pastTrialCount}
        quizCount={quizCount}
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
