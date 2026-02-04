import type { Appointment, RefundInfo } from '../types/appointment.types';
import { REFUND_HOURS_THRESHOLD, STATUS_BADGE_CLASSES } from '../constants/appointment.constants';

// Format date to localized string
export const formatDate = (dateString: string, locale: string = 'en-US'): string => {
    return new Date(dateString).toLocaleDateString(locale, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

// Format date to long format
export const formatDateLong = (dateString: string, locale: string = 'en-US'): string => {
    return new Date(dateString).toLocaleDateString(locale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
};

//Format time to localized string
export const formatTime = (dateString: string, locale: string = 'en-US'): string => {
    return new Date(dateString).toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

//Format milliseconds to mm:ss
export const formatTimeLeft = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

//Check if appointment can be cancelled
export const canCancelAppointment = (appointment: Appointment): boolean => {
    if (appointment.appointmentStatus !== 'scheduled') return false;

    const appointmentTime = new Date(appointment.appointmentTime);
    const now = new Date();

    return appointmentTime > now;
};

//Get status badge CSS classes
export const getStatusBadge = (status: string): string => {
    return STATUS_BADGE_CLASSES[status as keyof typeof STATUS_BADGE_CLASSES] || 'bg-gray-100 text-gray-700';
};

//Get refund information based on appointment details
export const getRefundInfo = (appointment: Appointment): RefundInfo => {
    const appointmentTime = new Date(appointment.appointmentTime).getTime();
    const now = Date.now();
    const hoursDiff = (appointmentTime - now) / (1000 * 60 * 60);

    if (appointment.paymentStatus === 'pending') {
        return {
            isRefundable: false,
            message: 'This appointment is not paid for yet. Cancelling will simply remove it.',
            type: 'info',
        };
    }

    if (hoursDiff > REFUND_HOURS_THRESHOLD) {
        return {
            isRefundable: true,
            message: 'Full refund will be processed within 5-7 business days.',
            type: 'success',
        };
    }

    return {
        isRefundable: false,
        message: `No refund available. Appointment is less than ${REFUND_HOURS_THRESHOLD} hours away.`,
        type: 'warning',
    };
};

//Generate placeholder avatar URL
export const getPlaceholderAvatar = (name: string, size: number = 64): string => {
    const initial = name.charAt(0).toUpperCase();
    return `https://placehold.co/${size}x${size}/e2e8f0/475569?text=${initial}`;
};

//Check if date is in the past
export const isPastDate = (dateString: string): boolean => {
    return new Date(dateString) < new Date();
};