import axios from 'axios';

const api = axios.create({
  // Normalize API base URL: guarantee '/api' suffix so endpoints match backend routes
  baseURL: (() => {
    const raw = (import.meta.env.VITE_API_URL || '/api').trim();
    if (raw === '/api' || raw.endsWith('/api')) return raw;
    return raw.replace(/\/+$/, '') + '/api';
  })(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wrg_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on protected endpoint, clear local storage
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('wrg_token');
        localStorage.removeItem('wrg_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
