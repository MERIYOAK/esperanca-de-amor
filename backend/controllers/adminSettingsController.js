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
    smtpPassword,
    smtpSecure, 
    fromEmail, 
    fromName 
  } = req.body;

  console.log('🔍 Update email settings request body:', {
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPassword: smtpPassword ? '[HIDDEN]' : 'MISSING',
    smtpSecure,
    fromEmail,
    fromName
  });

  // Validate required fields
  if (!smtpHost || !smtpPort || !smtpUser) {
    console.log('❌ Missing required fields for update:', {
      smtpHost: !!smtpHost,
      smtpPort: !!smtpPort,
      smtpUser: !!smtpUser
    });
    return res.status(400).json({
      success: false,
      message: 'SMTP Host, Port, and Username are required'
    });
  }

  // Validate SMTP port
  if (smtpPort < 1 || smtpPort > 65535) {
    return res.status(400).json({
      success: false,
      message: 'Invalid SMTP port (must be between 1 and 65535)'
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

  // Test SMTP connection before saving
  try {
    const nodemailer = require('nodemailer');
    
    // Check if nodemailer is properly loaded
    if (!nodemailer || typeof nodemailer.createTransport !== 'function') {
      console.error('❌ Nodemailer not properly loaded:', typeof nodemailer);
      return res.status(500).json({
        success: false,
        message: 'Email service not available'
      });
    }
    
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPassword
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify connection configuration
    await transporter.verify();
    
    console.log('✅ SMTP connection verified successfully');
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    return res.status(400).json({
      success: false,
      message: `SMTP connection failed: ${error.message}`
    });
  }

  // In a real application, you would save these settings to a database
  // and update environment variables or configuration files
  res.status(200).json({
    success: true,
    message: 'Email settings updated successfully',
    data: {
      email: {
        smtpHost: smtpHost,
        smtpPort: smtpPort,
        smtpUser: smtpUser,
        smtpSecure: smtpSecure || false,
        fromEmail: fromEmail || smtpUser,
        fromName: fromName || 'E-commerce Admin'
      }
    }
  });
});

// Simple test endpoint
const testSettingsEndpoint = asyncHandler(async (req, res) => {
  console.log('🔍 Test settings endpoint reached');
  
  // Test nodemailer availability
  try {
    const nodemailer = require('nodemailer');
    const nodemailerTest = {
      available: !!nodemailer,
      createTransport: typeof nodemailer.createTransport === 'function',
      version: nodemailer.version || 'unknown'
    };
    console.log('🔍 Nodemailer test:', nodemailerTest);
    
    res.status(200).json({
      success: true,
      message: 'Settings endpoint is working',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      nodemailer: nodemailerTest
    });
  } catch (error) {
    console.error('❌ Nodemailer test failed:', error.message);
    res.status(200).json({
      success: true,
      message: 'Settings endpoint is working',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      nodemailer: { available: false, error: error.message }
    });
  }
});

// Test email configuration
const testEmailConfiguration = asyncHandler(async (req, res) => {
  console.log('🔍 Test email configuration endpoint reached');
  console.log('🔍 Request method:', req.method);
  console.log('🔍 Request URL:', req.url);
  console.log('🔍 Request body keys:', Object.keys(req.body || {}));
  
  const { smtpHost, smtpPort, smtpUser, smtpPassword, smtpSecure, fromEmail, fromName } = req.body;

  console.log('🔍 Test email configuration request body:', {
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPassword: smtpPassword ? '[HIDDEN]' : 'MISSING',
    smtpSecure,
    fromEmail,
    fromName
  });

  // Check if all required fields are present
  const missingFields = [];
  if (!smtpHost) missingFields.push('smtpHost');
  if (!smtpPort) missingFields.push('smtpPort');
  if (!smtpUser) missingFields.push('smtpUser');
  if (!smtpPassword) missingFields.push('smtpPassword');

  if (missingFields.length > 0) {
    console.log('❌ Missing required fields:', missingFields);
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`
    });
  }

  // Validate SMTP port
  if (isNaN(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
    console.log('❌ Invalid SMTP port:', smtpPort);
    return res.status(400).json({
      success: false,
      message: 'Invalid SMTP port (must be between 1 and 65535)'
    });
  }

  try {
    const nodemailer = require('nodemailer');
    
    // Check if nodemailer is properly loaded
    if (!nodemailer || typeof nodemailer.createTransport !== 'function') {
      console.error('❌ Nodemailer not properly loaded:', typeof nodemailer);
      return res.status(500).json({
        success: false,
        message: 'Email service not available'
      });
    }
    
    console.log('🔍 Creating transporter with:', {
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      user: smtpUser,
      password: smtpPassword ? '[HIDDEN]' : 'MISSING'
    });
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPassword
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify connection
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified');

    // Send test email
    const testEmail = {
      from: `"${fromName || 'E-commerce Admin'}" <${fromEmail || smtpUser}>`,
      to: smtpUser, // Send to the admin email
      subject: 'Email Configuration Test - E-commerce Admin',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Configuration Test</h2>
          <p>This is a test email to verify your SMTP configuration is working correctly.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Configuration Details:</h3>
            <ul>
              <li><strong>SMTP Host:</strong> ${smtpHost}</li>
              <li><strong>SMTP Port:</strong> ${smtpPort}</li>
              <li><strong>Username:</strong> ${smtpUser}</li>
              <li><strong>Secure:</strong> ${smtpSecure ? 'Yes' : 'No'}</li>
              <li><strong>From Email:</strong> ${fromEmail || smtpUser}</li>
              <li><strong>From Name:</strong> ${fromName || 'E-commerce Admin'}</li>
            </ul>
          </div>
          <p style="color: #666; font-size: 12px;">
            This email was sent automatically by the E-commerce Admin Panel to test your email configuration.
          </p>
        </div>
      `
    };

    console.log('🔍 Sending test email...');
    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully:', info.messageId);

    res.status(200).json({
      success: true,
      message: 'Email configuration test successful! Test email sent.',
      data: {
        messageId: info.messageId,
        response: info.response
      }
    });
  } catch (error) {
    console.error('❌ Email configuration test failed:', error.message);
    res.status(400).json({
      success: false,
      message: `Email configuration test failed: ${error.message}`
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
  testSettingsEndpoint,
  getSystemInfo,
  backupDatabase,
  clearCache
}; 