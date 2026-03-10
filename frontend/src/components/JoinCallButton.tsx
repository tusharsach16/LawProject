import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Clock, Lock } from 'lucide-react';

interface JoinCallButtonProps {
    appointmentId: string;
    appointmentTime: string | Date;
    duration: number; // in minutes
    callRoomId: string;
    paymentStatus: string;
    appointmentStatus: string;
}

function getWindowBounds(appointmentTime: string | Date, duration: number) {
    const start = new Date(appointmentTime).getTime();
    const end = start + duration * 60 * 1000;
    return { start, end };
}

export const JoinCallButton: React.FC<JoinCallButtonProps> = ({
    appointmentId,
    appointmentTime,
    duration,
    paymentStatus,
    appointmentStatus,
}) => {
    const navigate = useNavigate();
    const [now, setNow] = useState(Date.now());

    // Re-evaluate every second so the button activates exactly on time
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    if (paymentStatus !== 'paid' || appointmentStatus !== 'scheduled') return null;

    const { start, end } = getWindowBounds(appointmentTime, duration);

    // Window has expired → hide the button entirely
    if (now > end) return null;

    // Window not yet open → show countdown
    if (now < start) {
        const msLeft = start - now;
        const totalSeconds = Math.ceil(msLeft / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const parts: string[] = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
        parts.push(`${seconds}s`);

        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-lg text-sm select-none">
                <Lock className="w-4 h-4" />
                <span>Opens in {parts.join(' ')}</span>
            </div>
        );
    }

    // Window is open → active join button
    const msRemaining = end - now;
    const minutesLeft = Math.floor(msRemaining / 60000);

    return (
        <div className="flex flex-col items-start gap-1">
            <button
                onClick={() => navigate(`/video-call/${appointmentId}`)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
            >
                <Video className="w-5 h-5" />
                <span>Join Video Call</span>
            </button>
            <span className="flex items-center gap-1 text-xs text-slate-400 pl-1">
                <Clock className="w-3 h-3" />
                {minutesLeft > 0 ? `${minutesLeft}m remaining` : 'Ending soon'}
            </span>
        </div>
    );
};

export default JoinCallButton;