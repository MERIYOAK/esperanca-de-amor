const Admin = require('../models/Admin');
const asyncHandler = require('../utils/asyncHandler');

// Admin login
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Find admin by email
  const admin = await Admin.findOne({ email: email.toLowerCase() });
  
  if (!admin) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if account is locked
  if (admin.isLocked()) {
    return res.status(423).json({
      success: false,
      message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
    });
  }

  // Check if admin is active
  if (!admin.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated'
    });
  }

  // Verify password
  const isPasswordValid = await admin.comparePassword(password);
  
  if (!isPasswordValid) {
    // Increment failed login attempts
    await admin.incLoginAttempts();
    
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Reset login attempts on successful login
  await admin.resetLoginAttempts();

  // Generate JWT token
  const token = admin.generateAuthToken();

  // Update last login
  admin.lastLogin = new Date();
  await admin.save();

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin
      },
      token
    }
  });
});

// Get admin profile
const getAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin.id).select('-password');
  
  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin not found'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      admin
    }
  });
});

// Change admin password
const changeAdminPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password and new password are required'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters long'
    });
  }

  const admin = await Admin.findById(req.admin.id);
  
  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin not found'
    });
  }

  // Verify current password
  const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
  
  if (!isCurrentPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  admin.password = newPassword;
  await admin.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

// Admin logout
const adminLogout = asyncHandler(async (req, res) => {
  // In a JWT-based system, logout is typically handled client-side
  // by removing the token. However, we can implement a token blacklist
  // if needed for additional security.
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Get dashboard stats
const getDashboardStats = asyncHandler(async (req, res) => {
  // Import models for stats
  const Product = require('../models/Product');
  const Order = require('../models/Order');
  const User = require('../models/User');
  const Announcement = require('../models/Announcement');
  const Offer = require('../models/Offer');
  const Newsletter = require('../models/Newsletter');

  // Get counts
  const [
    totalProducts,
    totalOrders,
    totalUsers,
    totalAnnouncements,
    totalOffers,
    totalNewsletterSubscribers,
    recentOrders,
    activeAnnouncements
  ] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    User.countDocuments(),
    Announcement.countDocuments(),
    Offer.countDocuments({ isActive: true }),
    Newsletter.countDocuments({ isSubscribed: true }),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
    Announcement.find({ isActive: true, endDate: { $gte: new Date() } }).countDocuments()
  ]);

  // Calculate revenue stats
  const revenueStats = await Order.aggregate([
    {
      $match: {
        status: { $in: ['completed', 'delivered'] }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' }
      }
    }
  ]);

  const stats = {
    products: totalProducts,
    orders: totalOrders,
    users: totalUsers,
    announcements: totalAnnouncements,
    activeOffers: totalOffers,
    newsletterSubscribers: totalNewsletterSubscribers,
    activeAnnouncements,
    revenue: revenueStats[0] || { totalRevenue: 0, averageOrderValue: 0 },
    recentOrders
  };

  res.status(200).json({
    success: true,
    data: {
      stats
    }
  });
});

module.exports = {
  adminLogin,
  getAdminProfile,
  changeAdminPassword,
  adminLogout,
  getDashboardStats
}; 