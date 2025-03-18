const redis = require('redis');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testLogin(username, password) {
  // Redis client configuration
  const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  try {
    await client.connect();
    console.log('Connected to Redis');
    
    console.log('Testing login for:', username);

    // Get user
    const hashedPassword = await client.hGet(`user:${username}`, 'password');
    const role = await client.hGet(`user:${username}`, 'role');
    
    console.log('User found:', { 
      username, 
      role, 
      hasPassword: !!hashedPassword,
      passwordLength: hashedPassword ? hashedPassword.length : 0
    });

    if (!hashedPassword) {
      console.log('Login failed: User not found or no password set');
      await client.disconnect();
      return;
    }

    // Check password
    const validPassword = await bcrypt.compare(password, hashedPassword);
    console.log('Password check result:', validPassword);
    
    if (validPassword) {
      console.log('Login successful!');
    } else {
      console.log('Login failed: Invalid password');
    }

    await client.disconnect();
    console.log('Disconnected from Redis');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test admin user
console.log('=== Testing admin user ===');
testLogin('admin', 'admin123')
  .then(() => {
    // Test nilmar user
    console.log('\n=== Testing nilmar user ===');
    return testLogin('nilmar', '1');
  })
  .catch(error => {
    console.error('Error in test sequence:', error);
  }); 