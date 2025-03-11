const db = require('../config/database');
const fs = require('fs');
const path = require('path');

// Upload profile picture using base64 data
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
    
    // Get base64 image data from request body
    const { imageData } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ message: 'No image data provided' });
    }
    
    // Check if it's a valid base64 image
    if (!imageData.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Invalid image format' });
    }
    
    // Update user profile in database with the base64 data directly
    await db.query(
      'UPDATE users SET profile_picture = ?, updated_at = NOW() WHERE user_id = ?',
      [imageData, userId]
    );
    
    res.status(200).json({
      message: 'Profile picture updated successfully',
      profilePictureUrl: imageData
    });
    
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};