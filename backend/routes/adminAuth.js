const express = require('express');
const router = express.Router();
const {
  adminLogin,
  getAdminProfile,
  changeAdminPassword,
  adminLogout,
  getDashboardStats
} = require('../controllers/adminAuthController');

const {
  getAnalytics,
  getSalesTrend,
  exportAnalytics
} = require('../controllers/adminAnalyticsController');

const {
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
} = require('../controllers/adminSettingsController');

const { protectAdmin } = require('../middleware/adminAuth');

// Public routes
router.post('/login', adminLogin);

// Protected routes
router.get('/profile', protectAdmin, getAdminProfile);
router.put('/change-password', protectAdmin, changeAdminPassword);
router.post('/logout', protectAdmin, adminLogout);
router.get('/dashboard-stats', protectAdmin, getDashboardStats);

// Analytics routes
router.get('/analytics', protectAdmin, getAnalytics);
router.get('/analytics/sales-trend', protectAdmin, getSalesTrend);
router.get('/analytics/export', protectAdmin, exportAnalytics);

// Settings routes
router.get('/settings', protectAdmin, getSettings);
router.put('/settings/profile', protectAdmin, updateProfileSettings);
router.put('/settings/security', protectAdmin, updateSecuritySettings);
router.put('/settings/notifications', protectAdmin, updateNotificationSettings);
router.put('/settings/system', protectAdmin, updateSystemSettings);
router.put('/settings/email', protectAdmin, updateEmailSettings);
router.post('/settings/email/test', protectAdmin, testEmailConfiguration);
router.get('/settings/system-info', protectAdmin, getSystemInfo);
router.post('/settings/backup', protectAdmin, backupDatabase);
router.post('/settings/clear-cache', protectAdmin, clearCache);

module.exports = router; 