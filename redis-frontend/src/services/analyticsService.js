import axios from 'axios';
import api from './axios';
import { showToast } from '../utils/toast';

const API_URL = 'http://localhost:5000';

// Create a cancellation token source for analytics requests
const createCancelTokenSource = () => {
  return axios.CancelToken.source();
};

/**
 * Analytics Service
 * Handles all analytics-related API calls and data processing
 */
export const analyticsService = {
  cancelTokenSource: null,
  
  /**
   * Get resident statistics
   * Fetches population, voter status, and precinct data
   * @returns {Promise<Object>} Analytics data including distributions
   */
  getStats: async () => {
    try {
      // Cancel previous request if it exists
      if (analyticsService.cancelTokenSource) {
        analyticsService.cancelTokenSource.cancel('New request initiated');
      }
      
      // Create new cancel token source
      analyticsService.cancelTokenSource = createCancelTokenSource();
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found for analytics request');
        return null;
      }
      
      const response = await axios.get(`${API_URL}/analytics/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cancelToken: analyticsService.cancelTokenSource?.token
      });
      
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request cancelled:', error.message);
        return null;
      }
      
      console.error('Error fetching analytics:', error);
      return null;
    }
  },

  getResidentStats: async () => {
    try {
      // Cancel previous request if it exists
      if (analyticsService.cancelTokenSource) {
        analyticsService.cancelTokenSource.cancel('New request initiated');
      }
      
      // Create new cancel token source
      analyticsService.cancelTokenSource = createCancelTokenSource();
      
      const response = await api.get('/analytics/residents', {
        cancelToken: analyticsService.cancelTokenSource?.token
      });
      
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        // Don't throw error for cancelled requests
        return null;
      }
      throw error; // Let other errors propagate
    }
  },

  cleanup: () => {
    if (analyticsService.cancelTokenSource) {
      analyticsService.cancelTokenSource.cancel('Component unmounting');
      analyticsService.cancelTokenSource = null;
    }
  }
}; 