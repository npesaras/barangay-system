import axios from 'axios';
import api from './axios';
import { showToast } from '../utils/toast';

const API_URL = 'http://localhost:5000';

/**
 * Resident Service
 * Handles all resident-related API calls and data management
 */
export const residentService = {
  /**
   * Get all residents
   * @returns {Promise<Array>} Array of resident objects
   */
  getAllResidents: async () => {
    try {
      const response = await api.get('/residents');
      return response.data;
    } catch (error) {
      console.error('Error fetching residents:', error);
      throw error;
    }
  },

  /**
   * Get resident by ID
   * @param {string} id - Resident ID
   * @returns {Promise<Object>} Resident data
   */
  getResident: async (id) => {
    try {
      const response = await api.get(`/residents/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching resident:', error);
      throw error;
    }
  },

  /**
   * Create new resident
   * @param {Object} formData - Resident information and image
   * @returns {Promise<Object>} Created resident data
   */
  createResident: async (residentData) => {
    try {
      // Create a FormData object for file upload
      const formData = new FormData();
      
      // Add all resident data to the FormData object
      Object.keys(residentData).forEach(key => {
        if (key === 'profileImage' && residentData[key]) {
          // Add the file directly
          formData.append('profileImage', residentData[key]);
        } else if (residentData[key] !== null && residentData[key] !== undefined) {
          // Add other data as string
          formData.append(key, residentData[key]);
        }
      });
      
      const response = await api.post('/residents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating resident:', error);
      throw error;
    }
  },

  /**
   * Update resident
   * @param {string} id - Resident ID
   * @param {Object} residentData - Updated resident data and image
   * @returns {Promise<Object>} Updated resident data
   */
  updateResident: async (id, residentData) => {
    try {
      console.log('Update resident data:', JSON.stringify(residentData, (key, value) => {
        // Don't log the file contents, just the fact that it exists
        if (key === 'profileImage' && value instanceof File) {
          return `File: ${value.name}, size: ${value.size}, type: ${value.type}`;
        }
        return value;
      }));

      // Create a FormData object for file upload
      const formData = new FormData();
      
      // Add all resident data to the FormData object
      Object.keys(residentData).forEach(key => {
        // Skip null or undefined values
        if (residentData[key] === null || residentData[key] === undefined) {
          return;
        }
        
        if (key === 'profileImage') {
          // Only append if it's a file object
          if (residentData[key] instanceof File) {
            console.log(`Appending image file: ${residentData[key].name}`);
            formData.append('profileImage', residentData[key]);
          } else if (typeof residentData[key] === 'string') {
            console.log('Profile image is a string, not appending to FormData');
            // If it's a string URL, we don't send it back to the server
          }
        } else {
          // Convert values to strings to ensure they're properly formatted
          formData.append(key, String(residentData[key]));
        }
      });

      // Debug FormData contents
      for (let pair of formData.entries()) {
        console.log(`FormData: ${pair[0]}: ${pair[1] instanceof File ? 'File object' : pair[1]}`);
      }
      
      // Use direct axios call with timeout increase
      const response = await axios.put(`${API_URL}/residents/${id}`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000, // Increase timeout for file uploads
        onUploadProgress: progressEvent => {
          console.log(`Upload progress: ${Math.round((progressEvent.loaded * 100) / progressEvent.total)}%`);
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating resident:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      throw error;
    }
  },

  /**
   * Delete resident
   * @param {string} id - Resident ID
   * @returns {Promise<void>}
   */
  deleteResident: async (id) => {
    try {
      const response = await api.delete(`/residents/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting resident:', error);
      throw error;
    }
  },

  getResidentStats: async () => {
    try {
      const response = await api.get('/residents/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching resident stats:', error);
      throw error;
    }
  },

  exportResidentsCSV: async () => {
    try {
      const response = await api.get('/residents/export/csv', {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Error exporting residents:', error);
      throw error;
    }
  }
}; 