import React from 'react'
import type { NavigateFunction } from 'react-router-dom'
import RecentActivitySection from './RecentActivitySection'
import StatisticsSection from './StatisticsSection'

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <RecentActivitySection 
        recentActivities={recentActivities}
        navigate={navigate}
      />
      <StatisticsSection 
        quizStats={quizStats}
        trialStats={trialStats}
      />
    </div>
  )
}

export default ActivityAndStats