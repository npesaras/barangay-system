import axios from 'axios';
import { showToast } from '../utils/toast';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000 // 10 second timeout
});

// Request interceptor to add authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData, let the browser set it automatically
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // If the response includes a success message, show it
    if (response.data?.message) {
      showToast.success(response.data.message);
    }
    return response;
  },
  (error) => {
    // Don't show toast or handle cancellation errors
    if (axios.isCancel(error)) {
      console.log('Request cancelled:', error.message);
      return Promise.reject(error);
    }

    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
      data: error.config?.data
    });

    // Handle unauthorized access
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      showToast.error('Session expired. Please login again.');
      return Promise.reject(error);
    }

    // Handle forbidden access
    if (error.response?.status === 403) {
      showToast.error('You do not have permission to perform this action');
      return Promise.reject(error);
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      showToast.error('Server error. Please try again later.');
      return Promise.reject(error);
    }

    // Handle network errors
    if (error.message === 'Network Error') {
      showToast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    // Handle other errors with specific messages from the server
    if (error.response?.data?.message) {
      showToast.error(error.response.data.message);
    } else {
      showToast.error('An error occurred. Please try again.');
    }

    return Promise.reject(error);
  }
);

export default api; 