import React from 'react'
import { Scale, Loader2 } from 'lucide-react'

const LoadingScreen: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-full">
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative mb-6">
          <Scale className="h-16 w-16 text-amber-500 animate-pulse" />
          <Loader2 className="h-8 w-8 text-amber-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-slate-600 text-lg font-medium">Loading dashboard...</p>
      </div>
    </div>
  )
}

export default LoadingScreen