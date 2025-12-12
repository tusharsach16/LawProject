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
const compressImage = (file: File, _maxSizeMB: number = 2): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate max dimensions (maintain aspect ratio)
        const maxDimension = 1500;
        if (width > height && width > maxDimension) {
          height = (height / width) * maxDimension;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width / height) * maxDimension;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob conversion failed'));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          'image/jpeg',
          0.85 // Quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export const uploadProfileImage = async (imageFile: File) => {
  try {
    // Compress image before upload
    const compressedFile = await compressImage(imageFile, 2);

    const formData = new FormData();
    formData.append('profileImage', compressedFile);

    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Uploading profile image...', {
      fileName: compressedFile.name,
      fileSize: compressedFile.size,
      fileType: compressedFile.type
    });

    const response = await axios.post(
      `${API}/api/upload/profile-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        timeout: 30000, // 30 second timeout
        onUploadProgress: (progressEvent) => {
          const percentCompleted = progressEvent.total 
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      }
    );

    console.log('Profile image uploaded successfully:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Profile image upload failed:', {
        status: error.response?.status,
        message: error.response?.data?.msg || error.message,
        data: error.response?.data
      });
      throw new Error(error.response?.data?.msg || 'Failed to upload profile image');
    }
    throw error;
  }
};

export const uploadBannerImage = async (imageFile: File) => {
  try {
    // Compress image before upload
    const compressedFile = await compressImage(imageFile, 3);

    const formData = new FormData();
    formData.append('bannerImage', compressedFile);

    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Uploading banner image...', {
      fileName: compressedFile.name,
      fileSize: compressedFile.size,
      fileType: compressedFile.type
    });

    const response = await axios.post(
      `${API}/api/upload/banner-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        timeout: 30000, // 30 second timeout
        onUploadProgress: (progressEvent) => {
          const percentCompleted = progressEvent.total 
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      }
    );

    console.log('Banner image uploaded successfully:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Banner image upload failed:', {
        status: error.response?.status,
        message: error.response?.data?.msg || error.message,
        data: error.response?.data
      });
      throw new Error(error.response?.data?.msg || 'Failed to upload banner image');
    }
    throw error;
  }
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
  const response = await api.post('/mock-trials/end', { trialId: trialId });
  return response.data;
};

export const leaveTrial = async (trialId: string) => {
  const response = await api.post('/mock-trials/leave', { trialId: trialId });
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
  try {
    console.log('Asking AI Assistant:', message);
    const response = await api.post('/chat', { message });
    console.log('AI Response received:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error in askAiAssistant:', error);
    throw error;
  }
};

export const getChatHistory = async () => {
  try {
    console.log('Fetching chat history...');
    const response = await api.get('/chat');
    console.log('Chat history received:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error in getChatHistory:', error);
    throw error;
  }
};

// ========== Quiz ==========
export const getQuizCount = async () => (await api.get('/quiz/count')).data;
export const getDetailedQuizResults = async () => (await api.get('/quiz/detailed-results')).data;
export const getQuizStatistics = async () => (await api.get('/quiz/statistics')).data;
export const getMockTrialStatistics = async () => (await api.get('/mock-trials/statistics')).data;
export const getRecentActivities = async (limit?: number) =>
  (await api.get('/quiz/recent-activities', { params: limit ? { limit } : {} })).data;

// 
export const getAllLawyers = async (params: { q?: string; sortBy?: string; order?: 'asc' | 'desc'; specialization?: string; }) => {
  const response = await api.get('/getLawyers', { params });
  return response.data;
};

export const getSpecializations = async () => {
  const response = await api.get('/lawyers/specializations');
  return response.data;
};
