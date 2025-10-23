import React from 'react'
import { Sparkles } from 'lucide-react'
import type { NavigateFunction } from 'react-router-dom'
import QuickActionCard from './QuickActionCard'

interface QuickActionsGridProps {
  navigate: NavigateFunction
}

const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ navigate }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <QuickActionCard
          actionNumber="1"
          title="Start AI Chat"
          description="Get instant legal guidance and answers"
          buttonText="Open Chat"
          onClick={() => navigate('/dashboard/chatbot')}
          delay="0s"
          iconType="chat"
        />
        <QuickActionCard
          actionNumber="2"
          title="Find a Lawyer"
          description="Connect with verified legal professionals"
          buttonText="Browse Lawyers"
          onClick={() => navigate('/dashboard/talk-to-lawyer')}
          delay="0.05s"
          iconType="users"
        />
        <QuickActionCard
          actionNumber="3"
          title="Start a Mock trial"
          description="Practice your legal skills in simulated trials"
          buttonText="Take Trial"
          onClick={() => navigate('/dashboard/mock-trials')}
          delay="0.1s"
          iconType="award"
        />
        <QuickActionCard
          actionNumber="4"
          title="Start a Quiz"
          description="Test your legal knowledge"
          buttonText="Take Quiz"
          onClick={() => navigate('/dashboard/quiz')}
          delay="0.1s"
          iconType="award"
        />
      </div>
    </div>
  )
}

export default QuickActionsGrid