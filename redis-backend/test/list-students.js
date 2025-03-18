const redis = require('redis');
require('dotenv').config();

async function listStudents() {
  // Redis client configuration
  const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  try {
    await client.connect();
    console.log('Connected to Redis');

    // List all students
    const keys = await client.keys('student:*');
    console.log('Student keys:', keys);
    
    if (keys.length === 0) {
      console.log('No students found in Redis');
    } else {
      const students = await Promise.all(keys.map(async (key) => {
        const data = await client.hGetAll(key);
        return {
          id: key.split(':')[1],
          ...data
        };
      }));
      
      console.log('All students:', JSON.stringify(students, null, 2));
      console.log(`Total students: ${students.length}`);
    }

    await client.disconnect();
    console.log('Disconnected from Redis');
  } catch (error) {
    console.error('Error:', error);
  }
}

listStudents(); 