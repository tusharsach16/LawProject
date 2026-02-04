import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CreditCard, ArrowRight } from 'lucide-react';

interface PendingPaymentAlertProps {
    count: number;
}

const PendingPaymentAlert: React.FC<PendingPaymentAlertProps> = ({ count }) => {
    if (count === 0) return null;

    return (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 text-red-600 rounded-full">
                    <AlertCircle size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-red-900">Pending Payment Action Required</h3>
                    <p className="text-red-700 text-sm">
                        You have {count} pending appointment payment{count !== 1 ? 's' : ''}. Please
                        complete payment to confirm your booking.
                    </p>
                </div>
            </div>
            <Link
                to="/dashboard/pending-payments"
                className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
                <CreditCard size={18} />
                Pay Now
                <ArrowRight size={18} />
            </Link>
        </div>
    );
};

export default PendingPaymentAlert;