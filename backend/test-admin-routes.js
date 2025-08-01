const express = require('express');
const app = express();

// Test the admin routes without S3
try {
  // Mock the S3 upload functions for testing
  const mockUploadSingle = () => (req, res, next) => next();
  const mockUploadMultiple = () => (req, res, next) => next();
  
  // Temporarily replace the S3 upload functions
  const originalS3Upload = require('./utils/s3Upload');
  require('./utils/s3Upload').uploadSingle = mockUploadSingle;
  require('./utils/s3Upload').uploadMultiple = mockUploadMultiple;
  
  const adminRoutes = require('./routes/admin');
  console.log('✅ Admin routes loaded successfully');
  
  console.log('\n🎉 Admin routes test completed!');
} catch (error) {
  console.error('❌ Error loading admin routes:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
} 