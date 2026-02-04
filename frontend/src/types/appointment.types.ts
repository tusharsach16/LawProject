// User and Lawyer Information Types
export interface UserInfo {
    _id: string;
    name: string;
    email: string;
    profileImageUrl?: string;
}

export interface LawyerInfo {
    _id: string;
    name: string;
    profileImageUrl?: string;
    specialization?: string[];
}

export interface LawyerProfile {
    _id: string;
    name: string;
    profileImageUrl?: string;
    experience: number;
    specialization: string[];
    ratings: number;
    price: number;
}

// Appointment Types
export interface Appointment {
    _id: string;
    userId?: UserInfo;
    lawyerId: LawyerInfo;
    appointmentTime: string;
    duration: number;
    price: number;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    appointmentStatus: 'scheduled' | 'completed' | 'cancelled';
    callRoomId: string;
    createdAt: string;
    cancelledBy?: 'user' | 'lawyer';
    cancellationReason?: string;
}

export interface LawyerAppointment extends Appointment {
    userId: UserInfo;
    lawyerId: LawyerInfo; // Keep this for modal compatibility
}

export interface PendingAppointment {
    _id: string;
    appointmentTime: string;
    duration: number;
    price: number;
    razorpayOrderId: string;
    createdAt: string;
    lawyerId: {
        name: string;
        profileImageUrl?: string;
    };
}

// Stats Types
export interface AppointmentStats {
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
    revenue: number;
}

// Tab Types
export type AppointmentTab = 'all' | 'scheduled' | 'completed' | 'cancelled';
export type UserAppointmentTab = 'scheduled' | 'completed' | 'cancelled';

// Refund Information
export interface RefundInfo {
    isRefundable: boolean;
    message: string;
    type: 'success' | 'warning' | 'info';
}