import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showToast } from '../utils/toast';
import './Login.css'; // We'll create this file next

const API_URL = 'http://localhost:5000';

const Login = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    adminCode: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        showToast.success('Login successful');
        onLoginSuccess();
        navigate('/dashboard');
      } else {
        showToast.error('Login failed - No token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast.error(error.response?.data?.message || 'Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      showToast.error('Passwords do not match');
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/auth/register-admin`, {
        username: registerData.username,
        password: registerData.password,
        adminCode: registerData.adminCode
      });
      
      if (response.data.message) {
        showToast.success('Registration successful');
        setShowRegisterModal(false);
        setRegisterData({
          username: '',
          password: '',
          confirmPassword: '',
          adminCode: ''
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      showToast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="brgy-info">
          <div className="brgy-text">
            <h1>Brgy. Sto. Rosario</h1>
            <h2>Iligan City, Lanao Del Norte</h2>
          </div>
        </div>
        <div className="login-form-container">
          <div className="login-form">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  placeholder="Username"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                />
              </div>
              <button type="submit" className="login-btn">
                Login
              </button>
            </form>
            <div className="form-footer">
              <button 
                className="create-account"
                onClick={() => setShowRegisterModal(true)}
              >
                Create new account
              </button>
            </div>
          </div>
        </div>
      </div>

      {showRegisterModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Register Admin Account</h2>
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <input
                  type="text"
                  name="username"
                  value={registerData.username}
                  onChange={handleRegisterChange}
                  placeholder="Username"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  placeholder="Password"
                  required
                  minLength="6"
                />
                <small>Password must be at least 6 characters</small>
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="confirmPassword"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  placeholder="Confirm Password"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="adminCode"
                  value={registerData.adminCode}
                  onChange={handleRegisterChange}
                  placeholder="Admin Registration Code"
                  required
                />
                <small>Contact system administrator for the registration code</small>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowRegisterModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login; 