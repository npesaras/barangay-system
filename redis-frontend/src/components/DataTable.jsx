import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaEye, FaSearch, FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import './DataTable.css';

const DataTable = ({ 
  data = [], 
  columns = [],
  searchTerm: externalSearchTerm,
  setSearchTerm: setExternalSearchTerm,
  entriesPerPage: externalEntriesPerPage,
  setEntriesPerPage: setExternalEntriesPerPage,
  onEdit, 
  onDelete, 
  onView,
  loading = false
}) => {
  // Use external state if provided, otherwise use internal state
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [internalEntriesPerPage, setInternalEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Determine which state to use
  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;
  const setSearchTerm = setExternalSearchTerm || setInternalSearchTerm;
  const entriesPerPage = externalEntriesPerPage !== undefined ? externalEntriesPerPage : internalEntriesPerPage;
  const setEntriesPerPage = setExternalEntriesPerPage || setInternalEntriesPerPage;

  // Reset to first page when search term or entries per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, entriesPerPage]);

  // Calculate pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = data.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(data.length / entriesPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle entries per page change
  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Handle search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="data-table">
      <div className="table-controls">
        <div className="entries-selector">
          <label>
            Show 
            <select 
              value={entriesPerPage} 
              onChange={handleEntriesPerPageChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            entries
          </label>
        </div>
        
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            aria-label="Search data"
          />
        </div>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index}>{column.header}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="loading-cell">
                  Loading...
                </td>
              </tr>
            ) : currentEntries.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="no-data-cell">
                  No data available
                </td>
              </tr>
            ) : (
              currentEntries.map((item, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex}>
                      {column.accessor(item)}
                    </td>
                  ))}
                  <td>
                    <div className="action-buttons">
                      {onView && (
                        <button 
                          className="btn-action btn-view" 
                          onClick={() => onView(item)}
                          title="View"
                        >
                          <FaEye />
                        </button>
                      )}
                      {onEdit && (
                        <button 
                          className="btn-action btn-edit" 
                          onClick={() => onEdit(item)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          className="btn-action btn-delete" 
                          onClick={() => onDelete(item)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="table-footer">
        <div className="entries-info">
          Showing {data.length > 0 ? indexOfFirstEntry + 1 : 0} to {Math.min(indexOfLastEntry, data.length)} of {data.length} entries
          {searchTerm && ` (filtered from ${data.length} total entries)`}
        </div>
        
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            <FaAngleLeft />
          </button>
          
          <span className="page-info">
            Page {currentPage} of {totalPages || 1}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="pagination-button"
          >
            <FaAngleRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable; 