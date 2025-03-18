const axios = require('axios');

const API_URL = 'http://localhost:5000';
let authToken = '';

const testDashboard = async () => {
  try {
    // Step 1: Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    authToken = loginResponse.data.token;
    console.log('Login successful, got token');

    // Step 2: Clear existing residents
    console.log('\n2. Clearing existing residents...');
    const existingResidents = await axios.get(
      `${API_URL}/residents`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    for (const resident of existingResidents.data) {
      await axios.delete(
        `${API_URL}/residents/${resident.id}`,
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
    }
    console.log('Cleared existing residents');

    // Step 3: Add test residents
    console.log('\n3. Adding test residents...');
    const residents = [
      {
        firstName: 'John',
        lastName: 'Doe',
        gender: 'Male',
        votersStatus: 'Yes'
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        gender: 'Female',
        votersStatus: 'No'
      },
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        gender: 'Male',
        votersStatus: 'Yes'
      }
    ];

    for (const resident of residents) {
      await axios.post(
        `${API_URL}/residents`,
        resident,
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
      console.log(`Added resident: ${resident.firstName} ${resident.lastName}`);
    }

    // Step 4: Get analytics data
    console.log('\n4. Fetching analytics data...');
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

    // Step 5: Verify the numbers
    console.log('\n5. Verifying statistics...');
    const expectedStats = {
      totalResidents: 3,
      maleCount: 2,
      femaleCount: 1,
      votersCount: 2,
      nonVotersCount: 1
    };

    const isCorrect = Object.keys(expectedStats).every(key => {
      const matches = stats[key] === expectedStats[key];
      if (!matches) {
        console.log(`❌ ${key}: Expected ${expectedStats[key]}, got ${stats[key]}`);
      } else {
        console.log(`✅ ${key}: ${stats[key]}`);
      }
      return matches;
    });

    if (isCorrect) {
      console.log('\n✅ All statistics are correct!');
    } else {
      console.log('\n❌ Some statistics are incorrect');
    }

  } catch (error) {
    console.error('Error during test:', error.response?.data || error.message);
  }
};

// Run the test
testDashboard(); 