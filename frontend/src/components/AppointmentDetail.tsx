import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, AlertCircle, X, Loader2 } from 'lucide-react';

interface Appointment {
  _id: string;
  appointmentTime: string;
  duration: number;
  price: number;
  paymentStatus: string;
  appointmentStatus: string;
  userId?: {
    name: string;
    email: string;
    profileImageUrl?: string;
  };
  lawyerId?: {
    name: string;
    email: string;
    profileImageUrl?: string;
  };
}

interface AppointmentDetailProps {
  appointment: Appointment;
  userRole: 'user' | 'lawyer';
  onClose: () => void;
  onCancelled: () => void;
}

const AppointmentDetail: React.FC<AppointmentDetailProps> = ({
  appointment,
  userRole,
  onClose,
  onCancelled,
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState('');

  const appointmentDate = new Date(appointment.appointmentTime);
  const now = new Date();
  const hoursDifference = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const canCancel = appointment.appointmentStatus === 'scheduled' && hoursDifference > 0;
  const willGetRefund = hoursDifference >= 12;

  const formattedDate = appointmentDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = appointmentDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const handleCancelAppointment = async () => {
    setCancelling(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          appointmentId: appointment._id,
          reason,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          data.refund
            ? 'Appointment cancelled successfully! Refund will be processed within 5-7 business days.'
            : data.msg
        );
        onCancelled();
        onClose();
      } else {
        alert(data.msg || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const otherParty = userRole === 'user' ? appointment.lawyerId : appointment.userId;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-slate-900 mb-6">Appointment Details</h2>

        <div className="mb-6">
          <span
            className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${appointment.appointmentStatus === 'scheduled'
                ? 'bg-blue-100 text-blue-700'
                : appointment.appointmentStatus === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
          >
            {appointment.appointmentStatus.charAt(0).toUpperCase() +
              appointment.appointmentStatus.slice(1)}
          </span>
        </div>

        {otherParty && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg flex items-center gap-4">
            <img
              src={
                otherParty.profileImageUrl ||
                `https://placehold.co/64x64/e2e8f0/475569?text=${otherParty.name.charAt(0)}`
              }
              alt={otherParty.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h3 className="font-bold text-lg text-slate-900">
                {userRole === 'user' ? 'Adv. ' : ''}
                {otherParty.name}
              </h3>
              <p className="text-sm text-slate-600">{otherParty.email}</p>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 text-slate-700">
            <Calendar size={20} className="text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Date</p>
              <p className="font-semibold">{formattedDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-700">
            <Clock size={20} className="text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Time</p>
              <p className="font-semibold">
                {formattedTime} ({appointment.duration} minutes)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-700">
            <DollarSign size={20} className="text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Amount</p>
              <p className="font-semibold text-green-600">₹{appointment.price}</p>
            </div>
          </div>
        </div>

        {canCancel && userRole === 'user' && !willGetRefund && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-red-900 mb-1">No Refund Available</p>
              <p className="text-sm text-red-700">
                Cancellation is within 12 hours of the appointment. You will not receive a
                refund if you cancel now.
              </p>
            </div>
          </div>
        )}

        {canCancel && willGetRefund && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-green-900 mb-1">Full Refund Available</p>
              <p className="text-sm text-green-700">
                You can cancel this appointment and receive a full refund within 5-7
                business days.
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold"
            >
              Cancel Appointment
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Close
          </button>
        </div>

        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Confirm Cancellation
              </h3>

              {!willGetRefund && userRole === 'user' && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 font-semibold">
                    You will NOT receive a refund as you are cancelling within 12 hours
                    of the appointment.
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason for cancellation (optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Let us know why you're cancelling..."
                  rows={3}
                  className="w-full border-2 border-slate-200 rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancelAppointment}
                  disabled={cancelling}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold disabled:opacity-50"
                >
                  {cancelling ? (
                    <>
                      <Loader2 size={16} className="inline animate-spin mr-2" />
                      Cancelling...
                    </>
                  ) : (
                    'Confirm Cancellation'
                  )}
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  className="px-4 py-2 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Keep Appointment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentDetail;