import api from "./api";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

// ========== Auth ==========
interface SignupData {
  firstname: string;
  lastname?: string;
  email: string;
  username: string;
  password: string;
  role: string;
  phoneNumber: string;
}

interface SigninData {
  email: string;
  password: string;
}

export const signUp = async (data: SignupData) => {
  const response = await api.post('/signup', data);
  return response.data;
};

export const signin = async (data: SigninData) => {
  const response = await api.post('/login', data);
  return response.data;
};

// ========== Profile Update ==========
interface UpdateProfileData {
  commonData?: { [key: string]: any };
  roleSpecificData?: { [key: string]: any };
}

export const updateUserProfile = async (data: UpdateProfileData) => {
  const response = await api.patch('/edit/profile', data);
  return response.data;
};

// ========== Image Upload ==========
export const uploadProfileImage = async (imageFile: File) => {
  const formData = new FormData();
  formData.append('profileImage', imageFile);

  const token = localStorage.getItem('token');

  const response = await axios.post(
    `${API}/api/upload/profile-image`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const uploadBannerImage = async (imageFile: File) => {
  const formData = new FormData();
  formData.append('bannerImage', imageFile);

  const token = localStorage.getItem('token');

  const response = await axios.post(
    `${API}/api/upload/banner-image`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// ========== Friends & Connections ==========
export const getConnections = async () => {
  const token = localStorage.getItem('token');

  const response = await axios.get(
    `${API}/apiFriend/getFriends`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data;
};

export const getUserProfile = async (username: string) => {
  const token = localStorage.getItem('token');

  const response = await axios.get(
    `${API}/apiFriend/profile/${username}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data;
};

export const removeFriend = async (friendIdToRemove: string) => {
  const token = localStorage.getItem('token');

  const response = await axios.post(
    `${API}/apiFriend/removeFriend`,
    { friendIdToRemove },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data;
};

export const searchUsers = async (query: string) => {
  if (query.trim().length < 2) return [];

  const token = localStorage.getItem('token');

  const response = await axios.get(
    `${API}/apiFriend/search`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { q: query }
    }
  );

  return response.data;
};

export const sendFriendRequest = async (username: string) => {
  const token = localStorage.getItem('token');

  const response = await axios.post(
    `${API}/apiFriend/sendfriendRequest`,
    { username },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data;
};

export const getFriendRequests = async () => {
  const token = localStorage.getItem('token');

  const response = await axios.get(
    `${API}/apiFriend/getRequest`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data;
};

export const respondToFriendRequest = async (requestId: string, action: 'accept' | 'reject') => {
  const token = localStorage.getItem('token');

  const response = await axios.post(
    `${API}/apiFriend/respondRequest`,
    { requestId, action },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data;
};

// ========== Mock Trial ==========
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
  return response.data;
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

// ========== Chatbot ==========
export const askAiAssistant = async (message: string) => {
  const response = await api.post('/chat', { message });
  return response.data;
};

export const getChatHistory = async () => {
  const response = await api.get('/chat');
  return response.data;
};

// ========== Quiz ==========
export const getQuizCount = async () => (await api.get('/quiz/count')).data;
export const getDetailedQuizResults = async () => (await api.get('/quiz/detailed-results')).data;
export const getQuizStatistics = async () => (await api.get('/quiz/statistics')).data;
export const getMockTrialStatistics = async () => (await api.get('/mock-trials/statistics')).data;
export const getRecentActivities = async (limit?: number) =>
  (await api.get('/quiz/recent-activities', { params: limit ? { limit } : {} })).data;
