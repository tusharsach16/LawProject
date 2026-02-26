import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Clock } from 'lucide-react';

interface JoinCallButtonProps {
    appointmentId: string;
    appointmentTime: string | Date;
    callRoomId: string;
    paymentStatus: string;
    appointmentStatus: string;
}

export const JoinCallButton: React.FC<JoinCallButtonProps> = ({
    appointmentId,
    appointmentTime,
    callRoomId: _callRoomId,
    paymentStatus,
    appointmentStatus,
}) => {
    const navigate = useNavigate();

    // Check if call is available (15 min before to 2 hours after appointment)
    const now = new Date();
    const appointmentDate = new Date(appointmentTime);
    const fifteenMinBefore = new Date(appointmentDate.getTime() - 15 * 60 * 1000);
    const twoHoursAfter = new Date(appointmentDate.getTime() + 2 * 60 * 60 * 1000);

    const isCallAvailable =
        now >= fifteenMinBefore &&
        now <= twoHoursAfter &&
        paymentStatus === 'paid' &&
        appointmentStatus === 'scheduled';

    const isUpcoming = now < fifteenMinBefore;
    const isExpired = now > twoHoursAfter;

    const handleJoinCall = () => {
        navigate(`/video-call/${appointmentId}`);
    };

    if (isExpired || appointmentStatus === 'completed' || appointmentStatus === 'cancelled') {
        return null;
    }

    if (isUpcoming) {
        const minutesUntil = Math.floor((fifteenMinBefore.getTime() - now.getTime()) / (1000 * 60));
        const hoursUntil = Math.floor(minutesUntil / 60);
        const remainingMinutes = minutesUntil % 60;

        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm">
                <Clock className="w-4 h-4" />
                <span>
                    Available in {hoursUntil > 0 ? `${hoursUntil}h ` : ''}{remainingMinutes}m
                </span>
            </div>
        );
    }

    if (isCallAvailable) {
        return (
            <button
                onClick={handleJoinCall}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
            >
                <Video className="w-5 h-5" />
                <span>Join Video Call</span>
            </button>
        );
    }

    return null;
};

export default JoinCallButton;