import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Loader2, AlertCircle } from 'lucide-react';
import { getAvailableSlots, createPaymentOrder, verifyPayment } from '../services/authService';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface AppointmentModalProps {
  lawyerId: string;
  lawyerName: string;
  pricePerMinute: number;
  onClose: () => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  lawyerId,
  lawyerName,
  pricePerMinute,
  onClose,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ time: string; duration: number } | null>(null);
  const [allSlots, setAllSlots] = useState<Array<{ time: string; status: 'available' | 'booked' | 'past'; duration: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    setError('');
    try {
      console.log('Fetching slots for lawyerId:', lawyerId, 'date:', selectedDate);
      const data = await getAvailableSlots(lawyerId, selectedDate);

      console.log('Received slots data:', data);

      setAllSlots(data.allSlots || []);

      if (data.slots && data.slots.length === 0 && data.allSlots && data.allSlots.length > 0) {
        setError('All slots are booked for this date. Please select another date.');
      } else if (data.slots && data.slots.length === 0) {
        setError('No slots available for this date. Please select another date.');
      }
    } catch (err: any) {
      console.error('Error fetching slots:', err);
      const errorMsg = err.response?.data?.msg || err.message || 'Failed to load available slots';
      setError(errorMsg);
    } finally {
      setLoadingSlots(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBooking = async (isRetry: boolean = false) => {
    if (!selectedDate || !selectedTimeSlot) {
      setError('Please select both date and time');
      return;
    }

    const { time, duration } = selectedTimeSlot;

    setLoading(true);
    setError('');

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      const appointmentTime = new Date(`${selectedDate}T${time}:00`);

      console.log('Booking Debug:', {
        selectedDate,
        time,
        constructedDate: appointmentTime,
        isoString: appointmentTime.toISOString(),
        localString: appointmentTime.toString()
      });

      const orderData = await createPaymentOrder({
        lawyerId,
        appointmentTime: appointmentTime,
        duration,
      });

      if (orderData.free) {
        alert('Appointment booked successfully! Check your email for details.');
        onClose();
        window.location.reload();
        return;
      }

      const { orderId, amount, currency, appointmentId } = orderData;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: 'NyaySetu',
        description: `Consultation with ${lawyerName}`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            const verifyResponse = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              appointmentId,
            });

            if (!verifyResponse.success) {
              throw new Error('Payment verification failed');
            }

            alert('Appointment booked successfully! Check your email for details.');
            onClose();
            window.location.reload();
          } catch (err) {
            console.error('Verification error:', err);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#f59e0b',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err: any) {
      console.error('Booking error:', err);

      // Handle conflict errors from transactions
      const responseData = err.response?.data;

      if (responseData?.conflict) {
        // Slot was just booked by someone else
        setError(responseData.msg || 'This slot was just booked. Please choose another time.');
        setSelectedTimeSlot(null); // Clear selection
        await fetchAvailableSlots(); // Refresh slots

        // Show user-friendly message
        alert('⚠️ ' + (responseData.msg || 'This slot was just booked by someone else. Please select another time slot.'));

      } else if (responseData?.retry && retryCount < 1 && !isRetry) {
        // Transient error - retry once automatically
        console.log('Transient transaction error, retrying...');
        setRetryCount(retryCount + 1);
        setTimeout(() => handleBooking(true), 500); // Retry after 500ms
        return;

      } else {
        setError(err.message || 'Booking failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Book Appointment
        </h2>
        <p className="text-sm text-slate-600 mb-1">
          Consultation with <span className="font-bold">{lawyerName}</span>
        </p>
        <p className="text-sm text-slate-600 mb-6">
          Fee: <span className="font-extrabold text-green-600">
            {selectedTimeSlot
              ? `₹${pricePerMinute * selectedTimeSlot.duration} for ${selectedTimeSlot.duration} mins`
              : `₹${pricePerMinute}/min`}
          </span>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
            <Calendar size={16} className="mr-2" />
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedTimeSlot(null);
              setError('');
              setRetryCount(0);
            }}
            min={minDate}
            max={maxDate}
            className="w-full border-2 border-slate-200 rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500 transition"
          />
        </div>

        {selectedDate && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
              <Clock size={16} className="mr-2" />
              Select Time Slot
            </label>

            {loadingSlots ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-amber-600" size={32} />
              </div>
            ) : allSlots.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                No slots available for this date
              </p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {allSlots.map((slot) => {
                    const isAvailable = slot.status === 'available';
                    const isBooked = slot.status === 'booked';
                    const isPast = slot.status === 'past';

                    return (
                      <button
                        key={slot.time}
                        onClick={() => {
                          if (isAvailable) {
                            setSelectedTimeSlot(slot);
                            setError('');
                            setRetryCount(0);
                          }
                        }}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all relative ${isAvailable
                          ? selectedTimeSlot?.time === slot.time
                            ? 'bg-amber-600 text-white shadow-md'
                            : 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer'
                          : isBooked
                            ? 'bg-red-100 text-red-600 cursor-not-allowed opacity-75'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                          }`}
                        title={
                          isBooked
                            ? 'This slot is already booked'
                            : isPast
                              ? 'This slot is in the past'
                              : 'Available for booking'
                        }
                      >
                        {slot.time}
                        {isBooked && (
                          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-full">●</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                    <span>Booked</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                    <span>Past</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h3 className="font-semibold text-slate-900 mb-2 text-sm">Cancellation Policy</h3>
          <ul className="text-xs text-slate-700 space-y-1">
            <li>Free cancellation until 12 hours before appointment</li>
            <li>No refund if cancelled within 12 hours</li>
            <li>Full refund if lawyer cancels</li>
          </ul>
        </div>

        <button
          onClick={() => handleBooking(false)}
          disabled={loading || !selectedDate || !selectedTimeSlot}
          className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin mr-2" />
              Processing...
            </>
          ) : (
            `Pay ₹${selectedTimeSlot ? pricePerMinute * selectedTimeSlot.duration : '...'} & Book`
          )}
        </button>

        <p className="text-xs text-slate-500 text-center mt-3">
          You will receive a confirmation email after successful payment
        </p>
      </div>
    </div>
  );
};

export default AppointmentModal;