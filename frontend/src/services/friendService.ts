import api from "./api";

export const getConnections = async () => {
    const response = await api.get('/apiFriend/getFriends');
    return response.data;
};

export const removeFriend = async (friendIdToRemove: string) => {
    const response = await api.post('/apiFriend/removeFriend', { friendIdToRemove });
    return response.data;
};

export const searchUsers = async (query: string) => {
    if (query.trim().length < 2) return [];
    const response = await api.get('/apiFriend/search', {
        params: { q: query }
    });
    return response.data;
};

export const sendFriendRequest = async (username: string) => {
    const response = await api.post('/apiFriend/sendfriendRequest', { username });
    return response.data;
};

export const getFriendRequests = async () => {
    const response = await api.get('/apiFriend/getRequest');
    return response.data;
};

export const respondToFriendRequest = async (requestId: string, action: 'accept' | 'reject') => {
    const response = await api.post('/apiFriend/respondRequest', { requestId, action });
    return response.data;
};
