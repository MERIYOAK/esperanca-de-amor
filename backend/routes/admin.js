const express = require('express');
const router = express.Router();
const { protectAdmin, authorizeAdmin } = require('../middleware/adminAuth');
const { uploadSingle, uploadMultiple, uploadSingleFile } = require('../utils/s3Upload');

// Import controllers
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  updateProductStock,
  exportProducts,
  importProducts
} = require('../controllers/adminProductController');

const {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  bulkDeleteAnnouncements,
  toggleAnnouncementStatus,
  getActiveAnnouncements,
  getAnnouncementStats,
  exportAnnouncements
} = require('../controllers/adminAnnouncementController');

const {
  getNewsletterSubscribers,
  getNewsletterSubscriber,
  sendNewsletterUpdate,
  exportSubscribers,
  updateSubscriberStatus,
  deleteSubscriber,
  bulkDeleteSubscribers,
  getNewsletterStats
} = require('../controllers/adminNewsletterController');

// Import existing offer controller
const {
  getOffers,
  getOffer,
  createOffer,
  updateOffer,
  deleteOffer,
  toggleOfferStatus,
  getOfferStats,
  exportOffers
} = require('../controllers/adminOfferController');

// Import PromoBanner controller
const {
  getPromoBanners,
  getPromoBanner,
  createPromoBanner,
  updatePromoBanner,
  deletePromoBanner,
  togglePromoBanner
} = require('../controllers/promoBannerController');

// Import Analytics controller
const {
  getAnalytics,
  getSalesTrend,
  exportAnalytics,
  exportSalesTrend
} = require('../controllers/adminAnalyticsController');

// Import Order controller
const {
  getOrders,
  getOrder,
  updateOrderStatus,
  getOrderStats,
  exportOrders
} = require('../controllers/adminOrderController');

// Import Customer controller
const {
  getCustomers,
  getCustomer,
  updateCustomerStatus,
  deleteCustomer,
  getCustomerStats,
  exportCustomers
} = require('../controllers/adminCustomerController');

// Import Settings controller
const {
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
} = require('../controllers/adminSettingsController');

// Public announcement route (for frontend) - NO AUTH REQUIRED
router.get('/announcements/public/active', getActiveAnnouncements);

// Apply admin protection to all routes EXCEPT the public announcement route
router.use(protectAdmin);

// Test endpoint to verify admin authentication
router.get('/test-auth', (req, res) => {
  res.json({
    success: true,
    message: 'Admin authentication working',
    admin: {
      id: req.admin._id,
      email: req.admin.email,
      role: req.admin.role
    }
  });
});

// Product Management Routes
router.get('/products', getProducts);
router.delete('/products/bulk', bulkDeleteProducts);
router.get('/products/export', exportProducts);
router.post('/products/import', uploadSingleFile('imports'), importProducts);
router.get('/products/:id', getProduct);
router.post('/products', uploadMultiple('products', 5), createProduct);
router.put('/products/:id', uploadMultiple('products', 5), updateProduct);
router.delete('/products/:id', deleteProduct);
router.patch('/products/:id/stock', updateProductStock);

// Announcement Management Routes
router.get('/announcements', getAnnouncements);
router.get('/announcements/stats', getAnnouncementStats);
router.get('/announcements/export', exportAnnouncements);
router.get('/announcements/:id', getAnnouncement);
router.post('/announcements', uploadMultiple('announcements', 3), createAnnouncement);
router.put('/announcements/:id', uploadMultiple('announcements', 3), updateAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);
router.delete('/announcements/bulk', bulkDeleteAnnouncements);
router.patch('/announcements/:id/toggle', toggleAnnouncementStatus);

// Offer Management Routes
router.get('/offers', getOffers);
router.get('/offers/export', exportOffers);
router.get('/offers/stats', getOfferStats);
router.get('/offers/:id', getOffer);
router.post('/offers', uploadSingle('offers'), createOffer);
router.put('/offers/:id', uploadSingle('offers'), updateOffer);
router.delete('/offers/:id', deleteOffer);
router.patch('/offers/:id/toggle', toggleOfferStatus);

// Newsletter Management Routes
router.get('/newsletter/subscribers', getNewsletterSubscribers);
router.get('/newsletter/export', exportSubscribers);
router.get('/newsletter/stats', getNewsletterStats);
router.get('/newsletter/subscribers/:id', getNewsletterSubscriber);
router.post('/newsletter/send', sendNewsletterUpdate);
router.patch('/newsletter/subscribers/:id/status', updateSubscriberStatus);
router.delete('/newsletter/subscribers/:id', deleteSubscriber);
router.delete('/newsletter/subscribers/bulk', bulkDeleteSubscribers);

// PromoBanner Management Routes
router.get('/promo-banners', getPromoBanners);
router.get('/promo-banners/:id', getPromoBanner);
router.post('/promo-banners', createPromoBanner);
router.put('/promo-banners/:id', updatePromoBanner);
router.delete('/promo-banners/:id', deletePromoBanner);
router.patch('/promo-banners/:id/toggle', togglePromoBanner);

// Analytics Routes
router.get('/analytics', getAnalytics);
router.get('/analytics/sales-trend', getSalesTrend);
router.get('/analytics/sales-trend/export', exportSalesTrend);
router.get('/analytics/export', exportAnalytics);

// Order Management Routes
router.get('/orders', getOrders);
router.get('/orders/export', exportOrders);
router.get('/orders/stats', getOrderStats);
router.get('/orders/:id', getOrder);
router.patch('/orders/:id/status', updateOrderStatus);

// Customer Management Routes
router.get('/customers', getCustomers);
router.get('/customers/export', exportCustomers);
router.get('/customers/stats', getCustomerStats);
router.get('/customers/:id', getCustomer);
router.patch('/customers/:id/status', updateCustomerStatus);
router.delete('/customers/:id', deleteCustomer);

// Settings Management Routes
router.get('/settings', getSettings);
router.put('/settings/profile', updateProfileSettings);
router.put('/settings/security', updateSecuritySettings);
router.put('/settings/notifications', updateNotificationSettings);
router.put('/settings/system', updateSystemSettings);
router.put('/settings/email', updateEmailSettings);
router.post('/settings/email/test', testEmailConfiguration);
router.get('/settings/test', testSettingsEndpoint);
router.get('/settings/system-info', getSystemInfo);
router.post('/settings/backup', backupDatabase);
router.post('/settings/clear-cache', clearCache);

module.exports = router; 