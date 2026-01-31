import axios from 'axios';
import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access - redirecting to login');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: () => api.post('/auth/login'),
  getProfile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout'),
};

// Notes API
export const notesAPI = {
  create: (noteData) => api.post('/notes', noteData),
  getAll: (page = 1, limit = 10) => api.get(`/notes?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/notes/${id}`),
  update: (id, noteData) => api.put(`/notes/${id}`, noteData),
  delete: (id) => api.delete(`/notes/${id}`),
};

// Wallet API
export const walletAPI = {
  getInfo: () => api.get('/wallet/info'),
  getBalance: () => api.get('/wallet/balance'),
  getTransactions: (page = 1, limit = 10) => api.get(`/wallet/transactions?page=${page}&limit=${limit}`),
  checkStatus: (txHash) => api.get(`/wallet/check-status/${txHash}`),
};

export default api;