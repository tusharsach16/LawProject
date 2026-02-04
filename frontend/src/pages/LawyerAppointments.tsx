import React, { useState, useEffect } from 'react';
import { Calendar, Search, Loader2 } from 'lucide-react';
import { useLawyerAppointments, useCancelAppointment } from '../hooks/useAppointments';
import type { LawyerAppointment, AppointmentTab } from '../types/appointment.types';
import { TABS } from '../constants/appointment.constants';
import { canCancelAppointment } from '../utils/appointment.utils';
import LawyerAppointmentCard from '../components/appointments/LawyerAppointmentCard';
import CancelAppointmentModal from '../components/appointments/CancelAppointmentModal';

const LawyerAppointments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppointmentTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAppointments, setFilteredAppointments] = useState<LawyerAppointment[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<LawyerAppointment | null>(null);

  const { appointments, loading, refetch } = useLawyerAppointments(activeTab);
  const { cancelAppointment, cancelling } = useCancelAppointment();

  // Filter appointments by search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAppointments(appointments as LawyerAppointment[]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = (appointments as LawyerAppointment[]).filter((apt) =>
      apt.userId.name.toLowerCase().includes(query) ||
      apt.userId.email.toLowerCase().includes(query)
    );
    setFilteredAppointments(filtered);
  }, [appointments, searchQuery]);

  const openCancelModal = (appointment: LawyerAppointment) => {
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
        reason || 'Cancelled by lawyer'
      );

      if (response.success) {
        alert('Appointment cancelled successfully! User will be refunded within 5-7 business days.');
        await refetch();
        closeCancelModal();
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.msg || 'Failed to cancel appointment';
      alert(`${errorMsg}`);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Appointments</h1>
        <p className="text-slate-600">Manage your client consultations</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="flex overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${activeTab === tab.key
                  ? 'text-amber-600 border-b-2 border-amber-600'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by client name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-amber-600" size={40} />
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600 text-lg">No appointments found</p>
          {searchQuery && (
            <p className="text-slate-500 text-sm mt-2">Try adjusting your search</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAppointments.map((appointment) => (
            <LawyerAppointmentCard
              key={appointment._id}
              appointment={appointment}
              onCancelClick={() => openCancelModal(appointment)}
              canCancel={canCancelAppointment(appointment)}
            />
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      {selectedAppointment && (
        <CancelAppointmentModal
          appointment={selectedAppointment}
          isOpen={showCancelModal}
          onClose={closeCancelModal}
          onConfirm={handleConfirmCancel}
          cancelling={cancelling}
          personName={selectedAppointment.userId.name}
          role="lawyer"
        />
      )}
    </div>
  );
};

export default LawyerAppointments;