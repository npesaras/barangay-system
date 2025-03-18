import api from './axios';
import { showToast } from '../utils/toast';

/**
 * Student Service
 * Handles all student-related API calls and data management
 */
export const studentService = {
  /**
   * Get all students
   * @returns {Promise<Array>} Array of student objects
   */
  getAllStudents: async () => {
    try {
      const response = await api.get('/students');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching students:', error);
      const message = error.response?.data?.message || 'Failed to fetch students';
      showToast.error(message);
      throw error;
    }
  },

  /**
   * Get student by ID
   * @param {string} id - Student ID
   * @returns {Promise<Object>} Student data
   */
  getStudent: (id) => {
    return api.get(`/students/${id}`);
  },

  /**
   * Create new student
   * @param {Object} studentData - Student information
   * @returns {Promise<Object>} Created student data
   */
  createStudent: async (studentData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await api.post('/students', studentData);
      if (response.data && response.data.student) {
        showToast.success('Student added successfully');
        return response.data.student;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error creating student:', error);
      let message = 'Error creating student';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message === 'Authentication required') {
        message = 'Please login as admin to add students';
      }
      showToast.error(message);
      throw error;
    }
  },

  /**
   * Update student
   * @param {string} id - Student ID
   * @param {Object} data - Updated student data
   * @returns {Promise<Object>} Updated student data
   */
  updateStudent: (id, data) => {
    return api.put(`/students/${id}`, data);
  },

  /**
   * Delete student
   * @param {string} id - Student ID
   * @returns {Promise<Object>} Deletion response
   */
  deleteStudent: (id) => {
    return api.delete(`/students/${id}`);
  },

  /**
   * Delete all students
   * @returns {Promise<Object>} Deletion response
   */
  deleteAllStudents: () => {
    return api.delete('/students/all');
  }
}; 