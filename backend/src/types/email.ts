export interface UserEmailDTO {
    name: string;
    email: string;
}

export interface LawyerEmailDTO {
    name: string;
    email: string;
}

export type CancelledBy = 'user' | 'lawyer';

export interface AppointmentEmailDTO {
    _id: string;
    appointmentTime: string | Date;
    duration: number;
    price: number;
    callRoomId: string;
    cancelledBy?: CancelledBy;
    cancellationReason?: string;
}
