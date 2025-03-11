const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/auth');
const { headmanOnly, headmanOrAssistant } = require('../middleware/roleCheck');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, 'profile-' + req.userId + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function(req, file, cb) {
    // Accept only image files
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Public routes
// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Protected routes (require authentication)
// User profile routes - accessible to all authenticated users
router.get('/profile', verifyToken, authController.getUserProfile);
router.put('/profile', verifyToken, authController.updateUserProfile);

// Upload profile picture
router.post('/upload-profile-picture/:userId', verifyToken, upload.single('profilePicture'), (req, res) => {
  try {
    const userId = req.userId;
    const { userId: paramUserId } = req.params;
    
    // Check if the user is updating their own profile picture
    if (userId !== parseInt(paramUserId)) {
      return res.status(403).json({ message: 'You can only update your own profile picture' });
    }
    
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Get the file path
    const profilePicturePath = '/uploads/' + req.file.filename;
    
    // Update the user's profile picture in the database
    db.query(
      `UPDATE users SET
        profile_picture = ?,
        updated_at = NOW()
       WHERE user_id = ?`,
      [profilePicturePath, userId],
      (err, result) => {
        if (err) {
          console.error('Error updating profile picture:', err);
          return res.status(500).json({ message: 'Server error during profile picture update' });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        // Return the profile picture URL
        res.status(200).json({
          message: 'Profile picture uploaded successfully',
          profilePictureUrl: profilePicturePath
        });
      }
    );
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: 'Server error during profile picture upload' });
  }
});

// Get pending users - only headman or assistant can access
router.get('/pending-users', verifyToken, headmanOrAssistant, authController.getPendingUsers);

// Approve user - only headman or assistant can access
router.put('/approve/:userId', verifyToken, headmanOrAssistant, authController.approveUser);

// Get user by ID - only headman or assistant can access
router.get('/users/:userId', verifyToken, headmanOrAssistant, authController.getUserById);

// Update user - only headman or assistant can access
router.put('/users/:userId', verifyToken, headmanOrAssistant, authController.updateUser);

// Delete user - only headman can access
router.delete('/users/:userId', verifyToken, headmanOnly, authController.deleteUser);

// Reset password - only headman can access
router.put('/reset-password/:userId', verifyToken, headmanOnly, authController.resetPassword);

// Get pending users count - only headman or assistant can access
router.get('/pending-users-count', verifyToken, headmanOrAssistant, authController.getPendingUsersCount);

// Get all users - only headman or assistant can access
router.get('/users', verifyToken, headmanOrAssistant, authController.getAllUsers);

module.exports = router;const express = require('express');
