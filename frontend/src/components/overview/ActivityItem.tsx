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
    <div className="border-b border-gray-200 py-3 flex items-start gap-3">
      <div className="mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-gray-900">{title}</p>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>
        <span className="text-xs text-gray-500 mt-2 inline-block">{time}</span>
      </div>
    </div>
  );
}
  