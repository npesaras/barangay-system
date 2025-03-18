import { toast } from 'react-toastify';

export const showToast = {
  success: (message) => {
    if (toast && typeof toast.success === 'function') {
      return toast.success(message);
    }
    console.log('Success:', message);
  },
  
  error: (message) => {
    if (toast && typeof toast.error === 'function') {
      return toast.error(message);
    }
    console.error('Error:', message);
  },
  
  info: (message) => {
    if (toast && typeof toast.info === 'function') {
      return toast.info(message);
    }
    console.info('Info:', message);
  },
  
  warning: (message) => {
    if (toast && typeof toast.warning === 'function') {
      return toast.warning(message);
    }
    console.warn('Warning:', message);
  }
}; 