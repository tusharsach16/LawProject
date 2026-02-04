import React, { useState } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { useUserAppointments, useCancelAppointment, useFilteredAppointments } from '../hooks/useAppointments';
import type { Appointment, UserAppointmentTab } from '../types/appointment.types';
import { USER_TABS } from '../constants/appointment.constants';
import { canCancelAppointment } from '../utils/appointment.utils';
import UserAppointmentCard from '../components/appointments/UserAppointmentCard';
import CancelAppointmentModal from '../components/appointments/CancelAppointmentModal';

const UserAppointments: React.FC = () => {
    const [activeTab, setActiveTab] = useState<UserAppointmentTab>('scheduled');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const { appointments, loading, refetch } = useUserAppointments();
    const { cancelAppointment, cancelling } = useCancelAppointment();
    const filteredAppointments = useFilteredAppointments(appointments, activeTab);

    const openCancelModal = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setShowCancelModal(true);
    };

    const closeCancelModal = () => {
        setShowCancelModal(false);
        setSelectedAppointment(null);
    };

    const handleConfirmCancel = async (reason: string) => {
        if (!selectedAppointment) return;

        try {
            const response = await cancelAppointment(
                selectedAppointment._id,
                reason || 'Cancelled by user'
            );

            if (response.success) {
                const message = response.refund
                    ? 'Appointment cancelled successfully! Refund will be processed within 5-7 business days.'
                    : 'Appointment cancelled successfully.';
                alert(message);
                await refetch();
                closeCancelModal();
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.msg || 'Failed to cancel appointment. Please try again.';
            alert(`${errorMsg}`);
        }
    };

    const handleJoinCall = (roomId: string) => {
        window.open(`/mock-trial/room/${roomId}`, '_blank');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-amber-600" size={40} />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">My Appointments</h1>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6">
                {USER_TABS.map((tab) => (
                    <button
                        key={tab.key}
                        className={`pb-4 px-6 font-medium transition-colors relative ${activeTab === tab.key ? 'text-amber-600' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label} ({appointments.filter(a => a.appointmentStatus === tab.key).length})
                        {activeTab === tab.key && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-600 rounded-t-full"></span>
                        )}
                    </button>
                ))}
            </div>

            {/* Appointments List */}
            <div className="grid gap-4">
                {filteredAppointments.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                        <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                        <h3 className="text-lg font-medium text-slate-900">No appointments found</h3>
                        <p className="text-slate-500">You don't have any {activeTab} appointments.</p>
                    </div>
                ) : (
                    filteredAppointments.map((apt) => (
                        <UserAppointmentCard
                            key={apt._id}
                            appointment={apt}
                            onCancel={openCancelModal}
                            onJoinCall={handleJoinCall}
                            canCancel={canCancelAppointment(apt)}
                            cancelling={cancelling && selectedAppointment?._id === apt._id}
                        />
                    ))
                )}
            </div>

            {/* Cancel Modal */}
            {selectedAppointment && (
                <CancelAppointmentModal
                    appointment={selectedAppointment}
                    isOpen={showCancelModal}
                    onClose={closeCancelModal}
                    onConfirm={handleConfirmCancel}
                    cancelling={cancelling}
                    personName={selectedAppointment.lawyerId.name}
                    role="user"
                />
            )}
        </div>
    );
};

export default UserAppointments;