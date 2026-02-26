import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface ActionCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    onClick: () => void;
    gradient: string;
}

const ActionCard: React.FC<ActionCardProps> = ({
    icon: Icon,
    title,
    description,
    onClick,
}) => {
    return (
        <button
            onClick={onClick}
            className="bg-white border-2 border-slate-200 rounded-2xl p-5 text-left transition-all hover:shadow-lg hover:border-indigo-300 hover:-translate-y-0.5 transform group w-full"
        >
            <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                <Icon size={22} className="text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-500">{description}</p>
        </button>
    );
};

export default ActionCard;