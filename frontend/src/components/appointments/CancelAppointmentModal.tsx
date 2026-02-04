import React from 'react';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import type { Appointment, RefundInfo } from '../../types/appointment.types';
import { getRefundInfo } from '../../utils/appointment.utils';

interface CancelAppointmentModalProps {
    appointment: Appointment;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => Promise<void>;
    cancelling: boolean;
    personName: string; // Name of user or lawyer being cancelled with
    role?: 'user' | 'lawyer'; // Who is cancelling
}

const CancelAppointmentModal: React.FC<CancelAppointmentModalProps> = ({
    appointment,
    isOpen,
    onClose,
    onConfirm,
    cancelling,
    personName,
    role = 'user',
}) => {
    const [cancelReason, setCancelReason] = React.useState('');

    if (!isOpen) return null;

    const handleConfirm = async () => {
        await onConfirm(cancelReason);
        setCancelReason('');
    };

    const refundInfo = getRefundInfo(appointment);

    const getRefundInfoColor = (type: RefundInfo['type']) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-100 text-green-700';
            case 'warning':
                return 'bg-red-50 border-red-100 text-red-700';
            case 'info':
                return 'bg-blue-50 border-blue-100 text-blue-700';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 text-red-600 mb-4">
                        <div className="p-2 bg-red-100 rounded-full">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-xl font-bold">Cancel Appointment</h3>
                    </div>

                    {/* Confirmation Message */}
                    <p className="text-slate-600 mb-4">
                        Are you sure you want to cancel {role === 'user' ? 'your' : 'the'} appointment with{' '}
                        <span className="font-semibold text-slate-900">{personName}</span>?
                    </p>

                    {/* Refund Information */}
                    {role === 'user' && (
                        <div className={`mb-4 p-3 border rounded-lg flex items-start gap-2 text-sm ${getRefundInfoColor(refundInfo.type)}`}>
                            {refundInfo.type === 'success' ? (
                                <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                            ) : (
                                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                            )}
                            <span>{refundInfo.message}</span>
                        </div>
                    )}

                    {role === 'lawyer' && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg flex items-start gap-2 text-sm text-green-700">
                            <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                            <span>The client will receive a full refund within 5-7 business days.</span>
                        </div>
                    )}

                    {/* Cancellation Reason */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Reason {role === 'lawyer' && 'for cancellation'} (Optional)
                        </label>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder={role === 'lawyer' ? "Let the client know why you're cancelling..." : "Why are you cancelling?"}
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[80px] text-sm"
                            maxLength={500}
                            disabled={cancelling}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={cancelling}
                            className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
                        >
                            Keep Appointment
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={cancelling}
                            className="flex-1 py-2.5 px-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {cancelling ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Cancelling...
                                </>
                            ) : (
                                `Confirm ${role === 'lawyer' ? 'Cancellation' : 'Cancel'}`
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CancelAppointmentModal;