import React, { useState, useEffect } from 'react';
import { Clock, XCircle, CreditCard } from 'lucide-react';
import type { PendingAppointment } from '../../types/appointment.types';
import { formatTimeLeft, getPlaceholderAvatar } from '../../utils/appointment.utils';
import { PENDING_PAYMENT_EXPIRY } from '../../constants/appointment.constants';

interface PendingAppointmentCardProps {
    appointment: PendingAppointment;
    onComplete: () => void;
    onCancel: () => void;
}

const PendingAppointmentCard: React.FC<PendingAppointmentCardProps> = ({
    appointment,
    onComplete,
    onCancel,
}) => {
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const createdTime = new Date(appointment.createdAt).getTime();
            const expiryTime = createdTime + PENDING_PAYMENT_EXPIRY;
            const now = Date.now();
            const remaining = Math.max(0, expiryTime - now);
            setTimeLeft(remaining);
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [appointment.createdAt]);

    if (timeLeft === 0) {
        return null;
    }

    const appointmentDate = new Date(appointment.appointmentTime);
    const formattedDate = appointmentDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
    const formattedTime = appointmentDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    const avatarUrl = appointment.lawyerId.profileImageUrl || getPlaceholderAvatar(appointment.lawyerId.name, 48);

    return (
        <div className="bg-white rounded-lg border border-amber-300 p-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <img
                        src={avatarUrl}
                        alt={appointment.lawyerId.name}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 truncate">
                            {appointment.lawyerId.name}
                        </h3>
                        <p className="text-sm text-slate-600">
                            {formattedDate} at {formattedTime}
                        </p>
                        <p className="text-sm font-semibold text-green-600">
                            ₹{appointment.price} for {appointment.duration} mins
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                        <Clock size={16} />
                        <span className="text-sm font-bold">{formatTimeLeft(timeLeft)}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onComplete}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <CreditCard size={16} />
                            Complete Payment
                        </button>
                        <button
                            onClick={onCancel}
                            className="px-3 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors"
                            title="Cancel"
                        >
                            <XCircle size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PendingAppointmentCard;