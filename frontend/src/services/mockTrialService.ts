import api from "./api";

export const getMockTrialSituationsCat = async (categorySlug?: string) => {
    const params = categorySlug ? { slug: categorySlug } : {};
    const response = await api.get('/mock-trials/situationsCategory', { params });
    return response.data.situations;
};

export const joinMockTrial = async (situationId: string, side: 'plaintiff' | 'defendant') => {
    const response = await api.post('/mock-trials/join', { situationId, side });
    return response.data;
};

export const getMockTrialCategories = async () => {
    const response = await api.get('/mock-trials/categories');
    return response.data.categories;
};

export const getMockTrialDetails = async (trialId: string) => {
    const response = await api.get(`/mock-trials/${trialId}`);
    return response.data.trial;
};

export const endTrial = async (trialId: string) => {
    const response = await api.post('/mock-trials/end', { trialId });
    return response.data;
};

export const leaveTrial = async (trialId: string) => {
    const response = await api.post('/mock-trials/leave', { trialId });
    return response.data;
};

export const postMockMessage = async (trialId: string, text: string) => {
    const response = await api.post('/mock-trials/message', { trialId, text });
    return response.data;
};

export const checkMatchStatus = async (situationId: string, side: 'plaintiff' | 'defendant') => {
    const response = await api.get(`/mock-trials/check-match/${situationId}`, { params: { side } });
    return response.data;
};

export const getPastMockTrials = async () => {
    const { data } = await api.get('/mock-trials/past-trials');
    return data.trials;
};

export const analyzeTrial = async (trialId: string) => {
    const response = await api.post(`/mock-trials/${trialId}/analyse`);
    return response.data;
};

export const getMockTrialStatistics = async () => (await api.get('/mock-trials/statistics')).data;
