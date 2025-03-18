/**
 * Analytics Service Module
 * 
 * This module provides functions for fetching and managing analytics data from the backend API.
 * It handles API requests, request cancellation, error handling, and data processing for analytics.
 * 
 * Features:
 * - Resident statistics retrieval (gender distribution, voter status)
 * - Request cancellation to prevent race conditions
 * - Error handling with consistent responses
 * - Cleanup functionality for component unmounting
 * 
 * @module services/analyticsService
 */
import axios from 'axios';
import api from './axios';
import { showToast } from '../utils/toast';

const API_URL = 'http://localhost:5000';

/**
 * Creates a new cancellation token source for axios requests
 * This allows in-flight requests to be cancelled if they're no longer needed
 * 
 * @returns {CancelTokenSource} Axios cancel token source
 */
const createCancelTokenSource = () => {
  return axios.CancelToken.source();
};

/**
 * Analytics Service
 * Handles all analytics-related API calls and data processing
 */
export const analyticsService = {
  // Store the current cancel token source to manage request cancellation
  cancelTokenSource: null,
  
  /**
   * Get general statistics
   * Fetches population, voter status, and precinct data
   * 
   * @async
   * @returns {Promise<Object|null>} Analytics data including distributions or null on error/cancellation
   */
  getStats: async () => {
    try {
      // Cancel previous request if it exists to prevent race conditions
      if (analyticsService.cancelTokenSource) {
        analyticsService.cancelTokenSource.cancel('New request initiated');
      }
      
      // Create new cancel token source for this request
      analyticsService.cancelTokenSource = createCancelTokenSource();
      
      // Ensure authentication token is available
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found for analytics request');
        return null;
      }
      
      // Make the API request with authorization and cancellation token
      const response = await axios.get(`${API_URL}/analytics/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cancelToken: analyticsService.cancelTokenSource?.token
      });
      
      return response.data;
    } catch (error) {
      // Handle request cancellation differently from other errors
      if (axios.isCancel(error)) {
        console.log('Request cancelled:', error.message);
        return null;
      }
      
      console.error('Error fetching analytics:', error);
      return null;
    }
  },

  /**
   * Get resident-specific statistics
   * Fetches data about residents such as gender distribution and voter status
   * 
   * @async
   * @returns {Promise<Object|null>} Resident statistics or null on cancellation
   * @throws {Error} Throws error if the request fails for reasons other than cancellation
   */
  getResidentStats: async () => {
    try {
      // Cancel previous request if it exists to prevent race conditions
      if (analyticsService.cancelTokenSource) {
        analyticsService.cancelTokenSource.cancel('New request initiated');
      }
      
      // Create new cancel token source for this request
      analyticsService.cancelTokenSource = createCancelTokenSource();
      
      // Make the API request using the configured axios instance with cancellation token
      const response = await api.get('/analytics/residents', {
        cancelToken: analyticsService.cancelTokenSource?.token
      });
      
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        // Don't throw error for cancelled requests - this is expected behavior
        return null;
      }
      // Let other errors propagate to be handled by the calling component
      throw error; 
    }
  },

  /**
   * Cleanup function to cancel any pending requests
   * Should be called when components using this service unmount
   * Prevents memory leaks and unnecessary network traffic
   */
  cleanup: () => {
    if (analyticsService.cancelTokenSource) {
      analyticsService.cancelTokenSource.cancel('Component unmounting');
      analyticsService.cancelTokenSource = null;
    }
  }
}; 