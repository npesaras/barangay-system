/**
 * Sidebar Component
 * 
 * A navigation sidebar component that provides links to different sections
 * of the application and handles user logout functionality.
 * 
 * Features:
 * - Navigation links to Dashboard and Data sections
 * - Expandable/collapsible submenu for Data section
 * - Active state highlighting based on current route
 * - Logout functionality with toast notifications
 * - Responsive design
 * 
 * @module components/Sidebar
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaChartBar, FaDatabase, FaAngleRight, FaAngleDown, FaSignOutAlt } from 'react-icons/fa';
import { logoutUser } from '../App';
import { showToast } from '../utils/toast';

/**
 * Sidebar navigation component for the Barangay Management System
 * 
 * @returns {JSX.Element} Rendered Sidebar component
 */
const Sidebar = () => {
  // State to track if the Data submenu is expanded
  const [dataExpanded, setDataExpanded] = useState(false);
  
  // Hooks for navigation and location tracking
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Auto-expand the Data menu when navigating to the residents page
   * This ensures the submenu is visible when the user is on a related page
   */
  useEffect(() => {
    if (location.pathname === '/residents') {
      setDataExpanded(true);
    }
  }, [location.pathname]);

  /**
   * Handles user logout with error handling and toast notifications
   * Calls the logoutUser function and navigates to the login page
   */
  const handleLogout = () => {
    try {
      // First call the logout function directly
      logoutUser(navigate);
      
      // Then show toast (this won't block the navigation)
      showToast.success('Logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      showToast.error('Error logging out');
      // Force navigation if there's an error
      window.location.href = '/login';
    }
  };

  return (
    <div className="sidebar">
      {/* Header with application name */}
      <div className="sidebar-header">
        <h3>BRM SYSTEM</h3>
      </div>
      
      {/* Navigation menu with links */}
      <div className="sidebar-menu">
        {/* Dashboard link */}
        <Link 
          to="/dashboard"
          className={`sidebar-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          <FaChartBar className="sidebar-icon" />
          <span>Dashboard</span>
        </Link>
        
        {/* Data dropdown with residents submenu */}
        <div className="sidebar-dropdown">
          <div 
            className={`sidebar-item ${location.pathname === '/residents' ? 'active' : ''}`}
            onClick={() => setDataExpanded(!dataExpanded)}
          >
            <FaDatabase className="sidebar-icon" />
            <span>Data</span>
            {dataExpanded ? <FaAngleDown className="dropdown-icon" /> : <FaAngleRight className="dropdown-icon" />}
          </div>
          
          {/* Submenu that shows only when expanded */}
          {dataExpanded && (
            <div className="sidebar-submenu">
              <Link 
                to="/residents"
                className={`sidebar-subitem ${location.pathname === '/residents' ? 'active' : ''}`}
              >
                Residents
              </Link>
            </div>
          )}
        </div>

        {/* Logout button */}
        <div className="sidebar-item logout" onClick={handleLogout}>
          <FaSignOutAlt className="sidebar-icon" />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 