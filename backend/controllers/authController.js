const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { deleteFileFromS3 } = require('../middleware/upload');
const asyncHandler = require('../utils/asyncHandler');
const { verifyGoogleToken, verifyGoogleAccessToken } = require('../utils/googleAuth');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Google OAuth Login/Register
// @route   POST /api/auth/google
// @access  Public
const googleAuth = asyncHandler(async (req, res, next) => {
  console.log('=== GOOGLE AUTH REQUEST ===');
  console.log('Token type:', req.body.tokenType);
  console.log('Token provided:', req.body.token ? '***yes***' : '***no***');

  const { token, tokenType, profileImage } = req.body;

  if (!token || !tokenType) {
    console.log('❌ Missing token or token type');
    return res.status(400).json({
      success: false,
      message: 'Google token and token type are required'
    });
  }

  // Verify Google token
  let googleData;
  if (tokenType === 'idToken') {
    const result = await verifyGoogleToken(token);
    if (!result.success) {
      console.log('❌ Google ID token verification failed');
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token'
      });
    }
    googleData = result.data;
  } else if (tokenType === 'accessToken') {
    const result = await verifyGoogleAccessToken(token);
    if (!result.success) {
      console.log('❌ Google access token verification failed');
      return res.status(401).json({
        success: false,
        message: 'Invalid Google access token'
      });
    }
    googleData = result.data;
  } else {
    console.log('❌ Invalid token type');
    return res.status(400).json({
      success: false,
      message: 'Invalid token type. Use "idToken" or "accessToken"'
    });
  }

  console.log('✅ Google token verified for:', googleData.email);

  // Check if user exists
  let user = await User.findOne({ 
    $or: [
      { googleId: googleData.googleId },
      { email: googleData.email }
    ]
  });

  if (user) {
    // User exists - update last login and Google ID if needed
    console.log('✅ Existing user found:', user.name);
    
    if (!user.googleId) {
      user.googleId = googleData.googleId;
    }
    
    user.lastLogin = new Date();
    await user.save();
    
    console.log('✅ User login successful');
  } else {
    // Create new user
    console.log('🆕 Creating new user for:', googleData.email);
    
    const userData = {
      name: googleData.name,
      email: googleData.email,
      googleId: googleData.googleId,
      avatar: profileImage || googleData.picture // Use custom profile image if provided
    };

    user = await User.create(userData);
    console.log('✅ New user created:', user.name);
  }

  // Generate JWT token
  const jwtToken = generateToken(user._id);
  console.log('✅ JWT token generated');

  console.log('=== GOOGLE AUTH COMPLETED ===');

  res.status(200).json({
    success: true,
    message: user.googleId ? 'Login successful' : 'Account created successfully',
    data: {
      user: user.getProfile(),
      token: jwtToken,
      isNewUser: !user.googleId
    }
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      user: user.getProfile()
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone, address } = req.body;

  // Check if name is being changed and if it's already taken
  if (name && name !== req.user.name) {
    const existingUser = await User.findOne({ name });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Name is already taken'
      });
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, address },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: user.getProfile()
    }
  });
});

// @desc    Update profile picture
// @route   PUT /api/auth/profile-picture
// @access  Private
const updateProfilePicture = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a profile picture'
    });
  }

  console.log('New profile picture uploaded:', req.file.location);
  
  // Delete old profile picture if exists
  if (user.avatar) {
    console.log('Deleting old profile picture:', user.avatar);
    await deleteFileFromS3(user.avatar);
  }

  // Update user with new avatar
  user.avatar = req.file.location;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile picture updated successfully',
    data: {
      user: user.getProfile()
    }
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await User.countDocuments();

  const users = await User.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: users.length,
    pagination,
    data: {
      users: users.map(user => user.getProfile())
    }
  });
});

// @desc    Update user (Admin only)
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, email, role, isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    id,
    { name, email, role, isActive },
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: {
      user: user.getProfile()
    }
  });
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'You cannot delete your own account'
    });
  }

  // Delete profile picture if exists
  if (user.avatar) {
    console.log('Deleting user profile picture:', user.avatar);
    await deleteFileFromS3(user.avatar);
  }

  await User.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

module.exports = {
  googleAuth,
  logout,
  getMe,
  updateProfile,
  updateProfilePicture,
  getUsers,
  updateUser,
  deleteUser
}; 