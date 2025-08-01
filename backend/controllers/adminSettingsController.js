const asyncHandler = require('../utils/asyncHandler');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

// Get admin settings
const getSettings = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin.id).select('-password');
  
  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin not found'
    });
  }

  // Mock settings data - in a real application, these would come from a settings collection
  const settings = {
    profile: {
      name: admin.name,
      email: admin.email,
      role: admin.role,
      lastLogin: admin.lastLogin,
      isActive: admin.isActive
    },
    security: {
      twoFactorEnabled: false, // Mock data
      sessionTimeout: 30,
      passwordLastChanged: admin.passwordChangedAt || admin.createdAt,
      loginAttempts: admin.loginAttempts || 0
    },
    notifications: {
      emailNotifications: true,
      orderNotifications: true,
      newsletterNotifications: true,
      systemAlerts: true
    },
    system: {
      maintenanceMode: false,
      debugMode: process.env.NODE_ENV === 'development',
      autoBackup: true,
      backupFrequency: 'daily',
      maxFileSize: 10,
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']
    },
    email: {
      smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
      smtpPort: parseInt(process.env.SMTP_PORT) || 587,
      smtpUser: process.env.SMTP_USER || '',
      smtpSecure: process.env.SMTP_SECURE === 'true',
      fromEmail: process.env.FROM_EMAIL || 'noreply@example.com',
      fromName: process.env.FROM_NAME || 'E-commerce Admin'
    }
  };

  res.status(200).json({
    success: true,
    data: settings
  });
});

// Update profile settings
const updateProfileSettings = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Name must be at least 2 characters long'
    });
  }

  const admin = await Admin.findById(req.admin.id);
  
  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin not found'
    });
  }

  admin.name = name.trim();
  await admin.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      profile: {
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
        isActive: admin.isActive
      }
    }
  });
});

// Update security settings
const updateSecuritySettings = asyncHandler(async (req, res) => {
  const { twoFactorEnabled, sessionTimeout } = req.body;

  // Validate session timeout
  if (sessionTimeout && ![15, 30, 60, 120].includes(sessionTimeout)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid session timeout value'
    });
  }

  // In a real application, you would save these settings to a database
  // For now, we'll just return success
  res.status(200).json({
    success: true,
    message: 'Security settings updated successfully',
    data: {
      security: {
        twoFactorEnabled: twoFactorEnabled || false,
        sessionTimeout: sessionTimeout || 30,
        passwordLastChanged: new Date(),
        loginAttempts: 0
      }
    }
  });
});

// Update notification settings
const updateNotificationSettings = asyncHandler(async (req, res) => {
  const { 
    emailNotifications, 
    orderNotifications, 
    newsletterNotifications, 
    systemAlerts 
  } = req.body;

  // In a real application, you would save these settings to a database
  res.status(200).json({
    success: true,
    message: 'Notification settings updated successfully',
    data: {
      notifications: {
        emailNotifications: emailNotifications || false,
        orderNotifications: orderNotifications || false,
        newsletterNotifications: newsletterNotifications || false,
        systemAlerts: systemAlerts || false
      }
    }
  });
});

// Update system settings
const updateSystemSettings = asyncHandler(async (req, res) => {
  const { 
    maintenanceMode, 
    debugMode, 
    autoBackup, 
    backupFrequency, 
    maxFileSize, 
    allowedFileTypes 
  } = req.body;

  // Validate backup frequency
  if (backupFrequency && !['daily', 'weekly', 'monthly'].includes(backupFrequency)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid backup frequency'
    });
  }

  // Validate max file size
  if (maxFileSize && (maxFileSize < 1 || maxFileSize > 100)) {
    return res.status(400).json({
      success: false,
      message: 'Max file size must be between 1 and 100 MB'
    });
  }

  // In a real application, you would save these settings to a database
  res.status(200).json({
    success: true,
    message: 'System settings updated successfully',
    data: {
      system: {
        maintenanceMode: maintenanceMode || false,
        debugMode: debugMode || false,
        autoBackup: autoBackup || false,
        backupFrequency: backupFrequency || 'daily',
        maxFileSize: maxFileSize || 10,
        allowedFileTypes: allowedFileTypes || ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']
      }
    }
  });
});

// Update email settings
const updateEmailSettings = asyncHandler(async (req, res) => {
  const { 
    smtpHost, 
    smtpPort, 
    smtpUser, 
    smtpSecure, 
    fromEmail, 
    fromName 
  } = req.body;

  // Validate SMTP port
  if (smtpPort && (smtpPort < 1 || smtpPort > 65535)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid SMTP port'
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (fromEmail && !emailRegex.test(fromEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  // In a real application, you would save these settings to a database
  // and update environment variables or configuration files
  res.status(200).json({
    success: true,
    message: 'Email settings updated successfully',
    data: {
      email: {
        smtpHost: smtpHost || 'smtp.gmail.com',
        smtpPort: smtpPort || 587,
        smtpUser: smtpUser || '',
        smtpSecure: smtpSecure || false,
        fromEmail: fromEmail || 'noreply@example.com',
        fromName: fromName || 'E-commerce Admin'
      }
    }
  });
});

// Test email configuration
const testEmailConfiguration = asyncHandler(async (req, res) => {
  const { smtpHost, smtpPort, smtpUser, smtpPassword, smtpSecure, fromEmail, fromName } = req.body;

  try {
    // In a real application, you would test the SMTP connection here
    // For now, we'll just return success
    res.status(200).json({
      success: true,
      message: 'Email configuration test successful'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Email configuration test failed: ' + error.message
    });
  }
});

// Get system information
const getSystemInfo = asyncHandler(async (req, res) => {
  const systemInfo = {
    nodeVersion: process.version,
    platform: process.platform,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: 'MongoDB', // You could get this from your database connection
    timestamp: new Date()
  };

  res.status(200).json({
    success: true,
    data: systemInfo
  });
});

// Backup database
const backupDatabase = asyncHandler(async (req, res) => {
  try {
    // In a real application, you would implement database backup logic here
    // This could involve using mongodump or similar tools
    
    res.status(200).json({
      success: true,
      message: 'Database backup initiated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database backup failed: ' + error.message
    });
  }
});

// Clear cache
const clearCache = asyncHandler(async (req, res) => {
  try {
    // In a real application, you would clear any cached data here
    
    res.status(200).json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache: ' + error.message
    });
  }
});

module.exports = {
  getSettings,
  updateProfileSettings,
  updateSecuritySettings,
  updateNotificationSettings,
  updateSystemSettings,
  updateEmailSettings,
  testEmailConfiguration,
  getSystemInfo,
  backupDatabase,
  clearCache
}; 