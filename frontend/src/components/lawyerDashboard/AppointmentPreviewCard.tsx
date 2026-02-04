import React from 'react';
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
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <div className="flex items-center gap-4">
                <img
                    src={avatarUrl}
                    alt={userName}
                    className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                    <p className="font-semibold text-slate-900">{userName}</p>
                    <p className="text-sm text-slate-600">{userEmail}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="font-medium text-slate-900">{formattedDate}</p>
                <p className="text-sm text-slate-600">{formattedTime}</p>
            </div>
        </div>
    );
};

export default AppointmentPreviewCard;