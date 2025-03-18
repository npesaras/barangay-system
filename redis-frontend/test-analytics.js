import axios from 'axios';

const API_URL = 'http://localhost:5000';
let authToken = '';

const testAnalytics = async () => {
  try {
    // Step 1: Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    authToken = loginResponse.data.token;
    console.log('Login successful, got token');

    // Step 2: Get analytics data
    console.log('\n2. Fetching analytics data...');
    const analyticsResponse = await axios.get(
      `${API_URL}/analytics/residents`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    const stats = analyticsResponse.data;
    console.log('\nDashboard Statistics:');
    console.log('-------------------');
    console.log(`Total Population: ${stats.totalResidents}`);
    console.log(`Male Count: ${stats.maleCount}`);
    console.log(`Female Count: ${stats.femaleCount}`);
    console.log(`Voters Count: ${stats.votersCount}`);
    console.log(`Non-Voters Count: ${stats.nonVotersCount}`);
    
    console.log('\n✅ Analytics endpoint is working!');

  } catch (error) {
    console.error('Error during test:', error.response?.data?.message || error.message);
    console.error('Full error details:', error.response?.data || error);
  }
};

// Run the test
testAnalytics(); 