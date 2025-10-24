import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MessageCircle, Award, Video, Clock, ArrowLeft, Loader2,
  Scale, Filter, Calendar
} from 'lucide-react'
import { getRecentActivities } from '@/services/authService'

interface Activity {
  _id: string
  type: 'quiz' | 'trial' | 'chat'
  title: string
  description: string
  timestamp: string
}

const AllActivities: React.FC = () => {
  const navigate = useNavigate()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'quiz' | 'trial' | 'chat'>('all')

  useEffect(() => {
    const fetchAllActivities = async () => {
      try {
        setLoading(true)
        const response = await getRecentActivities(100) // Fetch up to 100 activities
        setActivities(response?.activities || [])
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllActivities()
  }, [])

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

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'quiz':
        return 'bg-green-50 border-green-200 hover:border-green-400'
      case 'trial':
        return 'bg-orange-50 border-orange-200 hover:border-orange-400'
      case 'chat':
        return 'bg-blue-50 border-blue-200 hover:border-blue-400'
      default:
        return 'bg-gray-50 border-gray-200 hover:border-gray-400'
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
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filter)

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative mb-6">
            <Scale className="h-16 w-16 text-amber-500 animate-pulse" />
            <Loader2 className="h-8 w-8 text-amber-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-600 text-lg font-medium">Loading activities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Overview</span>
        </button>
        
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
            <Clock size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              All Activities
            </h1>
            <p className="text-slate-600 mt-1">
              Complete history of your legal learning journey
            </p>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-slate-600" />
          <span className="font-semibold text-slate-900">Filter by type:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'quiz', 'trial', 'chat'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === type
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {type === 'all' ? 'All Activities' : type.charAt(0).toUpperCase() + type.slice(1)}
              <span className="ml-2 text-sm opacity-75">
                ({type === 'all' 
                  ? activities.length 
                  : activities.filter(a => a.type === type).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            {filteredActivities.length} {filter !== 'all' ? filter : ''} Activities
          </h2>
        </div>

        {filteredActivities.length > 0 ? (
          <div className="space-y-3">
            {filteredActivities.map((activity, index) => (
              <div
                key={activity._id || index}
                className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${getActivityColor(activity.type)}`}
              >
                <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {activity.title}
                  </h3>
                  <p className="text-sm text-slate-600 break-words">
                    {activity.description}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className="text-xs text-slate-500 font-medium">
                    {formatTime(activity.timestamp)}
                  </span>
                  <div className="mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      activity.type === 'quiz' ? 'bg-green-100 text-green-700' :
                      activity.type === 'trial' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {activity.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No {filter !== 'all' ? filter : ''} activities found</p>
            <p className="text-sm mt-2">Start using features to see your activity here</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AllActivities