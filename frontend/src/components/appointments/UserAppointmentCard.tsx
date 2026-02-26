import React from 'react';
import { Calendar, Clock, CheckCircle, XCircle, CreditCard, AlertTriangle } from 'lucide-react';
import type { Appointment } from '../../types/appointment.types';
import { formatDate, formatTime, getPlaceholderAvatar } from '../../utils/appointment.utils';
import JoinCallButton from '../JoinCallButton';

interface UserAppointmentCardProps {
    appointment: Appointment;
    onCancel: (appointment: Appointment) => void;
    onJoinCall: (roomId: string) => void;
    canCancel: boolean;
    cancelling: boolean;
}

const UserAppointmentCard: React.FC<UserAppointmentCardProps> = ({
    appointment,
    onCancel,
    onJoinCall: _onJoinCall,
    canCancel,
    cancelling,
}) => {
    const lawyerInfo = appointment.lawyerId;
    const avatarUrl = lawyerInfo.profileImageUrl || getPlaceholderAvatar(lawyerInfo.name, 64);

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                {/* Lawyer Info */}
                <div className="flex items-center gap-4">
                    <img
                        src={avatarUrl}
                        alt={lawyerInfo.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-slate-100"
                    />
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">{lawyerInfo.name}</h3>

                        {/* Date and Time */}
                        <div className="flex flex-wrap gap-2 text-sm text-slate-600 mt-1">
                            <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {formatDate(appointment.appointmentTime, 'en-IN')}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {formatTime(appointment.appointmentTime, 'en-IN')}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {appointment.duration} mins
                            </span>
                        </div>

                        {/* Status Badges */}
                        <div className="mt-2 flex flex-wrap gap-2">
                            {appointment.appointmentStatus === 'cancelled' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    <XCircle size={12} /> Cancelled
                                </span>
                            ) : appointment.appointmentStatus === 'completed' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle size={12} /> Completed
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    <CheckCircle size={12} /> Scheduled
                                </span>
                            )}

                            {appointment.paymentStatus === 'refunded' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    <CreditCard size={12} /> Refunded
                                </span>
                            )}

                            {appointment.paymentStatus === 'pending' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <AlertTriangle size={12} /> Payment Pending
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {appointment.appointmentStatus === 'scheduled' && (
                        <>
                            <JoinCallButton
                                appointmentId={appointment._id}
                                appointmentTime={appointment.appointmentTime}
                                callRoomId={appointment.callRoomId}
                                paymentStatus={appointment.paymentStatus}
                                appointmentStatus={appointment.appointmentStatus}
                            />
                            <button
                                onClick={() => onCancel(appointment)}
                                disabled={cancelling || !canCancel}
                                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <XCircle size={16} />
                                Cancel
                            </button>
                        </>
                    )}

                    {appointment.appointmentStatus === 'cancelled' && (
                        <div className="flex flex-col items-end text-sm">
                            <span className="font-medium text-red-600">
                                Cancelled by {appointment.cancelledBy || 'user'}
                            </span>
                            {appointment.cancellationReason && (
                                <span className="text-xs text-slate-500 italic mt-1">
                                    {appointment.cancellationReason}
                                </span>
                            )}
                            <span className="text-xs text-slate-500 italic mt-1">
                                {appointment.paymentStatus === 'refunded'
                                    ? '✓ Refund processed'
                                    : appointment.paymentStatus === 'paid'
                                        ? 'No refund'
                                        : 'Booking failed'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserAppointmentCard;