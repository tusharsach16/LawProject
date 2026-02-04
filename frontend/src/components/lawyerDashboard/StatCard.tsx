import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    color: 'blue' | 'amber' | 'green' | 'red' | 'emerald' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-100 text-blue-600',
        amber: 'bg-amber-100 text-amber-600',
        green: 'bg-green-100 text-green-600',
        red: 'bg-red-100 text-red-600',
        emerald: 'bg-emerald-100 text-emerald-600',
        purple: 'bg-purple-100 text-purple-600',
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div
                className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}
            >
                <Icon size={24} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-600 mt-1">{label}</p>
        </div>
    );
};

export default StatCard;