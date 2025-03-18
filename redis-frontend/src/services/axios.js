/**
 * Axios Configuration Module
 * 
 * This module configures a centralized Axios instance for making HTTP requests to the backend API.
 * It includes request and response interceptors for handling authentication, error management,
 * and toast notifications.
 * 
 * Features:
 * - Base URL and timeout configuration
 * - Automatic JWT token inclusion in request headers
 * - Proper Content-Type handling for different request types
 * - Comprehensive error handling with user-friendly messages
 * - Session expiration detection and handling
 * - Automatic success message display
 * 
 * @module services/axios
 */
import axios from 'axios';
import { showToast } from '../utils/toast';

/**
 * Create axios instance with base configuration
 * Sets default values for all requests made through this instance
 */
const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000 // 10 second timeout
});

/**
 * Request interceptor
 * This interceptor runs before each request is sent
 * 
 * It handles:
 * 1. Adding the authentication token from localStorage
 * 2. Setting appropriate Content-Type headers based on request data
 */
api.interceptors.request.use(
  (config) => {
    // Add JWT token to request headers if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData, let the browser set it automatically
    // This is important for file uploads to work correctly with multipart/form-data
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

/**
 * Response interceptor
 * This interceptor runs after each response is received
 * 
 * It handles:
 * 1. Displaying success messages
 * 2. Processing errors based on status code
 * 3. Handling authentication issues
 * 4. Providing user-friendly error notifications
 */
api.interceptors.response.use(
  (response) => {
    // If the response includes a success message, show it as a toast notification
    if (response.data?.message) {
      showToast.success(response.data.message);
    }
    return response;
  },
  (error) => {
    // Don't show toast or handle cancellation errors
    // Request cancellations are not actual errors and should be handled silently
    if (axios.isCancel(error)) {
      console.log('Request cancelled:', error.message);
      return Promise.reject(error);
    }

    // Log detailed error information for debugging
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
      data: error.config?.data
    });

    // Handle unauthorized access (401)
    // This typically means the token is invalid or expired
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      showToast.error('Session expired. Please login again.');
      return Promise.reject(error);
    }

    // Handle forbidden access (403)
    // This typically means the user doesn't have the required permissions
    if (error.response?.status === 403) {
      showToast.error('You do not have permission to perform this action');
      return Promise.reject(error);
    }

    // Handle server errors (500+)
    // These are internal server errors, not related to the user's request
    if (error.response?.status >= 500) {
      showToast.error('Server error. Please try again later.');
      return Promise.reject(error);
    }

    // Handle network errors
    // These occur when the API request couldn't be completed due to network issues
    if (error.message === 'Network Error') {
      showToast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    // Handle other errors with specific messages from the server
    // Use the server's error message if available, or a generic message as fallback
    if (error.response?.data?.message) {
      showToast.error(error.response.data.message);
    } else {
      showToast.error('An error occurred. Please try again.');
    }

    return Promise.reject(error);
  }
);

export default api; 