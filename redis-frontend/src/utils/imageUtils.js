/**
 * Formats the image URL from a file path
 * @param {string} profileImage - The file path or URL of the image
 * @returns {string|null} The formatted URL or null if no path provided
 */
export const getImageUrl = (profileImage) => {
  if (!profileImage) return null;
  
  // If the profile image is already a full URL, return it
  if (profileImage.startsWith('http://') || profileImage.startsWith('https://')) {
    return profileImage;
  }
  
  // Check if it's a relative path from the server
  if (profileImage.startsWith('/')) {
    return `http://localhost:5000${profileImage}`;
  }
  
  // Handle possible database stored paths with uploads/profiles prefix
  if (profileImage.includes('uploads/') || profileImage.includes('profiles/')) {
    return `http://localhost:5000/${profileImage}`;
  }
  
  // Default case: Extract filename from path (works with both Windows and Unix paths)
  const filename = profileImage.split(/[\\/]/).pop();
  return `http://localhost:5000/profiles/${filename}`;
}; 