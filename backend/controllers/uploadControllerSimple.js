const db = require('../config/database');
const fs = require('fs');
const path = require('path');

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if user exists
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get the base64 image data from the request body
    const { imageData } = req.body;

    if (!imageData) {
      return res.status(400).json({ message: 'No image data provided' });
    }

    // Check if it's a valid base64 image (more permissive check)
    if (!imageData.includes('base64')) {
      return res.status(400).json({ message: 'Invalid image format: Base64 encoding required' });
    }

    // Extract the base64 data (remove the data:image/xxx;base64, prefix)
    // This regex is more permissive to handle various image formats
    const base64Data = imageData.replace(/^data:.*?;base64,/, '');

    // Create a unique filename
    const timestamp = Date.now();
    const filename = `profile_${userId}_${timestamp}.png`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save the image to the uploads directory
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, base64Data, 'base64');

    // Set the URL for the database
    const profilePictureUrl = `/uploads/${filename}`;
    
    // Update user profile in database
    await db.query(
      'UPDATE users SET profile_picture = ?, updated_at = NOW() WHERE user_id = ?',
      [profilePictureUrl, userId]
    );
    
    res.status(200).json({
      message: 'Profile picture updated successfully',
      profilePictureUrl
    });
    
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};