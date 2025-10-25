import React from 'react'
import { MessageCircle, BookOpen, Award, Clock } from 'lucide-react'
import StatCard from './StatCard'

interface StatsGridProps {
  chatCount: number
  pastTrialCount: number
  quizCount: number
  lastQuizPercent: number | null
}

const StatsGrid: React.FC<StatsGridProps> = ({
  chatCount,
  pastTrialCount,
  quizCount,
  lastQuizPercent
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard icon={<MessageCircle />} title="AI Consultations" value={String(chatCount)} color="blue" index={0} />
      <StatCard icon={<BookOpen />} title="Past Trials" value={String(pastTrialCount)} color="purple" index={1} />
      <StatCard icon={<Award />} title="Quiz Score" value={lastQuizPercent !== null ? `${lastQuizPercent}%` : '—'} color="green" index={2} />
      <StatCard icon={<Clock />} title="Quizzes Completed" value={String(quizCount)} color="orange" index={3} />
    </div>
  )
}

export default StatsGrid