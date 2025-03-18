const redis = require('redis');
require('dotenv').config();

async function addSampleStudents() {
  // Redis client configuration
  const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  try {
    await client.connect();
    console.log('Connected to Redis');

    // Sample student data
    const students = [
      {
        id: Date.now().toString(),
        firstName: 'John',
        lastName: 'Doe',
        age: '21',
        address: '123 Main St, City',
        studentId: '10001',
        course: 'Computer Science',
        yearLevel: '3rd Year',
        section: 'A',
        major: 'Software Engineering'
      },
      {
        id: (Date.now() + 1).toString(),
        firstName: 'Jane',
        lastName: 'Smith',
        age: '20',
        address: '456 Park Ave, Town',
        studentId: '10002',
        course: 'Information Technology',
        yearLevel: '2nd Year',
        section: 'B',
        major: 'Network Administration'
      }
    ];

    // Add students to Redis
    for (const student of students) {
      const id = student.id;
      console.log(`Adding student: ${student.firstName} ${student.lastName}`);
      
      // Save student data in Redis hash
      await Promise.all([
        client.hSet(`student:${id}`, 'firstName', student.firstName),
        client.hSet(`student:${id}`, 'lastName', student.lastName),
        client.hSet(`student:${id}`, 'age', student.age),
        client.hSet(`student:${id}`, 'address', student.address),
        client.hSet(`student:${id}`, 'studentId', student.studentId),
        client.hSet(`student:${id}`, 'course', student.course),
        client.hSet(`student:${id}`, 'yearLevel', student.yearLevel),
        client.hSet(`student:${id}`, 'section', student.section),
        client.hSet(`student:${id}`, 'major', student.major)
      ]);
    }

    console.log('Sample students added successfully');

    // List all students
    const keys = await client.keys('student:*');
    console.log(`Total students: ${keys.length}`);
    
    if (keys.length > 0) {
      const studentList = await Promise.all(keys.map(async (key) => {
        const data = await client.hGetAll(key);
        return {
          id: key.split(':')[1],
          ...data
        };
      }));
      
      console.log('Students in database:');
      studentList.forEach(student => {
        console.log(`- ${student.firstName} ${student.lastName} (ID: ${student.studentId})`);
      });
    }

    await client.disconnect();
    console.log('Disconnected from Redis');
  } catch (error) {
    console.error('Error:', error);
  }
}

addSampleStudents(); 