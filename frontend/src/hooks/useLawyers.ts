import { useState, useEffect, useCallback } from 'react';
import { getAllLawyers, getSpecializations, getPendingAppointments } from '../services/authService';
import type { LawyerProfile } from '../types/appointment.types';
import { DEBOUNCE_DELAY } from '../constants/appointment.constants';

// Hook for searching and filtering lawyers
export const useLawyerSearch = () => {
    const [lawyers, setLawyers] = useState<LawyerProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedTerm, setDebouncedTerm] = useState('');
    const [sortBy, setSortBy] = useState('ratings');
    const [filterSpec, setFilterSpec] = useState('');

    // Debounce search term
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedTerm(searchTerm);
        }, DEBOUNCE_DELAY);

        return () => {
            clearTimeout(timerId);
        };
    }, [searchTerm]);

    // Fetch lawyers with filters
    useEffect(() => {
        const fetchLawyers = async () => {
            try {
                setLoading(true);
                setError(null);

                const params: any = {
                    sortBy: sortBy || 'ratings',
                    order: 'desc',
                };

                if (debouncedTerm && debouncedTerm.trim()) {
                    params.q = debouncedTerm.trim();
                }

                if (filterSpec && filterSpec.trim()) {
                    params.specialization = filterSpec;
                }

                console.log('Fetching lawyers with params:', params);
                const data = await getAllLawyers(params);
                console.log('Received data:', data);

                if (Array.isArray(data)) {
                    const processedLawyers = data.map((lawyer) => ({
                        ...lawyer,
                        specialization: Array.isArray(lawyer.specialization)
                            ? lawyer.specialization
                            : lawyer.specialization
                                ? [lawyer.specialization]
                                : [],
                    }));
                    setLawyers(processedLawyers);
                    console.log(`Set ${processedLawyers.length} lawyers`);
                } else {
                    console.error('Data is not an array:', data);
                    setLawyers([]);
                }
            } catch (err: any) {
                console.error('Error fetching lawyers:', err);
                const errorMsg =
                    err.response?.data?.msg || err.message || 'Failed to load lawyers';
                setError(errorMsg);
                setLawyers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLawyers();
    }, [debouncedTerm, sortBy, filterSpec]);

    const clearFilters = () => {
        setSearchTerm('');
        setFilterSpec('');
    };

    return {
        lawyers,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        sortBy,
        setSortBy,
        filterSpec,
        setFilterSpec,
        clearFilters,
    };
};

// Hook for fetching specializations
export const useSpecializations = () => {
    const [specializations, setSpecializations] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSpecializations = async () => {
            try {
                const data = await getSpecializations();
                console.log('Received specializations:', data);

                if (Array.isArray(data)) {
                    setSpecializations(data);
                } else {
                    console.error('Specializations is not an array:', data);
                    setSpecializations([]);
                }
            } catch (err) {
                console.error('Failed to load specializations:', err);
                setSpecializations([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSpecializations();
    }, []);

    return { specializations, loading };
};

// Hook for checking pending payment count
export const usePendingPaymentCount = () => {
    const [pendingPaymentCount, setPendingPaymentCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const checkPendingPayments = useCallback(async () => {
        try {
            const data = await getPendingAppointments();
            if (data.appointments) {
                setPendingPaymentCount(data.appointments.length);
            }
        } catch (error) {
            console.error('Error checking pending payments:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkPendingPayments();
    }, [checkPendingPayments]);

    return { pendingPaymentCount, loading, refetch: checkPendingPayments };
};