import axios from "axios";

const API = import.meta.env.VITE_API_URL; 

const api = axios.create({
  baseURL: `${API}/api`,   
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,   
});

// ✅ Attach Token Automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
