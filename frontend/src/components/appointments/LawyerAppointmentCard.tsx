import React from 'react';
import { Calendar, Clock, DollarSign, Video, XCircle } from 'lucide-react';
import type { LawyerAppointment } from '../../types/appointment.types';
import { formatDateLong, formatTime, getStatusBadge, getPlaceholderAvatar, isPastDate } from '../../utils/appointment.utils';
import JoinCallButton from '../JoinCallButton';

interface LawyerAppointmentCardProps {
    appointment: LawyerAppointment;
    onCancelClick: () => void;
    canCancel: boolean;
}

const LawyerAppointmentCard: React.FC<LawyerAppointmentCardProps> = ({
    appointment,
    onCancelClick,
    canCancel,
}) => {
    const past = isPastDate(appointment.appointmentTime);
    const isUpcoming = !past && appointment.appointmentStatus === 'scheduled';

    const formattedDate = formatDateLong(appointment.appointmentTime);
    const formattedTime = formatTime(appointment.appointmentTime);
    const avatarUrl = appointment.userId.profileImageUrl || getPlaceholderAvatar(appointment.userId.name, 64);

    const handleJoinCall = () => {
        window.open(`/lawyer-dashboard/call/${appointment.callRoomId}`, '_blank');
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Client Info */}
                <div className="flex items-center gap-4 flex-1">
                    <img
                        src={avatarUrl}
                        alt={appointment.userId.name}
                        className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-slate-900 truncate">
                            {appointment.userId.name}
                        </h3>
                        <p className="text-sm text-slate-600 truncate">{appointment.userId.email}</p>

                        {/* Status Badges */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(appointment.appointmentStatus)}`}>
                                {appointment.appointmentStatus.charAt(0).toUpperCase() + appointment.appointmentStatus.slice(1)}
                            </span>
                            {appointment.cancelledBy && (
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                    Cancelled by {appointment.cancelledBy}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Appointment Details */}
                <div className="flex flex-col gap-3 lg:w-1/3">
                    <div className="flex items-center gap-2 text-slate-700">
                        <Calendar size={18} className="text-slate-400" />
                        <span className="text-sm font-medium">{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                        <Clock size={18} className="text-slate-400" />
                        <span className="text-sm font-medium">
                            {formattedTime} ({appointment.duration} mins)
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                        <DollarSign size={18} className="text-slate-400" />
                        <span className="text-sm font-medium">₹{appointment.price}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 lg:w-auto">
                    {isUpcoming && (
                        <>
                            <JoinCallButton
                                appointmentId={appointment._id}
                                appointmentTime={appointment.appointmentTime}
                                callRoomId={appointment.callRoomId}
                                paymentStatus={appointment.paymentStatus}
                                appointmentStatus={appointment.appointmentStatus}
                            />
                            {canCancel && (
                                <button
                                    onClick={onCancelClick}
                                    className="flex items-center justify-center gap-2 px-6 py-2 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                                >
                                    <XCircle size={18} />
                                    Cancel
                                </button>
                            )}
                        </>
                    )}
                    {appointment.appointmentStatus === 'cancelled' && appointment.cancellationReason && (
                        <div className="text-xs text-slate-500 italic">
                            Reason: {appointment.cancellationReason}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LawyerAppointmentCard;