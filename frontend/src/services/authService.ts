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
  // Iska path relative hona chahiye kyunki 'api' instance mein baseURL pehle se hai
  const response = await api.patch('/edit/profile', data); 
  return response.data;
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
