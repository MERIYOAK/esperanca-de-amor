const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const asyncHandler = require('../utils/asyncHandler');

// Protect admin routes
const protectAdmin = asyncHandler(async (req, res, next) => {
  console.log('🔐 Admin auth middleware - checking token...');
  
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('🔑 Token found in headers');
  } else {
    console.log('❌ No token found in headers');
  }

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified, admin ID:', decoded.id);
    
    // Check if admin exists and is active
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin) {
      console.log('❌ Admin not found in database');
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }

    if (!admin.isActive) {
      console.log('❌ Admin account is deactivated');
      return res.status(401).json({
        success: false,
        message: 'Admin account is deactivated'
      });
    }

    console.log('✅ Admin authenticated successfully:', admin.email);
    // Add admin to request object
    req.admin = admin;
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
});

// Authorize admin roles
const authorizeAdmin = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Admin authentication required.'
      });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: `Admin role '${req.admin.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

module.exports = {
  protectAdmin,
  authorizeAdmin
}; 