import api from "./api";

export interface UpdateProfileData {
    commonData?: { [key: string]: any };
    roleSpecificData?: { [key: string]: any };
}

export const updateUserProfile = async (data: UpdateProfileData) => {
    const response = await api.patch('/edit/profile', data);
    return response.data;
};

export const getUserProfile = async (username: string) => {
    // Using direct fetch via api instance which handles base URL and token
    const response = await api.get(`/apiFriend/profile/${username}`);
    return response.data;
};
