import api from './axios';
import { showToast } from '../utils/toast';

/**
 * Authentication Service
 * Handles all authentication-related API calls and token management
 */
export const authService = {
  /**
   * User login
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.username - Username
   * @param {string} credentials.password - Password
   * @returns {Promise<Object>} Login response with token and user data
   */
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      console.log('Raw login response:', response);
      
      // Check if we have a valid response with token
      if (response && response.data && response.data.token) {
        // Store token in localStorage
        localStorage.setItem('token', response.data.token);
        if (response.data.user && response.data.user.role) {
          localStorage.setItem('userRole', response.data.user.role);
        }
        
        // Return the data directly, not the axios response object
        return response.data;
      } else {
        console.error('Invalid login response format:', response);
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Login error in service:', error);
      throw error;
    }
  },

  /**
   * Admin registration
   * @param {Object} userData - Admin registration data
   * @param {string} userData.username - Username
   * @param {string} userData.password - Password
   * @param {string} userData.adminCode - Admin registration code
   * @returns {Promise<Object>} Registration response
   */
  registerAdmin: async (userData) => {
    try {
      console.log('Sending registration data:', {
        username: userData.username,
        passwordLength: userData.password?.length,
        adminCodeProvided: !!userData.adminCode
      });

      const response = await api.post('/auth/register-admin', {
        username: userData.username,
        password: userData.password,
        adminCode: userData.adminCode
      });

      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      throw error;
    }
  },

  /**
   * User logout
   * Removes authentication tokens from localStorage
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
  },

  /**
   * Verify authentication token
   * @returns {Promise<Object|null>} User data if token is valid, null otherwise
   */
  verifyToken: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found in localStorage');
        return null;
      }
      
      console.log('Verifying token...');
      const response = await api.get('/auth/verify');
      console.log('Token verification response:', response);
      
      if (response && response.data) {
        const role = localStorage.getItem('userRole') || 'user';
        return { 
          ...response.data, 
          role,
          isAdmin: role === 'admin'
        };
      }
      
      console.log('Token verification failed or invalid response');
      return null;
    } catch (error) {
      console.error('Token verification error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      return null;
    }
  }
}; 