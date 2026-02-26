import { useState, useEffect, useCallback } from 'react';
import {
    getLawyerAppointmentStats,
    getLawyerAppointments,
    getChatHistory,
    getQuizCount,
    getPastMockTrials,
    getRecentActivities,
    getQuizStatistics,
    getMockTrialStatistics,
} from '../services/authService';
import type { AppointmentStats } from '../types/appointment.types';

//Hook for fetching lawyer dashboard stats
export const useLawyerDashboardStats = () => {
    const [stats, setStats] = useState<AppointmentStats>({
        total: 0,
        scheduled: 0,
        completed: 0,
        cancelled: 0,
        revenue: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        try {
            const statsRes = await getLawyerAppointmentStats().catch(() => ({
                total: 0,
                scheduled: 0,
                completed: 0,
                cancelled: 0,
                revenue: 0,
            }));
            setStats(statsRes);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, refetch: fetchStats };
};

// Hook for fetching upcoming appointments
export const useUpcomingAppointments = (limit: number = 3) => {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = useCallback(async () => {
        try {
            const appointmentsRes = await getLawyerAppointments('scheduled').catch(() => ({
                appointments: [],
            }));
            const now = new Date();
            const futureAppointments = appointmentsRes.appointments.filter(
                (a: any) => new Date(a.appointmentTime) > now
            );
            setAppointments(futureAppointments.slice(0, limit));
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    return { appointments, loading, refetch: fetchAppointments };
};

// Hook for fetching activity counts
export const useActivityCounts = () => {
    const [chatCount, setChatCount] = useState<number>(0);
    const [quizCount, setQuizCount] = useState<number>(0);
    const [trialCount, setTrialCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    const fetchCounts = useCallback(async () => {
        try {
            const [chatRes, quizRes, trialsRes] = await Promise.all([
                getChatHistory().catch(() => []),
                getQuizCount().catch(() => ({ quizCount: 0 })),
                getPastMockTrials().catch(() => []),
            ]);

            const chats = Array.isArray(chatRes) ? chatRes : [];
            const userMessages = chats.filter((msg: any) => msg.sender === 'user');
            setChatCount(userMessages.length);

            setQuizCount(Number(quizRes?.quizCount || 0));

            const trials = Array.isArray(trialsRes) ? trialsRes : trialsRes?.trials || [];
            setTrialCount(trials.length);
        } catch (error) {
            console.error('Error fetching activity counts:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCounts();
    }, [fetchCounts]);

    return { chatCount, quizCount, trialCount, loading, refetch: fetchCounts };
};

// Hook for fetching activities and statistics
export const useActivitiesAndStats = () => {
    const [recentActivities, setRecentActivities] = useState<any[]>([]);
    const [quizStats, setQuizStats] = useState<any>(null);
    const [trialStats, setTrialStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [activitiesRes, quizStatsRes, trialStatsRes] = await Promise.all([
                getRecentActivities().catch(() => ({ activities: [] })),
                getQuizStatistics().catch(() => null),
                getMockTrialStatistics().catch(() => null),
            ]);

            const activities = Array.isArray(activitiesRes?.activities)
                ? activitiesRes.activities
                : [];
            setRecentActivities(activities);
            setQuizStats(quizStatsRes);
            setTrialStats(trialStatsRes);
        } catch (error) {
            console.error('Error fetching activities and stats:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { recentActivities, quizStats, trialStats, loading, refetch: fetchData };
};

// Main hook for lawyer dashboard - fetches all data
export const useLawyerDashboard = () => {
    const [initialLoad, setInitialLoad] = useState(true);

    const statsData = useLawyerDashboardStats();
    const appointmentsData = useUpcomingAppointments(3);
    const activityData = useActivityCounts();
    const activitiesStatsData = useActivitiesAndStats();

    useEffect(() => {
        // Short delay to show loading screen
        setTimeout(() => setInitialLoad(false), 300);
    }, []);

    const loading =
        initialLoad ||
        statsData.loading ||
        appointmentsData.loading ||
        activityData.loading ||
        activitiesStatsData.loading;

    return {
        initialLoad,
        loading,
        stats: statsData.stats,
        upcomingAppointments: appointmentsData.appointments,
        chatCount: activityData.chatCount,
        quizCount: activityData.quizCount,
        trialCount: activityData.trialCount,
        recentActivities: activitiesStatsData.recentActivities,
        quizStats: activitiesStatsData.quizStats,
        trialStats: activitiesStatsData.trialStats,
    };
};