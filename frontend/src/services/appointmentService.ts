import api from "./api";

export const getLawyerAppointments = async (status: string = 'all') => {
    const response = await api.get('/appointments/lawyer/appointments', {
        params: { status }
    });
    return response.data;
};

export const getLawyerAppointmentStats = async () => {
    const response = await api.get('/appointments/lawyer/stats');
    return response.data;
};

export const getUserAppointments = async (status: string = 'all') => {
    const response = await api.get('/appointments/user/appointments', {
        params: { status }
    });
    return response.data;
};

export const setLawyerAvailability = async (data: {
    date?: string;
    dayOfWeek?: number;
    slots: { startTime: string; endTime: string; }[];
}) => {
    const response = await api.post('/appointments/lawyer/availability', data);
    return response.data;
};

export const getLawyerAvailability = async () => {
    const response = await api.get('/appointments/lawyer/availability');
    return response.data;
};

export const getAvailableSlots = async (lawyerId: string, date: string) => {
    const response = await api.get('/appointments/available-slots', {
        params: { lawyerId, date }
    });
    return response.data;
};

export const cancelAppointment = async (appointmentId: string, reason?: string) => {
    const response = await api.post('/appointments/cancel', {
        appointmentId,
        reason
    });
    return response.data;
};

export const getPendingAppointments = async () => {
    const response = await api.get('/appointments/pending');
    return response.data;
};
