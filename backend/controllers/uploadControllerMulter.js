const db = require('../config/database');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    const userId = req.params.userId;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `profile_${userId}_${timestamp}${ext}`);
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: fileFilter
}).single('profilePicture');

// Upload profile picture middleware
exports.uploadMiddleware = (req, res, next) => {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred
      return res.status(500).json({ message: `Unknown error: ${err.message}` });
    }
    // Everything went fine
    next();
  });
};

// Handle profile picture upload
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
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Get file path
    const filename = req.file.filename;
    const profilePictureUrl = `/uploads/${filename}`;
    
    // Update user profile in database
    await db.query(
      'UPDATE users SET profile_picture = ?, updated_at = NOW() WHERE user_id = ?',
      [profilePictureUrl, userId]
    );
    
    res.status(200).json({
      message: 'Profile picture uploaded successfully',
      profilePictureUrl
    });
    
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};