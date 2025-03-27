/**
 * Barangay Management System - Backend Server
 * 
 * This is the main server file for the Barangay Management System backend.
 * It provides a RESTful API for the frontend to interact with the Redis database.
 * 
 * Main functionality:
 * - User authentication (login, register, with JWT)
 * - Resident CRUD operations (create, read, update, delete)
 * - Analytics for resident data (demographics, statistics)
 * - File uploads for resident profile images
 * - Data export (CSV) for reporting
 * 
 * The server uses Redis as its primary database, and stores data in structured Hash sets.
 * JWT authentication is used to secure API endpoints, with role-based access control.
 * 
 * @author Your Name
 * @version 1.0.0
 */

const express = require('express');
const redis = require('redis');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Log environment variables (excluding sensitive data)
console.log('Environment variables loaded:', {
  port: process.env.PORT,
  jwtSecret: !!process.env.JWT_SECRET,
  adminCode: process.env.ADMIN_REGISTRATION_CODE
});

// Express app setup
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Redis client configuration
const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Redis connection lost. Max retries reached.');
        return false;
      }
      return Math.min(retries * 100, 3000);
    }
  }
});

// Initialize Redis connection
(async () => {
  try {
    await client.connect();
    console.log('Connected to Redis');
    await client.ping();
    console.log('Redis connection test successful');
  } catch (err) {
    console.error('Redis connection error:', err);
    process.exit(1);
  }
})();

// Redis error handling
client.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

client.on('connect', () => {
  console.log('Redis client connected');
});

client.on('ready', () => {
  console.log('Redis client ready');
});

client.on('end', () => {
  console.error('Redis connection ended');
});

/**
 * Authentication Middleware
 * Verifies JWT token in request headers
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

/**
 * Admin Authorization Middleware
 * Checks if authenticated user has admin role
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

// Configure multer for storing resident profile images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/profiles';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// CRUD Operations

/**
 * Create Student
 * POST /students
 * Protected: Requires admin authentication
 */
app.post('/students', authenticateToken, isAdmin, async (req, res) => {
  const { 
    firstName, lastName, age, address, 
    studentId, course, yearLevel, section, major 
  } = req.body;

  // Validate input fields
  if (!firstName || !lastName || !studentId) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate studentId (numbers only)
  if (!/^\d+$/.test(studentId)) {
    return res.status(400).json({ message: 'Student ID must contain only numbers' });
  }

  // Validate age if provided
  if (age) {
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 16 || ageNum > 100) {
      return res.status(400).json({ message: 'Age must be between 16 and 100' });
    }
  }

  const id = Date.now().toString();

  try {
    // Check if student ID already exists
    const existingStudents = await client.keys('student:*');
    for (const key of existingStudents) {
      const student = await client.hGetAll(key);
      if (student.studentId === studentId) {
        return res.status(400).json({ message: 'Student ID already exists' });
      }
    }

    // Save student data in Redis hash using multiple hSet commands
    await Promise.all([
      client.hSet(`student:${id}`, 'firstName', firstName),
      client.hSet(`student:${id}`, 'lastName', lastName),
      client.hSet(`student:${id}`, 'age', age?.toString() || ''),
      client.hSet(`student:${id}`, 'address', address || ''),
      client.hSet(`student:${id}`, 'studentId', studentId),
      client.hSet(`student:${id}`, 'course', course || ''),
      client.hSet(`student:${id}`, 'yearLevel', yearLevel || ''),
      client.hSet(`student:${id}`, 'section', section || ''),
      client.hSet(`student:${id}`, 'major', major || '')
    ]);

    // Respond with success message
    res.status(201).json({ 
      message: 'Student saved successfully',
      student: { 
        id,
        firstName,
        lastName,
        age: age?.toString() || '',
        address: address || '',
        studentId,
        course: course || '',
        yearLevel: yearLevel || '',
        section: section || '',
        major: major || ''
      }
    });
  } catch (error) {
    console.error('Error saving student:', error);
    res.status(500).json({ message: 'Failed to save student' });
  }
});

/**
 * Get Student by ID
 * GET /students/:id
 * Public access
 */
app.get('/students/:id', async (req, res) => {
  const id = req.params.id;
  const student = await client.hGetAll(`student:${id}`);
  if (Object.keys(student).length === 0) {
    return res.status(404).json({ message: 'Student not found' });
  }
  res.json(student);
});

/**
 * Get All Students
 * GET /students
 * Public access
 */
app.get('/students', async (req, res) => {
  try {
    const keys = await client.keys('student:*');
    if (!keys || keys.length === 0) {
      return res.status(200).json({ data: [] });
    }

    const students = await Promise.all(keys.map(async (key) => {
      try {
        const studentData = await client.hGetAll(key);
        return {
          id: key.split(':')[1],
          ...studentData,
          firstName: studentData.firstName || '',
          lastName: studentData.lastName || '',
          age: studentData.age || '',
          address: studentData.address || '',
          studentId: studentData.studentId || '',
          course: studentData.course || '',
          yearLevel: studentData.yearLevel || '',
          section: studentData.section || '',
          major: studentData.major || ''
        };
      } catch (err) {
        console.error(`Error fetching student ${key}:`, err);
        return null;
      }
    }));

    const validStudents = students.filter(student => student !== null);
    res.status(200).json({ data: validStudents });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Error fetching students' });
  }
});

/**
 * Update Student
 * PUT /students/:id
 * Protected: Requires admin authentication
 */
app.put('/students/:id', authenticateToken, isAdmin, async (req, res) => {
  const id = req.params.id;
  const { 
    firstName, lastName, age, address,
    studentId, course, yearLevel, section, major 
  } = req.body;

  if (!firstName && !lastName && !age && !address && 
      !studentId && !course && !yearLevel && !section && !major) {
    return res.status(400).json({ message: 'At least one field is required to update' });
  }

  // Validate studentId if provided (numbers only)
  if (studentId && !/^\d+$/.test(studentId)) {
    return res.status(400).json({ message: 'Student ID must contain only numbers' });
  }

  // Validate age if provided
  if (age) {
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 16 || ageNum > 100) {
      return res.status(400).json({ message: 'Age must be between 16 and 100' });
    }
  }

  try {
    const existingStudent = await client.hGetAll(`student:${id}`);
    if (Object.keys(existingStudent).length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update student data in Redis using individual hSet commands
    const updatePromises = [];
    if (firstName) updatePromises.push(client.hSet(`student:${id}`, 'firstName', firstName));
    if (lastName) updatePromises.push(client.hSet(`student:${id}`, 'lastName', lastName));
    if (age) updatePromises.push(client.hSet(`student:${id}`, 'age', age.toString()));
    if (address) updatePromises.push(client.hSet(`student:${id}`, 'address', address));
    if (studentId) updatePromises.push(client.hSet(`student:${id}`, 'studentId', studentId));
    if (course) updatePromises.push(client.hSet(`student:${id}`, 'course', course));
    if (yearLevel) updatePromises.push(client.hSet(`student:${id}`, 'yearLevel', yearLevel));
    if (section) updatePromises.push(client.hSet(`student:${id}`, 'section', section));
    if (major) updatePromises.push(client.hSet(`student:${id}`, 'major', major));
    
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }

    const updatedStudent = await client.hGetAll(`student:${id}`);
    res.json({ 
      message: 'Student updated successfully',
      student: { id, ...updatedStudent }
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Failed to update student' });
  }
});

/**
 * Delete All Students
 * DELETE /students/all
 * Protected: Requires admin authentication
 */
app.delete('/students/all', authenticateToken, isAdmin, async (req, res) => {
  try {
    const keys = await client.keys('student:*');
    if (keys.length === 0) {
      return res.status(404).json({ message: 'No students found' });
    }

    // Delete all student records
    await Promise.all(keys.map(key => client.del(key)));

    res.json({ message: 'All student records deleted successfully' });
  } catch (error) {
    console.error('Error deleting all students:', error);
    res.status(500).json({ message: 'Error deleting all students' });
  }
});

/**
 * Delete Student
 * DELETE /students/:id
 * Protected: Requires admin authentication
 */
app.delete('/students/:id', authenticateToken, isAdmin, async (req, res) => {
  const id = req.params.id;
  await client.del(`student:${id}`);
  res.status(200).json({ message: 'Student deleted successfully' });
});

/**
 * Create Resident
 * POST /residents
 * Protected: Requires admin authentication
 */
app.post('/residents', authenticateToken, isAdmin, upload.single('profileImage'), async (req, res) => {
  try {
    const id = uuidv4();
    const residentData = req.body;

    // Save the image path if an image was uploaded
    if (req.file) {
      residentData.profileImage = req.file.path.replace(/\\/g, '/');
    }

    // Add resident to the set of all residents
    await client.sAdd('residents', id);

    // Save resident data
    const savePromises = Object.entries(residentData).map(([key, value]) => {
      return client.hSet(`resident:${id}`, key, value);
    });

    await Promise.all(savePromises);

    // Update statistics
    await client.hIncrBy('stats', 'totalResidents', 1);
    
    // Update voter statistics based on status
    if (residentData.votersStatus?.toLowerCase() === 'registered') {
      await client.hIncrBy('stats', 'totalVoters', 1);
    }
    
    // Update purok statistics if available
    if (residentData.purok) {
      await client.hIncrBy('stats', `residents:${residentData.purok}`, 1);
    }

    res.status(201).json({
      message: 'Resident added successfully',
      id,
      ...residentData
    });
  } catch (error) {
    console.error('Error adding resident:', error);
    res.status(500).json({ message: 'Error adding resident' });
  }
});

/**
 * Get All Residents
 * GET /residents
 * Protected: Requires authentication
 */
app.get('/residents', authenticateToken, async (req, res) => {
  try {
    const residents = [];
    const residentIds = await client.sMembers('residents');
    
    for (const id of residentIds) {
      const resident = await client.hGetAll(`resident:${id}`);
      if (resident && Object.keys(resident).length > 0) {
        residents.push({ id, ...resident });
      }
    }
    
    res.json(residents);
  } catch (error) {
    console.error('Error fetching residents:', error);
    res.status(500).json({ message: 'Error fetching residents' });
  }
});

/**
 * Get Resident by ID
 * GET /residents/:id
 * Protected: Requires authentication
 */
app.get('/residents/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const resident = await client.hGetAll(`resident:${id}`);
    
    if (!resident || Object.keys(resident).length === 0) {
      return res.status(404).json({ message: 'Resident not found' });
    }
    
    res.json({ id, ...resident });
  } catch (error) {
    console.error('Error fetching resident:', error);
    res.status(500).json({ message: 'Error fetching resident' });
  }
});

/**
 * Update Resident
 * PUT /residents/:id
 * Protected: Requires admin authentication
 */
app.put('/residents/:id', authenticateToken, isAdmin, upload.single('profileImage'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if resident exists
    const exists = await client.sIsMember('residents', id);
    if (!exists) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    // Get current resident data
    const currentData = await client.hGetAll(`resident:${id}`);

    // Handle image update
    if (req.file) {
      // Delete old image if it exists
      if (currentData.profileImage) {
        try {
          fs.unlinkSync(currentData.profileImage);
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }
      updates.profileImage = req.file.path.replace(/\\/g, '/');
    }

    // Check if voter status has changed
    if (updates.votersStatus && updates.votersStatus !== currentData.votersStatus) {
      // If changed from Not-Registered to Registered, increment voter count
      if (updates.votersStatus.toLowerCase() === 'registered' && 
          currentData.votersStatus.toLowerCase() !== 'registered') {
        await client.hIncrBy('stats', 'totalVoters', 1);
      }
      
      // If changed from Registered to Not-Registered, decrement voter count  
      if (updates.votersStatus.toLowerCase() !== 'registered' && 
          currentData.votersStatus.toLowerCase() === 'registered') {
        await client.hIncrBy('stats', 'totalVoters', -1);
      }
    }

    // Update resident data
    const updatePromises = Object.entries(updates).map(([key, value]) => {
      return client.hSet(`resident:${id}`, key, value);
    });

    await Promise.all(updatePromises);

    // Get updated resident data
    const updatedData = await client.hGetAll(`resident:${id}`);

    res.json({
      message: 'Resident updated successfully',
      id,
      ...updatedData
    });
  } catch (error) {
    console.error('Error updating resident:', error);
    res.status(500).json({ message: 'Error updating resident' });
  }
});

/**
 * Delete Resident
 * DELETE /residents/:id
 * Protected: Requires admin authentication
 */
app.delete('/residents/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get resident data for stats update
    const resident = await client.hGetAll(`resident:${id}`);
    
    if (!resident || Object.keys(resident).length === 0) {
      return res.status(404).json({ message: 'Resident not found' });
    }
    
    // Delete profile image if exists
    if (resident.profileImage) {
      try {
        fs.unlinkSync(resident.profileImage);
      } catch (err) {
        console.error('Error deleting profile image:', err);
      }
    }
    
    // Delete resident data
    await client.del(`resident:${id}`);
    await client.sRem('residents', id);
    
    // Update statistics
    await client.hIncrBy('stats', 'totalResidents', -1);
    await client.hIncrBy('stats', `residents:${resident.purok}`, -1);
    if (resident.votersStatus === 'Registered') {
      await client.hIncrBy('stats', 'totalVoters', -1);
    }
    
    res.json({ message: 'Resident deleted successfully' });
  } catch (error) {
    console.error('Error deleting resident:', error);
    res.status(500).json({ message: 'Error deleting resident' });
  }
});

/**
 * Get Analytics
 * GET /analytics/stats
 * Protected: Requires authentication
 */
app.get('/analytics/stats', authenticateToken, async (req, res) => {
  try {
    const keys = await client.keys('resident:*');
    const residents = await Promise.all(keys.map(async (key) => {
      return await client.hGetAll(key);
    }));

    // Calculate statistics
    const stats = residents.reduce((acc, resident) => {
      // Update total population
      acc.population.total++;

      // Update gender counts
      if (resident.gender?.toLowerCase() === 'male') {
        acc.population.male++;
      } else if (resident.gender?.toLowerCase() === 'female') {
        acc.population.female++;
      }

      // Update voters status
      if (resident.votersStatus?.toLowerCase() === 'registered') {
        acc.voters.voters++;
      } else {
        acc.voters.nonVoters++;
      }

      // Count unique puroks
      if (resident.purok && !acc.puroks.includes(resident.purok)) {
        acc.puroks.push(resident.purok);
      }

      return acc;
    }, {
      population: { total: 0, male: 0, female: 0 },
      voters: { voters: 0, nonVoters: 0 },
      puroks: []
    });

    res.json({
      population: stats.population,
      voters: stats.voters,
      precincts: stats.puroks.length
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

// Analytics endpoint
app.get('/analytics/residents', authenticateToken, async (req, res) => {
  try {
    // Get total residents count
    const totalResidents = await client.sCard('residents');
    console.log('Total residents:', totalResidents);

    // Get gender counts
    const allResidents = await client.sMembers('residents');
    console.log('All resident IDs:', allResidents);

    let maleCount = 0;
    let femaleCount = 0;
    let votersCount = 0;
    let nonVotersCount = 0;

    // Process each resident
    for (const residentId of allResidents) {
      const resident = await client.hGetAll(`resident:${residentId}`);
      console.log(`Processing resident ${residentId}:`, resident);

      // Case-insensitive comparison for gender and voter status
      const gender = (resident.gender || '').toLowerCase();
      const voterStatus = (resident.votersStatus || '').toLowerCase();

      if (gender === 'male') maleCount++;
      if (gender === 'female') femaleCount++;
      if (voterStatus === 'registered') votersCount++;
      if (voterStatus === 'not-registered') nonVotersCount++;
    }

    const response = {
      totalResidents,
      maleCount,
      femaleCount,
      votersCount,
      nonVotersCount
    };

    console.log('Sending analytics response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

// Authentication Routes

/**
 * Register Admin
 * POST /auth/register-admin
 * Public access but requires admin registration code
 */
app.post('/auth/register-admin', async (req, res) => {
  const { username, password, adminCode } = req.body;
  
  console.log('Registration attempt with data:', { 
    username,
    passwordLength: password?.length,
    adminCodeProvided: !!adminCode
  });
  
  try {
    // Validate input
    if (!username || !password || !adminCode) {
      console.log('Missing fields:', {
        username: !username,
        password: !password,
        adminCode: !adminCode
      });
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Verify admin registration code
    const ADMIN_REGISTRATION_CODE = process.env.ADMIN_REGISTRATION_CODE;
    console.log('Comparing admin codes:', {
      provided: adminCode,
      expected: ADMIN_REGISTRATION_CODE
    });
    
    if (adminCode !== ADMIN_REGISTRATION_CODE) {
      console.log('Invalid admin code provided');
      return res.status(403).json({ message: 'Invalid admin registration code' });
    }
    
    // Check if user exists
    const existingUser = await client.hGet(`user:${username}`, 'password');
    if (existingUser) {
      console.log('Username already exists:', username);
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Validate password strength
    if (password.length < 6) {
      console.log('Password too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Save admin user
    await client.hSet(`user:${username}`, 'password', hashedPassword);
    await client.hSet(`user:${username}`, 'role', 'admin');
    await client.hSet(`user:${username}`, 'createdAt', new Date().toISOString());

    console.log('Admin registered successfully:', username);
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error registering admin',
      error: error.message 
    });
  }
});

/**
 * User Login
 * POST /auth/login
 * Public access
 */
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Get user
    const hashedPassword = await client.hGet(`user:${username}`, 'password');
    const role = await client.hGet(`user:${username}`, 'role') || 'user'; // Default to user if no role is set
    
    console.log('Login attempt:', { username, role, hasPassword: !!hashedPassword });

    if (!hashedPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, hashedPassword);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { username, role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful:', { username, role });

    res.json({
      token,
      role, // Add role to top-level response for easier access
      user: {
        username,
        role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

/**
 * Verify Token
 * GET /auth/verify
 * Protected route
 */
app.get('/auth/verify', authenticateToken, (req, res) => {
  try {
    // If middleware passes, token is valid
    res.json({
      valid: true,
      isAdmin: req.user.role === 'admin',
      username: req.user.username,
      role: req.user.role
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ valid: false, message: 'Error verifying token' });
  }
});

/**
 * Register Regular User
 * POST /auth/register-user
 * Public access for regular user registration
 */
app.post('/auth/register-user', async (req, res) => {
  const { username, password } = req.body;
  
  console.log('Regular user registration attempt:', { 
    username,
    passwordLength: password?.length
  });
  
  try {
    // Validate input
    if (!username || !password) {
      console.log('Missing fields:', {
        username: !username,
        password: !password
      });
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Check if user exists
    const existingUser = await client.hGet(`user:${username}`, 'password');
    if (existingUser) {
      console.log('Username already exists:', username);
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Validate password strength
    if (password.length < 6) {
      console.log('Password too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Save regular user
    await client.hSet(`user:${username}`, 'password', hashedPassword);
    await client.hSet(`user:${username}`, 'role', 'user'); // Set role as regular user
    await client.hSet(`user:${username}`, 'createdAt', new Date().toISOString());

    console.log('Regular user registered successfully:', username);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error registering user',
      error: error.message 
    });
  }
});

// Analytics Routes

/**
 * Get Student Statistics
 * GET /analytics/student-stats
 * Public access
 */
app.get('/analytics/student-stats', async (req, res) => {
  try {
    const keys = await client.keys('student:*');
    const students = await Promise.all(keys.map(async (key) => {
      return await client.hGetAll(key);
    }));

    // Calculate statistics
    const yearLevelStats = students.reduce((acc, student) => {
      const yearLevel = student.yearLevel || 'Unspecified';
      acc[yearLevel] = (acc[yearLevel] || 0) + 1;
      return acc;
    }, {});

    const courseStats = students.reduce((acc, student) => {
      const course = student.course || 'Unspecified';
      acc[course] = (acc[course] || 0) + 1;
      return acc;
    }, {});

    // Convert to array format for charts
    const yearLevelData = Object.entries(yearLevelStats).map(([name, value]) => ({
      name,
      value
    }));

    const courseData = Object.entries(courseStats).map(([name, value]) => ({
      name,
      value
    }));

    res.json({
      totalStudents: students.length,
      yearLevelDistribution: yearLevelData,
      courseDistribution: courseData
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

/**
 * Check Users in Redis (Debug endpoint)
 * GET /auth/check-users
 * Public access (should be protected in production)
 */
app.get('/auth/check-users', async (req, res) => {
  try {
    const userKeys = await client.keys('user:*');
    const users = await Promise.all(userKeys.map(async (key) => {
      const userData = await client.hGetAll(key);
      return {
        username: key.split(':')[1],
        role: userData.role,
        createdAt: userData.createdAt
      };
    }));
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error checking users' });
  }
});

// Resident endpoints
app.get('/residents/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await client.hGetAll('stats');
    res.json(stats);
  } catch (error) {
    console.error('Error fetching resident stats:', error);
    res.status(500).json({ message: 'Error fetching resident stats' });
  }
});

app.get('/residents/export/csv', authenticateToken, async (req, res) => {
  try {
    const residents = [];
    const residentIds = await client.sMembers('residents');
    
    for (const id of residentIds) {
      const resident = await client.hGetAll(`resident:${id}`);
      if (resident && Object.keys(resident).length > 0) {
        residents.push({ id, ...resident });
      }
    }
    
    const fields = [
      'First Name',
      'Middle Name',
      'Last Name',
      'Alias',
      'Place of Birth',
      'Birthdate',
      'Age',
      'Civil Status',
      'Gender',
      'Purok',
      'Voters Status',
      'Identified As',
      'Email',
      'Contact Number',
      'Occupation',
      'Citizenship',
      'Address',
      'Household No.',
      'Precinct No.'
    ];
    
    const csvRows = [
      fields.join(','),
      ...residents.map(resident => [
        resident.firstName,
        resident.middleName,
        resident.lastName,
        resident.alias,
        resident.birthplace,
        resident.birthdate,
        resident.age,
        resident.civilStatus,
        resident.gender,
        resident.purok,
        resident.votersStatus,
        resident.identifiedAs,
        resident.email,
        resident.contactNumber,
        resident.occupation,
        resident.citizenship,
        resident.address,
        resident.householdNo,
        resident.precinctNo
      ].map(field => `"${field || ''}"`).join(','))
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=residents.csv');
    res.send(csvRows);
  } catch (error) {
    console.error('Error exporting residents:', error);
    res.status(500).json({ message: 'Error exporting residents' });
  }
});

// Add endpoint to serve profile images
app.get('/api/profile-image/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'uploads', 'profiles', filename);
  
  // Check if file exists
  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).json({ message: 'Image not found' });
  }
});

// Server startup
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Global error handlers
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});