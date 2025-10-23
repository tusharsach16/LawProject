import React from 'react'
import { MessageCircle, Users, Award, ArrowRight } from 'lucide-react'

interface QuickActionCardProps {
  actionNumber: string
  title: string
  description: string
  buttonText: string
  onClick: () => void
  delay: string
  iconType: 'chat' | 'users' | 'award'
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  actionNumber,
  title,
  description,
  buttonText,
  onClick,
  delay,
  iconType
}) => {
  const getIcon = () => {
    switch (iconType) {
      case 'chat':
        return <MessageCircle className="h-5 w-5 text-amber-600" />
      case 'users':
        return <Users className="h-5 w-5 text-amber-600" />
      case 'award':
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <MessageCircle className="h-5 w-5 text-amber-600" />
    }
  }

  return (
    <div 
      onClick={onClick}
      className="bg-white border-2 border-slate-200 rounded-2xl p-6 flex flex-col hover:shadow-xl hover:border-amber-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
      style={{ animation: `slideInCase 0.4s ease-out ${delay} both` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
          {getIcon()}
        </div>
        <div className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
          Action #{actionNumber}
        </div>
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-slate-600 leading-relaxed flex-grow line-clamp-4 mb-4">
        {description}
      </p>
      <button className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group/btn">
        {buttonText}
        <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </div>
  )
}

export default QuickActionCard