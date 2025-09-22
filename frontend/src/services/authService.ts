import api from "./api";
import axios from "axios"; // File upload ke liye alag se axios ka use karenge

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
export const signUp = async(data: SignupData) => {
  const response = await api.post('/signup', data);
  return response.data;
}

export const signin = async(data: SigninData) => {
  const response = await api.post('/login', data);
  return response.data;
}


interface UpdateProfileData {
  commonData?: { [key: string]: any };
  roleSpecificData?: { [key: string]: any };
}

/**
 * Updates the current user's profile with text data.
 * @param data - An object containing commonData and/or roleSpecificData.
 */
export const updateUserProfile = async (data: UpdateProfileData) => {
  try {
    console.log('API call to update profile with data:', data);
    const response = await api.patch('/edit/profile', data); 
    console.log('API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('API error details:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

/**
 * Sirf profile image ko upload karta hai.
 * @param imageFile - User select krega image file.
 */
export const uploadProfileImage = async (imageFile: File) => {
  const formData = new FormData();
  formData.append('profileImage', imageFile);

  const token = localStorage.getItem('token');
  const response = await axios.post(
    'http://localhost:5000/api/upload/profile-image', 
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data; // Yeh { msg, imageUrl } wapas dega
};


export const uploadBannerImage = async (imageFile: File) => {
  const formData = new FormData();
  // Field ka naam 'bannerImage' backend route se match hona chahiye
  formData.append('bannerImage', imageFile);

  const token = localStorage.getItem('token');
  const response = await axios.post(
    'http://localhost:5000/api/upload/banner-image', // Naya URL
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data; // Yeh { msg, imageUrl } wapas dega
};


export const getConnections = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(
    'http://localhost:5000/apiFriend/getFriends', 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  ); 
  return response.data;
};

export const getUserProfile = async (username: string) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(
    `http://localhost:5000/apiFriend/profile/${username}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const removeFriend = async (friendIdToRemove: string) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    'http://localhost:5000/apiFriend/removeFriend', 
    { friendIdToRemove },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  ); 
  return response.data;
};

export const searchUsers = async (query: string) => {
  // Choti query ke liye API call nhi kia taaki server par faltu load na pade
  if (query.trim().length < 2) {
    return []; 
  }
  
  const token = localStorage.getItem('token');
  const response = await axios.get(
    'http://localhost:5000/apiFriend/search', 
    {
      headers: {
        Authorization: `Bearer ${token}`, 
      },
      params: { q: query } // Search query ko params mein bhejein
    }
  );

  return response.data; // Yeh users ka array wapas dega
};

export const sendFriendRequest = async (username: string) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    'http://localhost:5000/apiFriend/sendfriendRequest',
    { username }, // Request body mein username bhej rha hu
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data; 
};

export const getFriendRequests = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(
    'http://localhost:5000/apiFriend/getRequest', 
    { 
      headers: { 
        Authorization: `Bearer ${token}` 
      } 
    }
  );
  return response.data; // Yeh requests ka array wapas dega
};


export const respondToFriendRequest = async (requestId: string, action: 'accept' | 'reject') => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    'http://localhost:5000/apiFriend/respondRequest',
    { requestId, action }, // Request body mein data bhejein
    { 
      headers: { 
        Authorization: `Bearer ${token}` 
      } 
    }
  );
  return response.data;
};


export const getAllLawyers = async (params: { q?: string; sortBy?: string; order?: 'asc' | 'desc'; specialization?: string; }) => {
  const response = await api.get('/getLawyers', { params }); 
  return response.data;
};

export const getSpecializations = async () => {
  const response = await api.get('/lawyers/specializations'); 
  return response.data;
};