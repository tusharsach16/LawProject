import React from 'react'
import type { NavigateFunction } from 'react-router-dom'
import RecentActivitySection from './RecentActivitySection'
import QuizPerformanceCard from './QuizPerformanceCard'
import MockTrialStatsCard from './MockTrialStatsCard'

interface ActivityAndStatsProps {
  recentActivities: any[]
  quizStats: any
  trialStats: any
  navigate: NavigateFunction
}

const ActivityAndStats: React.FC<ActivityAndStatsProps> = ({
  recentActivities,
  quizStats,
  trialStats,
  navigate
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <RecentActivitySection
        recentActivities={recentActivities}
        navigate={navigate}
      />
      {quizStats && <QuizPerformanceCard stats={quizStats} />}
      {trialStats && <MockTrialStatsCard stats={trialStats} />}
    </div>
  )
}

export default ActivityAndStats