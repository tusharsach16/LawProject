import { useState, useEffect, useCallback } from 'react';
import {
    getUserAppointments,
    getLawyerAppointments,
    getPendingAppointments,
    cancelAppointment as cancelAppointmentAPI,
} from '../services/authService';
import type { Appointment, PendingAppointment, AppointmentTab, UserAppointmentTab } from '../types/appointment.types';
import { AUTO_REFRESH_INTERVAL } from '../constants/appointment.constants';

// Hook for managing user appointments
export const useUserAppointments = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getUserAppointments();
            setAppointments(response.appointments || []);
        } catch (err: any) {
            console.error('Error fetching appointments:', err);
            setError(err.message || 'Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
        const interval = setInterval(fetchAppointments, AUTO_REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchAppointments]);

    return { appointments, loading, error, refetch: fetchAppointments };
};

// Hook for managing lawyer appointments
export const useLawyerAppointments = (status: AppointmentTab = 'all') => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getLawyerAppointments(status);
            setAppointments(response.appointments || []);
        } catch (err: any) {
            console.error('Error fetching appointments:', err);
            setError(err.message || 'Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    }, [status]);

    useEffect(() => {
        fetchAppointments();
        const interval = setInterval(fetchAppointments, AUTO_REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchAppointments]);

    return { appointments, loading, error, refetch: fetchAppointments };
};

// Hook for managing pending appointments
export const usePendingAppointments = () => {
    const [pendingAppointments, setPendingAppointments] = useState<PendingAppointment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingAppointments = useCallback(async () => {
        try {
            const data = await getPendingAppointments();
            setPendingAppointments(data.appointments || []);
        } catch (error) {
            console.error('Error fetching pending appointments:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingAppointments();
        const interval = setInterval(fetchPendingAppointments, AUTO_REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchPendingAppointments]);

    return { pendingAppointments, loading, refetch: fetchPendingAppointments };
};

// Hook for cancelling appointments
export const useCancelAppointment = () => {
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cancelAppointment = async (appointmentId: string, reason?: string) => {
        setCancelling(true);
        setError(null);

        try {
            const response = await cancelAppointmentAPI(appointmentId, reason);
            return response;
        } catch (err: any) {
            const errorMsg = err.response?.data?.msg || 'Failed to cancel appointment';
            setError(errorMsg);
            throw err;
        } finally {
            setCancelling(false);
        }
    };

    return { cancelAppointment, cancelling, error };
};

// Hook for filtering appointments by tab
export const useFilteredAppointments = (
    appointments: Appointment[],
    activeTab: UserAppointmentTab
) => {
    return appointments.filter(a => a.appointmentStatus === activeTab);
};

// Hook for debouncing search input
export const useDebounce = <T,>(value: T, delay: number = 500): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};