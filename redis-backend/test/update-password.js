const redis = require('redis');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function updatePassword(username, newPassword) {
  // Redis client configuration
  const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  try {
    await client.connect();
    console.log('Connected to Redis');
    
    console.log(`Updating password for user: ${username}`);

    // Check if user exists
    const existingUser = await client.hGet(`user:${username}`, 'password');
    if (!existingUser) {
      console.log('User not found:', username);
      await client.disconnect();
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await client.hSet(`user:${username}`, 'password', hashedPassword);
    console.log(`Password updated successfully for user: ${username}`);
    console.log(`New password: ${newPassword}`);

    await client.disconnect();
    console.log('Disconnected from Redis');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Update nilmar's password to '1'
updatePassword('nilmar', '1'); 