import React, { useState, useEffect } from 'react';
import DataTable from './DataTable';
import { residentService } from '../services/residentService';
import { showToast } from '../utils/toast';

const ResidentsData = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      setLoading(true);
      const data = await residentService.getAllResidents();
      console.log('Fetched residents data:', data);
      setResidents(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching residents:', error);
      setLoading(false);
    }
  };

  const handleView = (resident) => {
    setSelectedResident(resident);
    setShowViewModal(true);
  };

  const handleEdit = (resident) => {
    // Implement edit functionality
    console.log('Edit resident:', resident);
  };

  const handleDelete = async (resident) => {
    try {
      await residentService.deleteResident(resident.id);
      fetchResidents();
    } catch (error) {
      console.error('Error deleting resident:', error);
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      render: (resident) => `${resident.firstName || ''} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName || ''}`,
    },
    {
      header: 'Age',
      accessor: 'age',
    },
    {
      header: 'Gender',
      accessor: 'gender',
    },
    {
      header: 'Civil Status',
      accessor: 'civilStatus',
    },
    {
      header: 'Purok',
      accessor: 'purok',
    },
    {
      header: 'Voters Status',
      accessor: 'votersStatus',
    },
    {
      header: 'Contact Number',
      accessor: 'contactNumber',
    }
  ];

  return (
    <div className="residents-data">
      <DataTable
        data={residents}
        columns={columns}
        title="Residents Data"
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      {showViewModal && selectedResident && (
        <div className="modal">
          <div className="modal-content">
            <h2>Resident Details</h2>
            <div className="view-details">
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
    </div>
  );
};

export default ResidentsData; 