import React from 'react'
import { Scale, Sparkles } from 'lucide-react'

interface WelcomeHeaderProps {
  userName: string
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ userName }) => {
  return (
    <header className="mb-8">
      <div className="flex items-center gap-4 mb-3">
        <div className="p-3 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-lg">
          <Scale className="text-white" strokeWidth={2.5} size={32}/>
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 flex items-center gap-3">
            Welcome back, {userName}!
            <Sparkles className="h-7 w-7 text-amber-500" />
          </h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">Here's what's happening with your legal journey today</p>
        </div>
      </div>
    </header>
  )
}

export default WelcomeHeader