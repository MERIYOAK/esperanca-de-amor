const express = require('express');
const router = express.Router();
const { protectAdmin, authorizeAdmin } = require('../middleware/adminAuth');
const { uploadSingle, uploadMultiple } = require('../utils/s3Upload');

// Import controllers
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  updateProductStock
} = require('../controllers/adminProductController');

const {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  bulkDeleteAnnouncements,
  toggleAnnouncementStatus,
  getActiveAnnouncements
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
  deleteOffer
} = require('../controllers/offerController');

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
  exportAnalytics
} = require('../controllers/adminAnalyticsController');

// Import Order controller
const {
  getOrders,
  getOrder,
  updateOrderStatus,
  getOrderStats,
  exportOrders
} = require('../controllers/adminOrderController');

// Public announcement route (for frontend) - NO AUTH REQUIRED
router.get('/announcements/public/active', getActiveAnnouncements);

// Apply admin protection to all routes EXCEPT the public announcement route
router.use(protectAdmin);

// Product Management Routes
router.get('/products', getProducts);
router.get('/products/:id', getProduct);
router.post('/products', uploadMultiple('products', 5), createProduct);
router.put('/products/:id', uploadMultiple('products', 5), updateProduct);
router.delete('/products/:id', deleteProduct);
router.delete('/products/bulk', bulkDeleteProducts);
router.patch('/products/:id/stock', updateProductStock);

// Announcement Management Routes
router.get('/announcements', getAnnouncements);
router.get('/announcements/:id', getAnnouncement);
router.post('/announcements', uploadMultiple('announcements', 3), createAnnouncement);
router.put('/announcements/:id', uploadMultiple('announcements', 3), updateAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);
router.delete('/announcements/bulk', bulkDeleteAnnouncements);
router.patch('/announcements/:id/toggle', toggleAnnouncementStatus);

// Offer Management Routes
router.get('/offers', getOffers);
router.get('/offers/:id', getOffer);
router.post('/offers', uploadSingle('offers'), createOffer);
router.put('/offers/:id', uploadSingle('offers'), updateOffer);
router.delete('/offers/:id', deleteOffer);

// Newsletter Management Routes
router.get('/newsletter/subscribers', getNewsletterSubscribers);
router.get('/newsletter/subscribers/:id', getNewsletterSubscriber);
router.post('/newsletter/send', sendNewsletterUpdate);
router.get('/newsletter/export', exportSubscribers);
router.patch('/newsletter/subscribers/:id/status', updateSubscriberStatus);
router.delete('/newsletter/subscribers/:id', deleteSubscriber);
router.delete('/newsletter/subscribers/bulk', bulkDeleteSubscribers);
router.get('/newsletter/stats', getNewsletterStats);

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
router.get('/analytics/export', exportAnalytics);

// Order Management Routes
router.get('/orders', getOrders);
router.get('/orders/:id', getOrder);
router.patch('/orders/:id/status', updateOrderStatus);
router.get('/orders/stats', getOrderStats);
router.get('/orders/export', exportOrders);

module.exports = router; 