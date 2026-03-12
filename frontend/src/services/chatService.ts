import api from "./api";

export const askAiAssistant = async (message: string, language: string = 'English') => {
    const response = await api.post('/chat', { message, language });
    return response.data;
};

export const getChatHistory = async () => {
    const response = await api.get('/chat');
    return response.data;
};
