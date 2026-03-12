import api from "./api";

export const getAllLawyers = async (params: { q?: string; sortBy?: string; order?: 'asc' | 'desc'; specialization?: string; }) => {
    const response = await api.get('/getLawyers', { params });
    return response.data.data;
};

export const getSpecializations = async () => {
    const response = await api.get('/lawyers/specializations');
    return response.data;
};
