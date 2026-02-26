import React from 'react';
import { Calendar } from 'lucide-react';
import { getPlaceholderAvatar } from '../../utils/appointment.utils';

interface AppointmentPreviewCardProps {
    appointment: any;
}

const AppointmentPreviewCard: React.FC<AppointmentPreviewCardProps> = ({ appointment }) => {
    const appointmentDate = new Date(appointment.appointmentTime);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const userName = appointment.userId?.name || 'User';
    const userEmail = appointment.userId?.email || '';
    const avatarUrl =
        appointment.userId?.profileImageUrl || getPlaceholderAvatar(userName, 48);

    return (
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-indigo-50/40 hover:border-indigo-200 transition-all duration-150">
            <div className="flex items-center gap-4">
                <img
                    src={avatarUrl}
                    alt={userName}
                    className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div>
                    <p className="font-semibold text-slate-900">{userName}</p>
                    <p className="text-sm text-slate-500">{userEmail}</p>
                </div>
            </div>
            <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end text-slate-700 font-medium text-sm">
                    <Calendar size={13} className="text-indigo-500" />
                    {formattedDate}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{formattedTime}</p>
            </div>
        </div>
    );
};

export default AppointmentPreviewCard;