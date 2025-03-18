const redis = require('redis');
require('dotenv').config();

async function listUsers() {
  // Redis client configuration
  const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  try {
    await client.connect();
    console.log('Connected to Redis');

    // List all users
    const userKeys = await client.keys('user:*');
    console.log('User keys:', userKeys);
    
    if (userKeys.length === 0) {
      console.log('No users found in Redis');
    } else {
      const users = await Promise.all(userKeys.map(async (key) => {
        const userData = await client.hGetAll(key);
        return {
          username: key.split(':')[1],
          role: userData.role,
          hasPassword: !!userData.password,
          passwordLength: userData.password ? userData.password.length : 0,
          createdAt: userData.createdAt
        };
      }));
      
      console.log('All users:', JSON.stringify(users, null, 2));
      console.log(`Total users: ${users.length}`);
    }

    await client.disconnect();
    console.log('Disconnected from Redis');
  } catch (error) {
    console.error('Error:', error);
  }
}

listUsers(); 