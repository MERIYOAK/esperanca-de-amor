const express = require('express');
const { body } = require('express-validator');
const {
  googleAuth,
  logout,
  getMe,
  updateProfile,
  updateProfilePicture,
  getUsers,
  updateUser,
  deleteUser
} = require('../controllers/authController');
const { protect, isAdmin } = require('../middleware/auth');
const { uploadProfilePicture, handleProfileUploadError } = require('../middleware/upload');

const router = express.Router();

// Validation middleware
const validateGoogleAuth = [
  body('token')
    .notEmpty()
    .withMessage('Google token is required'),
  body('tokenType')
    .isIn(['idToken', 'accessToken'])
    .withMessage('Token type must be "idToken" or "accessToken"')
];

const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 characters')
];

// Public routes
router.post('/google', validateGoogleAuth, googleAuth);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, validateProfileUpdate, updateProfile);
router.put('/profile-picture', protect, uploadProfilePicture, handleProfileUploadError, updateProfilePicture);
router.post('/logout', protect, logout);

// Admin routes
router.get('/users', protect, isAdmin, getUsers);
router.put('/users/:id', protect, isAdmin, updateUser);
router.delete('/users/:id', protect, isAdmin, deleteUser);

module.exports = router; 