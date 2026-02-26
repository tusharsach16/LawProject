import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    color: 'indigo' | 'slate' | 'teal' | 'rose' | 'amber' | 'blue' | 'green' | 'red' | 'emerald' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => {
    const colorClasses: Record<string, string> = {
        indigo: 'bg-indigo-50 text-indigo-600',
        slate: 'bg-slate-100 text-slate-600',
        teal: 'bg-teal-50 text-teal-600',
        rose: 'bg-rose-50 text-rose-600',
        // kept for backward compat but mapped to professional alternatives
        blue: 'bg-indigo-50 text-indigo-600',
        amber: 'bg-slate-100 text-slate-600',
        green: 'bg-teal-50 text-teal-600',
        red: 'bg-rose-50 text-rose-600',
        emerald: 'bg-teal-50 text-teal-700',
        purple: 'bg-indigo-50 text-indigo-600',
    };

    return (
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 hover:shadow-lg hover:border-indigo-200 transition-all duration-200">
            <div className={`w-11 h-11 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-4`}>
                <Icon size={22} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500 mt-1 font-medium">{label}</p>
        </div>
    );
};

export default StatCard;