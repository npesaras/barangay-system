/**
 * Resident Service Module
 * 
 * This module provides functions for managing resident data through the backend API.
 * It handles CRUD operations, data formatting, file uploads, and error handling.
 * 
 * Features:
 * - Resident data retrieval (individual and collection)
 * - Resident creation with profile image upload
 * - Resident data updates with profile image management
 * - Resident deletion
 * - CSV export for reporting
 * - Statistics retrieval
 * 
 * @module services/residentService
 */
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
   * Get all residents from the database
   * 
   * @async
   * @returns {Promise<Array>} Array of resident objects
   * @throws {Error} Error object with message if the request fails
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
   * Get a specific resident by ID
   * 
   * @async
   * @param {string} id - Resident unique identifier
   * @returns {Promise<Object>} Resident data object
   * @throws {Error} Error object with message if the request fails
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
   * Create a new resident with optional profile image
   * 
   * @async
   * @param {Object} residentData - Resident information including personal details and profile image
   * @param {string} residentData.firstName - Resident's first name
   * @param {string} residentData.lastName - Resident's last name
   * @param {string} [residentData.middleName] - Resident's middle name (optional)
   * @param {string} [residentData.gender] - Resident's gender (optional)
   * @param {string} [residentData.birthdate] - Resident's birthdate (optional)
   * @param {string} [residentData.civilStatus] - Resident's civil status (optional)
   * @param {string} [residentData.address] - Resident's address (optional)
   * @param {string} [residentData.votersStatus] - Resident's voter status (optional)
   * @param {string} [residentData.citizenship] - Resident's citizenship (optional)
   * @param {File} [residentData.profileImage] - Resident's profile image file (optional)
   * @returns {Promise<Object>} Created resident data with ID
   * @throws {Error} Error object with message if the request fails
   */
  createResident: async (residentData) => {
    try {
      // Create a FormData object for file upload
      const formData = new FormData();
      
      // Add all resident data to the FormData object
      Object.keys(residentData).forEach(key => {
        if (key === 'profileImage' && residentData[key]) {
          // Add the file directly to formData
          formData.append('profileImage', residentData[key]);
        } else if (residentData[key] !== null && residentData[key] !== undefined) {
          // Add other data as string
          formData.append(key, residentData[key]);
        }
      });
      
      // Send the request with proper headers for multipart form data
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
   * Update an existing resident with optional profile image
   * 
   * @async
   * @param {string} id - Resident unique identifier
   * @param {Object} residentData - Updated resident information and optional profile image
   * @param {string} [residentData.firstName] - Updated first name (if changing)
   * @param {string} [residentData.lastName] - Updated last name (if changing)
   * @param {string} [residentData.middleName] - Updated middle name (if changing)
   * @param {string|File} [residentData.profileImage] - New profile image file or existing image URL
   * @returns {Promise<Object>} Updated resident data
   * @throws {Error} Error object with message if the request fails
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
          // Only append if it's a file object (new image)
          if (residentData[key] instanceof File) {
            console.log(`Appending image file: ${residentData[key].name}`);
            formData.append('profileImage', residentData[key]);
          } else if (typeof residentData[key] === 'string') {
            console.log('Profile image is a string, not appending to FormData');
            // If it's a string URL, we don't send it back to the server
            // The server keeps the existing image
          }
        } else {
          // Convert values to strings to ensure they're properly formatted
          formData.append(key, String(residentData[key]));
        }
      });

      // Debug FormData contents for troubleshooting
      for (let pair of formData.entries()) {
        console.log(`FormData: ${pair[0]}: ${pair[1] instanceof File ? 'File object' : pair[1]}`);
      }
      
      // Use direct axios call with timeout increase for file uploads
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
   * Delete a resident by ID
   * 
   * @async
   * @param {string} id - Resident unique identifier
   * @returns {Promise<Object>} Confirmation message object
   * @throws {Error} Error object with message if the request fails
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

  /**
   * Get statistical information about residents
   * 
   * @async
   * @returns {Promise<Object>} Resident statistics including counts and demographics
   * @throws {Error} Error object with message if the request fails
   */
  getResidentStats: async () => {
    try {
      const response = await api.get('/residents/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching resident stats:', error);
      throw error;
    }
  },

  /**
   * Export residents data to CSV format
   * 
   * @async
   * @returns {Promise<Object>} Response containing blob data for CSV download
   * @throws {Error} Error object with message if the request fails
   */
  exportResidentsCSV: async () => {
    try {
      const response = await api.get('/residents/export/csv', {
        responseType: 'blob' // Important for handling file downloads
      });
      return response;
    } catch (error) {
      console.error('Error exporting residents:', error);
      throw error;
    }
  }
}; 