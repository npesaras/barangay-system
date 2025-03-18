const axios = require('axios');
require('dotenv').config();

async function testLoginAPI() {
  try {
    console.log('Testing login API...');
    
    // Test credentials
    const credentials = {
      username: 'admin',
      password: 'admin123'
    };
    
    console.log('Using credentials:', credentials);
    
    // Make the API call
    const response = await axios.post('http://localhost:5000/auth/login', credentials, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login API response status:', response.status);
    console.log('Login API response data:', JSON.stringify(response.data, null, 2));
    
    // Check if token exists
    if (response.data && response.data.token) {
      console.log('✅ Login successful! Token received.');
      
      // Test token verification
      console.log('\nTesting token verification...');
      const verifyResponse = await axios.get('http://localhost:5000/auth/verify', {
        headers: {
          'Authorization': `Bearer ${response.data.token}`
        }
      });
      
      console.log('Verify API response status:', verifyResponse.status);
      console.log('Verify API response data:', JSON.stringify(verifyResponse.data, null, 2));
      
      if (verifyResponse.data && verifyResponse.data.valid) {
        console.log('✅ Token verification successful!');
      } else {
        console.log('❌ Token verification failed!');
      }
    } else {
      console.log('❌ Login failed! No token in response.');
    }
  } catch (error) {
    console.error('Error testing login API:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testLoginAPI(); 