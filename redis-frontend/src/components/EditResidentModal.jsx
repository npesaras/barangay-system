import React, { useState, useEffect } from 'react';
import { FaCamera } from 'react-icons/fa';
import { getImageUrl } from '../utils/imageUtils';

const EditResidentModal = ({ show, onClose, onSubmit, resident }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    alias: '',
    birthplace: '',
    birthdate: '',
    age: '',
    civilStatus: '',
    gender: '',
    purok: '',
    votersStatus: '',
    email: '',
    contactNumber: '',
    occupation: '',
    citizenship: '',
    address: '',
    householdNo: '',
    precinctNo: '',
    profileImage: null,
    originalProfileImage: null
  });

  const [imagePreview, setImagePreview] = useState(null);

  // Initialize form data when resident prop changes
  useEffect(() => {
    if (resident) {
      // Keep original profileImage reference to handle cases where image isn't changed
      setFormData({
        ...resident,
        originalProfileImage: resident.profileImage,
        profileImage: null // Reset profile image to prevent sending the URL as file
      });
      
      // Set image preview if resident has a profile image
      if (resident.profileImage) {
        setImagePreview(getImageUrl(resident.profileImage));
      } else {
        setImagePreview(null);
      }
    }
  }, [resident]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-calculate age if birthdate is changed
    if (name === 'birthdate') {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      setFormData(prev => ({
        ...prev,
        age: age.toString()
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG or PNG)');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file is too large. Maximum size is 5MB.');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        profileImage: file,
        originalProfileImage: null // Clear original reference when new image is selected
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create a copy of form data for submission
    const submissionData = {...formData};
    
    // If no new image was selected, use the original image reference
    if (!submissionData.profileImage && submissionData.originalProfileImage) {
      submissionData.profileImage = submissionData.originalProfileImage;
    }
    
    // Delete originalProfileImage as it's not needed by the API
    delete submissionData.originalProfileImage;
    
    onSubmit(resident.id, submissionData);
  };

  if (!show) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Resident Information</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="profile-section">
              <div className="profile-image">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile Preview" />
                ) : (
                  <div className="image-placeholder">
                    <FaCamera />
                    <p>Click to upload photo</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                id="profileImage"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => document.getElementById('profileImage').click()}
              >
                Choose Photo
              </button>
            </div>

            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name*</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Enter first name"
                  />
                </div>
                <div className="form-group">
                  <label>Middle Name</label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    placeholder="Enter middle name"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name*</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Alias</label>
                  <input
                    type="text"
                    name="alias"
                    value={formData.alias}
                    onChange={handleChange}
                    placeholder="Enter alias"
                  />
                </div>
                <div className="form-group">
                  <label>Birthplace*</label>
                  <input
                    type="text"
                    name="birthplace"
                    value={formData.birthplace}
                    onChange={handleChange}
                    required
                    placeholder="Enter birthplace"
                  />
                </div>
                <div className="form-group">
                  <label>Birthdate*</label>
                  <input
                    type="date"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Age*</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    placeholder="Enter age"
                    readOnly="true"
                  />
                </div>
                <div className="form-group">
                  <label>Civil Status*</label>
                  <select
                    name="civilStatus"
                    value={formData.civilStatus}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Separated">Separated</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Gender*</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Purok*</label>
                  <select
                    name="purok"
                    value={formData.purok}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Purok</option>
                    <option value="Purok 1">Purok 1</option>
                    <option value="Purok 2">Purok 2</option>
                    <option value="Purok 3">Purok 3</option>
                    <option value="Purok 4">Purok 4</option>
                    <option value="Purok 5">Purok 5</option>
                    <option value="Purok 6">Purok 6</option>
                    <option value="Purok 7">Purok 7</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Household No.</label>
                  <input
                    type="text"
                    name="householdNo"
                    value={formData.householdNo}
                    onChange={handleChange}
                    placeholder="Enter household number"
                  />
                </div>
                <div className="form-group">
                  <label>Precinct No.</label>
                  <input
                    type="text"
                    name="precinctNo"
                    value={formData.precinctNo}
                    onChange={handleChange}
                    placeholder="Enter precinct number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Voters Status*</label>
                  <select
                    name="votersStatus"
                    value={formData.votersStatus}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Complete Address*</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows={2}
                    placeholder="Enter complete address"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Contact Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    pattern="[0-9]*"
                    placeholder="Enter contact number"
                  />
                </div>
                <div className="form-group">
                  <label>Occupation</label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    placeholder="Enter occupation"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Citizenship*</label>
                  <input
                    type="text"
                    name="citizenship"
                    value={formData.citizenship}
                    onChange={handleChange}
                    required
                    placeholder="Enter citizenship"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Update Resident
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 12px;
          width: 90%;
          max-width: 1000px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 2px solid #eee;
        }

        .modal-header h2 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.8rem;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          transition: color 0.3s;
        }

        .close-button:hover {
          color: #333;
        }

        .form-grid {
          display: grid;
          gap: 30px;
        }

        .profile-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }

        .profile-image {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f1f5f9;
          border: 2px solid #e2e8f0;
        }

        .profile-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          cursor: pointer;
        }

        .image-placeholder svg {
          font-size: 2rem;
          margin-bottom: 10px;
        }

        .image-placeholder p {
          font-size: 0.8rem;
          margin: 0;
        }

        .form-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .form-section h3 {
          margin: 0 0 20px;
          color: #2c3e50;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 15px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: span 3;
        }

        .form-group label {
          margin-bottom: 5px;
          font-weight: 500;
          color: #4a5568;
          font-size: 0.9rem;
        }

        input, select, textarea {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.95rem;
          transition: border-color 0.3s, box-shadow 0.3s;
        }

        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
        }

        textarea {
          resize: vertical;
          min-height: 80px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #eee;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary {
          background-color: #4299e1;
          color: white;
        }

        .btn-primary:hover {
          background-color: #3182ce;
        }

        .btn-secondary {
          background-color: #e2e8f0;
          color: #4a5568;
        }

        .btn-secondary:hover {
          background-color: #cbd5e0;
        }

        .btn-outline {
          background-color: transparent;
          border: 1px solid #cbd5e0;
          color: #4a5568;
        }

        .btn-outline:hover {
          border-color: #4299e1;
          color: #4299e1;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .form-group.full-width {
            grid-column: span 1;
          }

          .modal-content {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default EditResidentModal; 