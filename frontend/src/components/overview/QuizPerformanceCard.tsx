import React from 'react'
import { BarChart3, TrendingUp, TrendingDown, Award, Target } from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface QuizStatsProps {
  stats: {
    totalAttempts: number
    averageScore: number
    bestScore: number
    worstScore: number
    recentScores: Array<{
      score: number
      category: string
      date: string
      _id: string
    }>
    passRate: number
  }
}

const QuizPerformanceCard: React.FC<QuizStatsProps> = ({ stats }) => {
  // Calculate trend
  const recentScores = stats.recentScores || []
  const isImproving = recentScores.length >= 2 &&
    recentScores[recentScores.length - 1].score > recentScores[0].score

  // Format data for chart
  const chartData = recentScores.map((item, index) => ({
    name: `Quiz ${index + 1}`,
    score: item.score,
    category: item.category
  }))

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-teal-700'
    if (score >= 60) return 'text-indigo-600'
    return 'text-slate-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-teal-50'
    if (score >= 60) return 'bg-indigo-50'
    return 'bg-slate-100'
  }

  if (stats.totalAttempts === 0) {
    return (
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-500/30 transition-all duration-300">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Quiz Performance
        </h3>
        <div className="text-center py-8 text-gray-500">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No quiz attempts yet</p>
          <p className="text-sm mt-1">Start taking quizzes to see your performance</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Quiz Performance
        </h3>
        <div className={`flex items-center gap-1 text-sm font-medium ${isImproving ? 'text-green-600' : 'text-orange-600'}`}>
          {isImproving ? (
            <>
              <TrendingUp className="w-4 h-4" />
              Improving
            </>
          ) : (
            <>
              <TrendingDown className="w-4 h-4" />
              Need Focus
            </>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className={`${getScoreBg(stats.averageScore)} rounded-xl p-3.5 border border-slate-200`}>
          <div className="text-xs text-slate-500 mb-1 font-medium">Average Score</div>
          <div className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
            {stats.averageScore}%
          </div>
        </div>
        <div className="bg-indigo-50 rounded-xl p-3.5 border border-slate-200">
          <div className="text-xs text-slate-500 mb-1 font-medium">Pass Rate</div>
          <div className="text-2xl font-bold text-indigo-600">
            {stats.passRate}%
          </div>
        </div>
        <div className="bg-teal-50 rounded-xl p-3.5 border border-slate-200">
          <div className="text-xs text-slate-500 mb-1 font-medium">Best Score</div>
          <div className="text-2xl font-bold text-teal-700">
            {stats.bestScore}%
          </div>
        </div>
        <div className="bg-slate-100 rounded-xl p-3.5 border border-slate-200">
          <div className="text-xs text-slate-500 mb-1 font-medium">Total Quizzes</div>
          <div className="text-2xl font-bold text-slate-700">
            {stats.totalAttempts}
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-slate-500 mb-2 font-medium">Score Trend</div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                stroke="#94a3b8"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10 }}
                stroke="#94a3b8"
                width={28}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorScore)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick Tip */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-start gap-2">
          <Target className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-700 leading-relaxed">
            {stats.averageScore >= 80
              ? "Excellent work! Keep maintaining this performance."
              : stats.averageScore >= 60
                ? "Good progress! Review weak areas to improve further."
                : "Focus on understanding concepts. Review and practice more."}
          </p>
        </div>
      </div>
    </div>
  )
}

export default QuizPerformanceCard