import axios from 'axios';
import { getImageUrl } from '../utils/imageUtils';

// Mock axios
jest.mock('axios');

describe('Image Fetching Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getImageUrl', () => {
    it('should return null for empty path', () => {
      expect(getImageUrl('')).toBeNull();
      expect(getImageUrl(null)).toBeNull();
      expect(getImageUrl(undefined)).toBeNull();
    });

    it('should correctly format image URL from Windows path', () => {
      const path = 'uploads\\profiles\\1234567890.jpg';
      const expected = 'http://localhost:5000/api/profile-image/1234567890.jpg';
      expect(getImageUrl(path)).toBe(expected);
    });

    it('should correctly format image URL from Unix path', () => {
      const path = 'uploads/profiles/1234567890.jpg';
      const expected = 'http://localhost:5000/api/profile-image/1234567890.jpg';
      expect(getImageUrl(path)).toBe(expected);
    });
  });

  describe('Image API Integration', () => {
    it('should successfully fetch an image', async () => {
      // Mock successful image response
      const mockImageBlob = new Blob(['fake-image-data'], { type: 'image/jpeg' });
      axios.get.mockResolvedValueOnce({ 
        data: mockImageBlob,
        status: 200,
        headers: { 'content-type': 'image/jpeg' }
      });

      const imagePath = 'uploads\\profiles\\test-image.jpg';
      const url = getImageUrl(imagePath);
      
      const response = await axios.get(url, { responseType: 'blob' });
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('image/jpeg');
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:5000/api/profile-image/test-image.jpg',
        { responseType: 'blob' }
      );
    });

    it('should handle image fetch errors', async () => {
      // Mock failed image response
      axios.get.mockRejectedValueOnce(new Error('Image not found'));

      const imagePath = 'uploads\\profiles\\non-existent.jpg';
      const url = getImageUrl(imagePath);
      
      await expect(axios.get(url, { responseType: 'blob' }))
        .rejects
        .toThrow('Image not found');
    });
  });
}); 