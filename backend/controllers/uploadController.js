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
    
    // Check if file was uploaded
    if (!req.files || !req.files.profilePicture) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const file = req.files.profilePicture;
    
    // Validate file type
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: 'Only image files are allowed' });
    }
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split('.').pop();
    const filename = `profile_${userId}_${timestamp}.${ext}`;
    
    // Define upload path
    const uploadPath = path.join(uploadsDir, filename);
    
    // Move file to upload directory
    file.mv(uploadPath, async (err) => {
      if (err) {
        console.error('File upload error:', err);
        return res.status(500).json({ message: 'Error uploading file' });
      }
      
      // Update user profile in database
      const profilePictureUrl = `/uploads/${filename}`;
      
      await db.query(
        'UPDATE users SET profile_picture = ?, updated_at = NOW() WHERE user_id = ?',
        [profilePictureUrl, userId]
      );
      
      res.status(200).json({
        message: 'Profile picture uploaded successfully',
        profilePictureUrl
      });
    });
    
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};const db = require('../config/database');
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
    
    // Check if file was uploaded
    if (!req.files || !req.files.profilePicture) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const file = req.files.profilePicture;
    
    // Validate file type
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: 'Only image files are allowed' });
    }
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split('.').pop();
    const filename = `profile_${userId}_${timestamp}.${ext}`;
    
    // Define upload path
    const uploadPath = path.join(uploadsDir, filename);
    
    // Move file to upload directory
    file.mv(uploadPath, async (err) => {
      if (err) {
        console.error('File upload error:', err);
        return res.status(500).json({ message: 'Error uploading file' });
      }
      
      // Update user profile in database
      const profilePictureUrl = `/uploads/${filename}`;
      
      await db.query(
        'UPDATE users SET profile_picture = ?, updated_at = NOW() WHERE user_id = ?',
        [profilePictureUrl, userId]
      );
      
      res.status(200).json({
        message: 'Profile picture uploaded successfully',
        profilePictureUrl
      });
    });
    
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};