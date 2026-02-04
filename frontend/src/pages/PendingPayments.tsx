import React from 'react';
import { AlertCircle } from 'lucide-react';
import { usePendingAppointments } from '../hooks/useAppointments';
import type { PendingAppointment } from '../types/appointment.types';
import { verifyPayment, cancelAppointment } from '../services/authService';
import PendingAppointmentCard from '../components/appointments/PendingAppointmentCard';

declare global {
    interface Window {
        Razorpay: any;
    }
}

const PendingPayments: React.FC = () => {
    const { pendingAppointments, loading, refetch } = usePendingAppointments();

    const handleCompletePayment = async (appointment: PendingAppointment) => {
        try {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);

            script.onload = () => {
                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                    amount: appointment.price * 100,
                    currency: 'INR',
                    name: 'NyaySetu',
                    description: `Consultation with ${appointment.lawyerId.name}`,
                    order_id: appointment.razorpayOrderId,
                    handler: async function (response: any) {
                        try {
                            const verifyResponse = await verifyPayment({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                appointmentId: appointment._id,
                            });

                            if (verifyResponse.success) {
                                alert('Payment completed successfully!');
                                refetch();
                            }
                        } catch (err) {
                            console.error('Verification error:', err);
                            alert('Payment verification failed. Please contact support.');
                        }
                    },
                    theme: {
                        color: '#f59e0b',
                    },
                };

                const razorpay = new window.Razorpay(options);
                razorpay.open();
            };
        } catch (error) {
            console.error('Error completing payment:', error);
            alert('Failed to open payment gateway. Please try again.');
        }
    };

    const handleCancelPending = async (appointmentId: string) => {
        if (!confirm('Are you sure you want to cancel this pending appointment?')) {
            return;
        }

        try {
            await cancelAppointment(appointmentId, 'Cancelled by user - pending payment');
            refetch();
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            alert('Failed to cancel appointment');
        }
    };

    if (loading) {
        return null;
    }

    if (pendingAppointments.length === 0) {
        return null;
    }

    return (
        <div className="mb-8 bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="text-amber-600" size={24} />
                <h2 className="text-xl font-bold text-amber-900">Pending Payments</h2>
            </div>

            <div className="space-y-4">
                {pendingAppointments.map((appointment) => (
                    <PendingAppointmentCard
                        key={appointment._id}
                        appointment={appointment}
                        onComplete={() => handleCompletePayment(appointment)}
                        onCancel={() => handleCancelPending(appointment._id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default PendingPayments;