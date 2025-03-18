import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaChartBar, FaDatabase, FaAngleRight, FaAngleDown, FaSignOutAlt } from 'react-icons/fa';
import { logoutUser } from '../App';
import { showToast } from '../utils/toast';

const Sidebar = () => {
  const [dataExpanded, setDataExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-expand the Data menu when on residents page
  useEffect(() => {
    if (location.pathname === '/residents') {
      setDataExpanded(true);
    }
  }, [location.pathname]);

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
      <div className="sidebar-header">
        <h3>BRM SYSTEM</h3>
      </div>
      
      <div className="sidebar-menu">
        <Link 
          to="/dashboard"
          className={`sidebar-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          <FaChartBar className="sidebar-icon" />
          <span>Dashboard</span>
        </Link>
        
        <div className="sidebar-dropdown">
          <div 
            className={`sidebar-item ${location.pathname === '/residents' ? 'active' : ''}`}
            onClick={() => setDataExpanded(!dataExpanded)}
          >
            <FaDatabase className="sidebar-icon" />
            <span>Data</span>
            {dataExpanded ? <FaAngleDown className="dropdown-icon" /> : <FaAngleRight className="dropdown-icon" />}
          </div>
          
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

        <div className="sidebar-item logout" onClick={handleLogout}>
          <FaSignOutAlt className="sidebar-icon" />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 