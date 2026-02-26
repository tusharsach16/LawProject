import React from 'react'

interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  status: string;
}

export default function ActivityItem({ icon, title, description, time, status }: ActivityItemProps) {
  const getStatusColor = (status: string) => {
    if (status === 'completed') return 'text-green-600 bg-green-50'
    if (status === 'pending') return 'text-orange-600 bg-orange-50'
    return 'text-gray-600 bg-gray-50'
  }

  return (
    <div className="py-3.5 flex items-start gap-3.5 first:pt-0 last:border-none">
      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">{title}</p>
            <p className="text-sm text-slate-500 mt-0.5 leading-snug line-clamp-2">{description}</p>
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>
        <span className="text-xs text-slate-400 mt-1.5 inline-block">{time}</span>
      </div>
    </div>
  );
}
