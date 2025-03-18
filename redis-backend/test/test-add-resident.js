const axios = require('axios');

const testAddResident = async () => {
  try {
    // First, login to get the token
    const loginResponse = await axios.post('http://localhost:5000/auth/login', {
      username: 'admin',
      password: 'admin123'
    });

    const token = loginResponse.data.token;

    // Sample resident data
    const residentData = {
      firstName: 'Juan',
      middleName: 'Dela',
      lastName: 'Cruz',
      alias: 'JDC',
      birthplace: 'Manila City',
      birthdate: '1990-01-15',
      age: '33',
      civilStatus: 'Married',
      gender: 'Male',
      purok: 'Purok 1',
      votersStatus: 'Yes',
      email: 'juan.cruz@example.com',
      contactNumber: '09123456789',
      occupation: 'Teacher',
      citizenship: 'Filipino',
      address: '123 Main Street, Barangay Example, City',
      householdNo: '1',
      precinctNo: '1'
    };

    // Add resident
    const response = await axios.post('http://localhost:5000/residents', residentData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Resident added successfully:', response.data);

    // Add another resident
    const residentData2 = {
      firstName: 'Maria',
      middleName: 'Santos',
      lastName: 'Garcia',
      alias: 'MSG',
      birthplace: 'Quezon City',
      birthdate: '1995-05-20',
      age: '28',
      civilStatus: 'Single',
      gender: 'Female',
      purok: 'Purok 2',
      votersStatus: 'Yes',
      email: 'maria.garcia@example.com',
      contactNumber: '09187654321',
      occupation: 'Nurse',
      citizenship: 'Filipino',
      address: '456 Secondary Road, Barangay Example, City',
      householdNo: '2',
      precinctNo: '2'
    };

    const response2 = await axios.post('http://localhost:5000/residents', residentData2, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Second resident added successfully:', response2.data);

  } catch (error) {
    console.error('Error:', {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
};

testAddResident(); 