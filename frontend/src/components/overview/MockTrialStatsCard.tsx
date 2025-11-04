import React from 'react'
import { Scale, Users, Trophy, Target, TrendingUp } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface TrialStatsProps {
  stats: {
    totalTrials: number
    completedTrials: number
    asPlaintiff: number
    asDefendant: number
    wins: number
    losses: number
    winRate: number
    recentTrials: Array<{
      title: string
      role: string
      status: string
      date: string
      won: boolean | null
      _id: string
    }>
  }
}

const MockTrialStatsCard: React.FC<TrialStatsProps> = ({ stats }) => {
  // Data for pie chart
  const winLossData = [
    { name: 'Won', value: stats.wins, color: '#10b981' },
    { name: 'Lost', value: stats.losses, color: '#ef4444' },
  ]

  const roleData = [
    { name: 'Plaintiff', value: stats.asPlaintiff, color: '#3b82f6' },
    { name: 'Defendant', value: stats.asDefendant, color: '#8b5cf6' },
  ]

  if (stats.totalTrials === 0) {
    return (
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-purple-500/30 transition-all duration-300">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Scale className="w-5 h-5 text-purple-600" />
          Mock Trial Statistics
        </h3>
        <div className="text-center py-8 text-gray-500">
          <Scale className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No mock trials yet</p>
          <p className="text-sm mt-1">Participate in trials to see your statistics</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-purple-500/30 transition-all duration-300">
      <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Scale className="w-5 h-5 text-purple-600" />
        Mock Trial Statistics
      </h3>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-purple-50 rounded-xl p-3 border border-slate-200">
          <div className="text-xs text-slate-600 mb-1">Total Trials</div>
          <div className="text-2xl font-bold text-purple-600">
            {stats.totalTrials}
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 border border-slate-200">
          <div className="text-xs text-slate-600 mb-1">Completed</div>
          <div className="text-2xl font-bold text-blue-600">
            {stats.completedTrials}
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-3 border border-slate-200">
          <div className="text-xs text-slate-600 mb-1">Win Rate</div>
          <div className="text-2xl font-bold text-green-600">
            {stats.winRate}%
          </div>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 border border-slate-200">
          <div className="text-xs text-slate-600 mb-1">Total Wins</div>
          <div className="text-2xl font-bold text-orange-600">
            {stats.wins}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {stats.completedTrials > 0 && (
        <div className="space-y-4">
          {/* Win/Loss Chart */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="text-xs text-slate-600 mb-3 font-medium">Win/Loss Distribution</div>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={winLossData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {winLossData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-slate-600">Won ({stats.wins})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs text-slate-600">Lost ({stats.losses})</span>
              </div>
            </div>
          </div>

          {/* Role Distribution */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="text-xs text-slate-600 mb-3 font-medium">Role Distribution</div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Plaintiff</span>
                  <span className="font-medium text-blue-600">{stats.asPlaintiff}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 rounded-full h-2 transition-all duration-500" 
                    style={{ width: `${(stats.asPlaintiff / stats.totalTrials) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Defendant</span>
                  <span className="font-medium text-purple-600">{stats.asDefendant}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 rounded-full h-2 transition-all duration-500" 
                    style={{ width: `${(stats.asDefendant / stats.totalTrials) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Badge */}
      <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
        <div className="flex items-start gap-2">
          <Trophy className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-900">
            {stats.winRate >= 70 
              ? "Outstanding performance! You're excelling in mock trials."
              : stats.winRate >= 50 
              ? "Good work! Keep practicing to improve your win rate."
              : stats.completedTrials < 3
              ? "Just getting started! Complete more trials to build experience."
              : "Keep learning! Analyze past trials to improve your strategy."}
          </p>
        </div>
      </div>
    </div>
  )
}

export default MockTrialStatsCard