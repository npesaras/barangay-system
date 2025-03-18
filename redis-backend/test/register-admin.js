const redis = require('redis');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function registerAdmin() {
  // Redis client configuration
  const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  try {
    await client.connect();
    console.log('Connected to Redis');

    const username = 'admin';
    const password = 'admin123';

    // Check if user exists
    const existingUser = await client.hGet(`user:${username}`, 'password');
    if (existingUser) {
      console.log('Username already exists:', username);
      await client.disconnect();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Save admin user
    await client.hSet(`user:${username}`, 'password', hashedPassword);
    await client.hSet(`user:${username}`, 'role', 'admin');
    await client.hSet(`user:${username}`, 'createdAt', new Date().toISOString());

    console.log('Admin registered successfully:', username);
    console.log('Password:', password);

    // List all users
    const userKeys = await client.keys('user:*');
    const users = await Promise.all(userKeys.map(async (key) => {
      const userData = await client.hGetAll(key);
      return {
        username: key.split(':')[1],
        role: userData.role,
        createdAt: userData.createdAt
      };
    }));
    
    console.log('All users:', users);

    await client.disconnect();
    console.log('Disconnected from Redis');
  } catch (error) {
    console.error('Error:', error);
  }
}

registerAdmin(); 