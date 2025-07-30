const express = require('express');
const { body } = require('express-validator');
const {
  getUserOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  markWhatsAppSent,
  getOrderStats,
  resendWhatsApp
} = require('../controllers/orderController');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateOrderStatusUpdate = [
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Valid order status is required'),
  body('estimatedDelivery')
    .optional()
    .isISO8601()
    .withMessage('Valid date format is required for estimated delivery')
];

const validateOrderCancellation = [
  body('reason')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Cancellation reason must be between 5 and 200 characters')
];

// All order routes require authentication
router.use(protect);

// User routes
router.get('/', getUserOrders);
router.get('/:id', getOrder);
router.put('/:id/cancel', validateOrderCancellation, cancelOrder);

// Admin routes
router.get('/admin/all', isAdmin, getAllOrders);
router.put('/:id/status', isAdmin, validateOrderStatusUpdate, updateOrderStatus);
router.put('/:id/whatsapp-sent', isAdmin, markWhatsAppSent);
router.get('/stats', isAdmin, getOrderStats);
router.post('/:id/resend-whatsapp', isAdmin, resendWhatsApp);

module.exports = router; 