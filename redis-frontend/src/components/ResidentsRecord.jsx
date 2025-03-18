import React, { useState, useEffect } from 'react';
import DataTable from './DataTable';
import AddResidentModal from './AddResidentModal';
import EditResidentModal from './EditResidentModal';
import { residentService } from '../services/residentService';
import { showToast } from '../utils/toast';
import { getImageUrl } from '../utils/imageUtils';
import { FaPlus, FaFileExport, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import './ResidentsRecord.css';

const API_URL = 'http://localhost:5000';

const ResidentsRecord = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      try {
        const data = await residentService.getAllResidents();
        setResidents(data || []);
      } catch (apiError) {
        console.error('Error fetching residents:', apiError);
        setError(`Failed to load residents data: ${apiError.message}`);
        setResidents([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleView = (resident) => {
    setSelectedResident(resident);
    setImageError(false);
    setShowViewModal(true);
  };

  const handleEdit = (resident) => {
    setSelectedResident(resident);
    setShowEditModal(true);
  };

  const handleUpdateResident = async (id, formData) => {
    try {
      showToast.info('Updating resident...', { autoClose: 10000 });
      
      await residentService.updateResident(id, formData);
      showToast.success('Resident updated successfully');
      setShowEditModal(false);
      
      setSelectedResident(null);
      
      fetchResidents();
    } catch (error) {
      console.error('Error updating resident:', error);
      
      let errorMessage = 'Failed to update resident';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        if (error.message.includes('Network Error')) {
          errorMessage = 'Network error. Please check your connection.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. The image may be too large.';
        } else {
          errorMessage = error.message;
        }
      }
      
      showToast.error(errorMessage);
    }
  };

  const handleDelete = async (resident) => {
    if (!window.confirm('Are you sure you want to delete this resident?')) {
      return;
    }
    
    try {
      await residentService.deleteResident(resident.id);
      showToast.success('Resident deleted successfully');
      fetchResidents();
    } catch (error) {
      console.error('Error deleting resident:', error);
      showToast.error('Failed to delete resident');
    }
  };

  const handleAddResident = async (formData) => {
    try {
      await residentService.createResident(formData);
      showToast.success('Resident added successfully');
      setShowAddModal(false);
      fetchResidents();
    } catch (error) {
      console.error('Error adding resident:', error);
      showToast.error('Failed to add resident');
    }
  };

  const exportToCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/residents/export/csv`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'residents.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast.success('CSV exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      showToast.error('Failed to export CSV');
    }
  };

  const columns = [
    {
      header: 'Fullname',
      accessor: (resident) => `${resident.firstName || ''} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName || ''}`,
    },
    {
      header: 'Citizenship',
      accessor: (resident) => resident.citizenship || 'N/A',
    },
    {
      header: 'Age',
      accessor: (resident) => resident.age || 'N/A',
    },
    {
      header: 'Civil Status',
      accessor: (resident) => resident.civilStatus || 'N/A',
    },
    {
      header: 'Gender',
      accessor: (resident) => resident.gender || 'N/A',
    },
    {
      header: 'Voter Status',
      accessor: (resident) => resident.votersStatus || 'N/A',
    }
  ];

  const filteredResidents = residents.filter(resident => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${resident.firstName || ''} ${resident.middleName || ''} ${resident.lastName || ''}`.toLowerCase();
    
    return fullName.includes(searchLower) ||
           (resident.citizenship && resident.citizenship.toLowerCase().includes(searchLower)) ||
           (resident.purok && resident.purok.toLowerCase().includes(searchLower)) ||
           (resident.votersStatus && resident.votersStatus.toLowerCase().includes(searchLower));
  });

  return (
    <div className="residents-record">
      <h2>Residents Record</h2>
      
      <div className="actions-bar">
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus /> Add Resident
        </button>
        <button 
          className="btn btn-secondary"
          onClick={exportToCSV}
          disabled={loading || residents.length === 0}
        >
          <FaFileExport /> Export CSV
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button 
            className="btn btn-primary retry-btn" 
            onClick={fetchResidents}
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-message">Loading residents data...</div>
      ) : residents.length === 0 && !error ? (
        <div className="no-data-message">
          No residents found. Add a new resident to get started.
        </div>
      ) : (
        <DataTable
          data={filteredResidents}
          columns={columns}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          entriesPerPage={entriesPerPage}
          setEntriesPerPage={setEntriesPerPage}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      )}

      {showViewModal && selectedResident && (
        <div className="modal">
          <div className="modal-content">
            <h2>Resident Details</h2>
            <div className="view-details">
              {selectedResident.profileImage && !imageError && (
                <div className="profile-image">
                  <img 
                    src={getImageUrl(selectedResident.profileImage)} 
                    alt="Profile" 
                    onError={() => setImageError(true)}
                  />
                </div>
              )}
              <div className="detail-row">
                <label>First Name:</label>
                <span>{selectedResident.firstName || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Middle Name:</label>
                <span>{selectedResident.middleName || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Last Name:</label>
                <span>{selectedResident.lastName || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Alias:</label>
                <span>{selectedResident.alias || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Birthplace:</label>
                <span>{selectedResident.birthplace || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Birthdate:</label>
                <span>{selectedResident.birthdate || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Age:</label>
                <span>{selectedResident.age || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Civil Status:</label>
                <span>{selectedResident.civilStatus || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Gender:</label>
                <span>{selectedResident.gender || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Purok:</label>
                <span>{selectedResident.purok || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Voters Status:</label>
                <span>{selectedResident.votersStatus || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Identified As:</label>
                <span>{selectedResident.identifiedAs || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Email:</label>
                <span>{selectedResident.email || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Contact Number:</label>
                <span>{selectedResident.contactNumber || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Occupation:</label>
                <span>{selectedResident.occupation || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Citizenship:</label>
                <span>{selectedResident.citizenship || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Address:</label>
                <span>{selectedResident.address || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Household No.:</label>
                <span>{selectedResident.householdNo || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Precinct No.:</label>
                <span>{selectedResident.precinctNo || 'N/A'}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <AddResidentModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddResident}
      />

      <EditResidentModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateResident}
        resident={selectedResident}
      />
    </div>
  );
};

export default ResidentsRecord; 