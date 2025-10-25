import React from 'react'
import QuizPerformanceCard from './QuizPerformanceCard'
import MockTrialStatsCard from './MockTrialStatsCard'

interface StatisticsSectionProps {
  quizStats: any
  trialStats: any
}

const StatisticsSection: React.FC<StatisticsSectionProps> = ({
  quizStats,
  trialStats
}) => {
  return (
    <div className="space-y-6">
      {quizStats && <QuizPerformanceCard stats={quizStats} />}
      {trialStats && <MockTrialStatsCard stats={trialStats} />}
    </div>
  )
}

export default StatisticsSection