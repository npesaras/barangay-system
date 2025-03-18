const request = require('supertest');
const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();

// Import the endpoint configuration
require('../server');

describe('Image Endpoint Tests', () => {
  const testImagePath = path.join(__dirname, '..', 'uploads', 'profiles', 'test-image.jpg');

  beforeAll(() => {
    // Create test image if it doesn't exist
    if (!fs.existsSync(testImagePath)) {
      const testImageDir = path.dirname(testImagePath);
      if (!fs.existsSync(testImageDir)) {
        fs.mkdirSync(testImageDir, { recursive: true });
      }
      // Create a small test image
      fs.writeFileSync(testImagePath, Buffer.from('fake-image-data'));
    }
  });

  afterAll(() => {
    // Clean up test image
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  });

  it('should serve an existing image', async () => {
    const response = await request(app)
      .get('/api/profile-image/test-image.jpg')
      .expect('Content-Type', /image/)
      .expect(200);

    expect(response.body).toBeTruthy();
  });

  it('should return 404 for non-existent image', async () => {
    await request(app)
      .get('/api/profile-image/non-existent.jpg')
      .expect(404);
  });

  it('should handle invalid image paths', async () => {
    await request(app)
      .get('/api/profile-image/../server.js')
      .expect(404);
  });
}); 