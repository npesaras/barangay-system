import React, { useState, useEffect } from 'react';
import { showToast } from '../utils/toast';

const ResidentForm = ({ resident, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    votersStatus: '',
    // ... other fields ...
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (resident) {
      setFormData(resident);
      if (resident.profileImage) {
        setImagePreview(`http://localhost:5000/${resident.profileImage}`);
      }
    }
  }, [resident]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showToast.error('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        showToast.error('Only image files are allowed');
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append image if selected
      if (selectedFile) {
        formDataToSend.append('profileImage', selectedFile);
      }

      await onSubmit(formDataToSend);
      
      // Clear form
      setFormData({
        firstName: '',
        lastName: '',
        gender: '',
        votersStatus: '',
        // ... other fields ...
      });
      setImagePreview(null);
      setSelectedFile(null);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      showToast.error('Error submitting form');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="resident-form">
      <div className="form-group">
        <label>Profile Image</label>
        <div className="image-upload-container">
          <div className="image-preview">
            {imagePreview ? (
              <img src={imagePreview} alt="Profile preview" />
            ) : (
              <div className="upload-placeholder">
                <i className="fas fa-camera"></i>
                <span>Click to upload photo</span>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="image-input"
          />
        </div>
      </div>

      <div className="form-group">
        <label>First Name</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Last Name</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Gender</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>

      <div className="form-group">
        <label>Voter Status</label>
        <select
          name="votersStatus"
          value={formData.votersStatus}
          onChange={handleChange}
          required
        >
          <option value="">Select Voter Status</option>
          <option value="Registered">Registered</option>
          <option value="Not-Registered">Not-Registered</option>
        </select>
      </div>

      {/* Add other form fields as needed */}

      <div className="form-actions">
        <button type="submit" className="btn-submit">
          {resident ? 'Update' : 'Add'} Resident
        </button>
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ResidentForm; 