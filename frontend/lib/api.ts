import axios from 'axios';
import { getApiUrl } from './api-config';

// Get API URL dynamically (handles zrok/ngrok tunnels)
// For server-side, use env var; for client-side, use dynamic detection
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    return getApiUrl();
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('world_id_verified');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;

