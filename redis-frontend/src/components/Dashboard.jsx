/**
 * Dashboard Component
 * 
 * This component serves as the main dashboard of the application, displaying analytics 
 * about residents including gender distribution, voter status, and other key metrics.
 * It fetches data from the analytics service and renders it using charts and stat cards.
 * 
 * Features:
 * - Displays key metrics in stat cards (total population, gender counts, voter status)
 * - Shows gender distribution in a pie chart
 * - Shows voter status distribution in a pie chart
 * - Handles loading states and errors with appropriate UI feedback
 * - Provides retry functionality for failed data fetching
 */
import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';
import { 
  PieChart, Pie, Cell,
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { FaUsers, FaMale, FaFemale, FaVoteYea, FaUserTimes, FaSync } from 'react-icons/fa';
import { showToast } from '../utils/toast';
import '../styles/Dashboard.css';

const Dashboard = () => {
  // Initialize state for analytics data
  const [stats, setStats] = useState({
    totalResidents: 0,
    maleCount: 0,
    femaleCount: 0,
    votersCount: 0,
    nonVotersCount: 0
  });

  // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect hook to fetch data on component mount
  useEffect(() => {
    // Only fetch stats if we have a token (user is authenticated)
    const token = localStorage.getItem('token');
    if (token) {
      fetchStats();
    } else {
      setError('Authentication required. Please log in.');
      setLoading(false);
    }

    // Cleanup function to cancel any pending requests when component unmounts
    return () => {
      analyticsService.cleanup();
    };
  }, []);

  /**
   * Fetches analytics data from the server
   * Handles loading state, errors, and updates stats state
   */
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsService.getResidentStats();
      
      if (response) {
        setStats(response);
        setError(null);
      } else {
        // Set default values if no data is returned
        setStats({
          totalResidents: 0,
          maleCount: 0,
          femaleCount: 0,
          votersCount: 0,
          nonVotersCount: 0
        });
        setError('No data available');
      }
    } catch (err) {
      console.error('Error in fetchStats:', err);
      // Set default values in case of error
      setStats({
        totalResidents: 0,
        maleCount: 0,
        femaleCount: 0,
        votersCount: 0,
        nonVotersCount: 0
      });
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles retry action when data fetching fails
   * Initiates a new fetch operation
   */
  const handleRetry = () => {
    fetchStats();
  };

  const genderData = [
    { name: 'Male', value: stats.maleCount },
    { name: 'Female', value: stats.femaleCount }
  ].filter(item => item.value > 0);

  const voterData = [
    { name: 'Voters', value: stats.votersCount },
    { name: 'Non-Voters', value: stats.nonVotersCount }
  ].filter(item => item.value > 0);

  const COLORS = ['#8884d8', '#82ca9d'];

  // Show loading indicator while data is being fetched
  if (loading) {
    return (
      <div className="dashboard">
        <h2>Dashboard</h2>
        <div className="dashboard-loading">
          Loading analytics...
          <FaSync className="loading-icon" />
        </div>
      </div>
    );
  }

  // Render the dashboard with analytics data
  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      
      {/* Show error message with retry button if there's an error */}
      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button className="retry-btn" onClick={handleRetry}>
            <FaSync className="retry-icon" /> Retry
          </button>
        </div>
      )}
      
      {/* Statistics cards section */}
      <div className="stats-grid">
        {/* Total population card */}
        <div className="stat-card population">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-info">
            <h3>{stats.totalResidents}</h3>
            <div className="stat-label">Total Population</div>
          </div>
        </div>
        
        {/* Male population card */}
        <div className="stat-card male">
          <div className="stat-icon">
            <FaMale />
          </div>
          <div className="stat-info">
            <h3>{stats.maleCount}</h3>
            <div className="stat-label">Male</div>
          </div>
        </div>
        
        {/* Female population card */}
        <div className="stat-card female">
          <div className="stat-icon">
            <FaFemale />
          </div>
          <div className="stat-info">
            <h3>{stats.femaleCount}</h3>
            <div className="stat-label">Female</div>
          </div>
        </div>
        
        {/* Registered voters card */}
        <div className="stat-card voters">
          <div className="stat-icon">
            <FaVoteYea />
          </div>
          <div className="stat-info">
            <h3>{stats.votersCount}</h3>
            <div className="stat-label">Registered Voters</div>
          </div>
        </div>
        
        {/* Non-voters card */}
        <div className="stat-card non-voters">
          <div className="stat-icon">
            <FaUserTimes />
          </div>
          <div className="stat-info">
            <h3>{stats.nonVotersCount}</h3>
            <div className="stat-label">Non-Voters</div>
          </div>
        </div>
      </div>
      
      {/* Charts section */}
      <div className="charts-grid">
        {/* Gender distribution pie chart */}
        <div className="chart-card">
          <h3>Gender Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Male', value: stats.maleCount || 0 },
                  { name: 'Female', value: stats.femaleCount || 0 }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {/* Colors for male and female segments */}
                <Cell fill="#48bb78" />
                <Cell fill="#ed64a6" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Voter status pie chart */}
        <div className="chart-card">
          <h3>Voter Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Voters', value: stats.votersCount || 0 },
                  { name: 'Non-Voters', value: stats.nonVotersCount || 0 }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {/* Colors for voters and non-voters segments */}
                <Cell fill="#9f7aea" />
                <Cell fill="#f6ad55" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 