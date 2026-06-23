import axios from 'axios';

// In production (Vercel), API is at the Render URL.
// In development, Vite proxies /api to localhost:5000.
// In production (Vercel), VITE_API_URL is the Render URL (e.g. https://api.onrender.com).
// We append /api because all backend routes are mounted under /api.
// In development, fall back to Vite's proxy at /api.
// Strip trailing slash if present, then append /api
const BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');
const API_BASE = BASE ? `${BASE}/api` : '/api';

const API = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
