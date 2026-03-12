import api from "./api";

export const createPaymentSession = async (data: {
    lawyerId: string;
    appointmentTime: Date;
    price: number;
    duration: number;
}) => {
    const response = await api.post('/appointments/create-session', data);
    return response.data;
};

export const createPaymentOrder = async (data: {
    lawyerId: string;
    appointmentTime: Date;
    duration: number;
}) => {
    const response = await api.post('/appointments/create-order', data);
    return response.data;
};

export const verifyPayment = async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    appointmentId: string;
}) => {
    const response = await api.post('/appointments/verify-payment', data);
    return response.data;
};
