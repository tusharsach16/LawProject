import api from "./api";

export const getQuizCount = async () => (await api.get('/quiz/count')).data;
export const getDetailedQuizResults = async () => (await api.get('/quiz/detailed-results')).data;
export const getQuizStatistics = async () => (await api.get('/quiz/statistics')).data;
export const getRecentActivities = async (limit?: number) =>
    (await api.get('/quiz/recent-activities', { params: limit ? { limit } : {} })).data;
