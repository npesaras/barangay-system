import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ResidentsRecord from './components/ResidentsRecord';
import Login from './components/Login';
import { showToast } from './utils/toast';
import './App.css';

const API_URL = 'http://localhost:5000';

// Global logout function
export const logoutUser = (navigate) => {
  try {
    // Cancel any pending requests
    if (axios.CancelToken) {
      const source = axios.CancelToken.source();
      source.cancel('Logout initiated');
    }
    
    // Clear all local storage
    localStorage.clear();
    
    // Redirect to login page - use different methods to ensure it works
    if (navigate) {
      navigate('/login');
    } else {
      // Fallback - direct window location change
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Error during logout:', error);
    // Force redirect if there's an error
    window.location.href = '/login';
  }
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Set up axios interceptors
  useEffect(() => {
    // Add a response interceptor to handle auth errors
    const responseInterceptor = axios.interceptors.response.use(
      response => response, 
      error => {
        if (error.response && error.response.status === 401) {
          // If we get a 401 Unauthorized, log the user out
          showToast.error('Your session has expired. Please log in again.');
          logoutUser(navigate);
        }
        return Promise.reject(error);
      }
    );

    // Cleanup function to remove the interceptor when component unmounts
    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="app">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLoginSuccess={() => setIsAuthenticated(true)} />
        } />
        
        <Route path="/dashboard" element={
          isAuthenticated ? (
            <Layout>
              <Dashboard />
            </Layout>
          ) : <Navigate to="/login" />
        } />
        
        <Route path="/residents" element={
          isAuthenticated ? (
            <Layout>
              <ResidentsRecord />
            </Layout>
          ) : <Navigate to="/login" />
        } />
        
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </div>
  );
}

export default App;