/**
 * BudgetIQ – Axios API Instance
 * Centralized HTTP client with JWT token interceptor
 * Uses VITE_API_URL env variable for production deployment
 */
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000, // 15 second timeout
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('budgetiq_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('budgetiq_token');
      localStorage.removeItem('budgetiq_user');
      window.location.href = '/login';
    }
    // Log network errors for debugging
    if (!error.response) {
      console.error('Network error - backend may be unavailable:', error.message);
    }
    return Promise.reject(error);
  }
);

export const UPLOADS_URL = `${API_BASE}/uploads`;
export default api;
