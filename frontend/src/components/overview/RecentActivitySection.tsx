import React from 'react'
import { Clock, Award, Video, MessageCircle, ArrowRight } from 'lucide-react'
import type { NavigateFunction } from 'react-router-dom'
import ActivityItem from './ActivityItem'

interface RecentActivitySectionProps {
  recentActivities: any[]
  navigate: NavigateFunction
}

const RecentActivitySection: React.FC<RecentActivitySectionProps> = ({
  recentActivities,
  navigate
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return <Award className="w-5 h-5 text-green-600" />
      case 'trial':
        return <Video className="w-5 h-5 text-orange-600" />
      case 'chat':
        return <MessageCircle className="w-5 h-5 text-blue-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col h-full hover:shadow-xl hover:border-amber-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600 shrink-0" />
          Recent Activity
        </h2>
        <button
          onClick={() => navigate('/dashboard/all-activities')}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:gap-2 transition-all shrink-0"
        >
          View All <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 divide-y divide-slate-100 -mx-1 px-1">
        {recentActivities.length > 0 ? (
          recentActivities.map((activity, index) => (
            <ActivityItem
              key={activity._id || index}
              icon={getActivityIcon(activity.type)}
              title={activity.title}
              description={activity.description}
              time={formatTime(activity.timestamp)}
              status="completed"
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Clock className="w-12 h-12 mb-3 opacity-40" />
            <p className="font-medium text-slate-500">No recent activity</p>
            <p className="text-sm mt-1 text-center">Start using features to see your activity here</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentActivitySection
