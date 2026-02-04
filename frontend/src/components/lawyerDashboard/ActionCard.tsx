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
    gradient,
}) => {
    return (
        <button
            onClick={onClick}
            className={`bg-gradient-to-br ${gradient} text-white rounded-xl p-6 text-left transition-all hover:shadow-lg hover:scale-105 transform`}
        >
            <Icon size={32} className="mb-3" />
            <h3 className="font-bold text-lg mb-1">{title}</h3>
            <p className="text-sm text-white/90">{description}</p>
        </button>
    );
};

export default ActionCard;