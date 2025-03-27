/**
 * DataTable Component
 * 
 * A reusable table component that provides features like pagination, searching,
 * and action buttons for interacting with tabular data.
 * 
 * Features:
 * - Pagination with configurable entries per page
 * - Search functionality
 * - Action buttons (view, edit, delete)
 * - Loading state display
 * - Responsive design
 * - Support for both internal and external state management
 * 
 * @module components/DataTable
 */
import React, { useState, useEffect, useCallback } from 'react';
import { FaEdit, FaTrash, FaEye, FaSearch, FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import './DataTable.css';

/**
 * DataTable component for displaying and interacting with tabular data
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of data objects to display in the table
 * @param {Array} props.columns - Array of column configuration objects with header and accessor function
 * @param {string} [props.searchTerm] - External search term state (optional)
 * @param {Function} [props.setSearchTerm] - Function to update external search term state (optional)
 * @param {number} [props.entriesPerPage] - External entries per page state (optional) 
 * @param {Function} [props.setEntriesPerPage] - Function to update external entries per page state (optional)
 * @param {Function} [props.onEdit] - Callback function when edit button is clicked (optional)
 * @param {Function} [props.onDelete] - Callback function when delete button is clicked (optional)
 * @param {Function} [props.onView] - Callback function when view button is clicked (optional)
 * @param {boolean} [props.loading=false] - Whether the data is currently loading
 * @returns {JSX.Element} Rendered DataTable component
 */
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

  // Determine which state to use (external or internal)
  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;
  const setSearchTerm = setExternalSearchTerm || setInternalSearchTerm;
  const entriesPerPage = externalEntriesPerPage !== undefined ? externalEntriesPerPage : internalEntriesPerPage;
  const setEntriesPerPage = setExternalEntriesPerPage || setInternalEntriesPerPage;

  /**
   * Reset to first page when search term or entries per page changes
   * This ensures the user sees the first page of results after filtering
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, entriesPerPage]);

  // Filter data based on search term
  const filteredData = React.useMemo(() => {
    if (!searchTerm.trim()) return data;
    
    return data.filter(item => {
      // Search through all columns
      return columns.some(column => {
        const cellValue = column.accessor(item);
        return cellValue && 
          cellValue.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, columns, searchTerm]);

  // Calculate pagination values
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredData.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);

  /**
   * Handle page change in pagination
   * @param {number} pageNumber - The page number to navigate to
   */
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  /**
   * Handle change in the number of entries to display per page
   * @param {Object} e - Event object from the select input
   */
  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing entries per page
  };

  /**
   * Handle changes to the search input
   * @param {Object} e - Event object from the search input
   */
  const handleSearchChange = (e) => {
    // Update the search term immediately for UI feedback
    setSearchTerm(e.target.value);
    // Reset to first page when search term changes
    setCurrentPage(1);
  };

  // Use debounce technique for filtering (if needed in the future)
  // const debouncedSearch = useCallback(
  //   debounce((term) => {
  //     // Additional custom filtering logic could go here
  //     setCurrentPage(1);
  //   }, 300),
  //   []
  // );

  return (
    <div className="data-table">
      {/* Table control section with entries selector and search box */}
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
          <input
            type="text"
            placeholder="Search records..."
            aria-label="Search records"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      
      {/* Main table container */}
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
              // Display loading message when data is being fetched
              <tr>
                <td colSpan={columns.length + 1} className="loading-cell">
                  Loading...
                </td>
              </tr>
            ) : currentEntries.length === 0 ? (
              // Display message when no data is available
              <tr>
                <td colSpan={columns.length + 1} className="no-data-cell">
                  No data available
                </td>
              </tr>
            ) : (
              // Display data rows with action buttons
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
      
      {/* Table footer with pagination controls */}
      <div className="table-footer">
        <div className="entries-info">
          Showing {filteredData.length > 0 ? indexOfFirstEntry + 1 : 0} to {Math.min(indexOfLastEntry, filteredData.length)} of {filteredData.length} entries
          {searchTerm && filteredData.length !== data.length && ` (filtered from ${data.length} total entries)`}
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