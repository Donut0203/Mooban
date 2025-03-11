const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/auth');
const { headmanOnly, headmanOrAssistant } = require('../middleware/roleCheck');

// Public routes
// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Protected routes (require authentication)
// Get user profile - accessible to all authenticated users
router.get('/profile', verifyToken, authController.getUserProfile);

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

module.exports = router;
