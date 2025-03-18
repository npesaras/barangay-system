/**
 * Toast Notification Utility
 * 
 * This module provides a consistent interface for displaying toast notifications
 * throughout the application. It wraps the react-toastify library and provides
 * fallback logging for environments where toast notifications are not available.
 * 
 * Features:
 * - Success, error, info, and warning notification types
 * - Graceful degradation to console logging if toasts are unavailable
 * - Consistent notification styling and behavior
 * 
 * @module utils/toast
 */
import { toast } from 'react-toastify';

/**
 * Toast notification utility object
 * Contains methods for different types of notifications
 */
export const showToast = {
  /**
   * Display a success toast notification
   * 
   * @param {string} message - The message to display
   * @returns {number|null} Toast ID if successful, otherwise null
   */
  success: (message) => {
    if (toast && typeof toast.success === 'function') {
      return toast.success(message);
    }
    console.log('Success:', message);
  },
  
  /**
   * Display an error toast notification
   * 
   * @param {string} message - The error message to display
   * @returns {number|null} Toast ID if successful, otherwise null
   */
  error: (message) => {
    if (toast && typeof toast.error === 'function') {
      return toast.error(message);
    }
    console.error('Error:', message);
  },
  
  /**
   * Display an informational toast notification
   * 
   * @param {string} message - The information message to display
   * @returns {number|null} Toast ID if successful, otherwise null
   */
  info: (message) => {
    if (toast && typeof toast.info === 'function') {
      return toast.info(message);
    }
    console.info('Info:', message);
  },
  
  /**
   * Display a warning toast notification
   * 
   * @param {string} message - The warning message to display
   * @returns {number|null} Toast ID if successful, otherwise null
   */
  warning: (message) => {
    if (toast && typeof toast.warning === 'function') {
      return toast.warning(message);
    }
    console.warn('Warning:', message);
  }
}; 