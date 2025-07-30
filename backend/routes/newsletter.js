const express = require('express');
const { body } = require('express-validator');
const {
  subscribe,
  unsubscribe,
  getSubscribers,
  sendNewsletter,
  getNewsletterStats,
  updateSubscriber,
  deleteSubscriber
} = require('../controllers/newsletterController');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateSubscribe = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('preferences.promotions')
    .optional()
    .isBoolean()
    .withMessage('Promotions preference must be a boolean'),
  body('preferences.newProducts')
    .optional()
    .isBoolean()
    .withMessage('New products preference must be a boolean'),
  body('preferences.weeklyNewsletter')
    .optional()
    .isBoolean()
    .withMessage('Weekly newsletter preference must be a boolean')
];

const validateUnsubscribe = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const validateSendNewsletter = [
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Content must be between 10 and 10000 characters'),
  body('type')
    .optional()
    .isIn(['general', 'promotions', 'newProducts', 'weeklyNewsletter'])
    .withMessage('Valid newsletter type is required'),
  body('subscriberIds')
    .optional()
    .isArray()
    .withMessage('Subscriber IDs must be an array')
];

const validateUpdateSubscriber = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Preferences must be an object'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Active status must be a boolean')
];

// Public routes
router.post('/subscribe', validateSubscribe, subscribe);
router.post('/unsubscribe', validateUnsubscribe, unsubscribe);

// Admin routes
router.get('/subscribers', protect, isAdmin, getSubscribers);
router.post('/send', protect, isAdmin, validateSendNewsletter, sendNewsletter);
router.get('/stats', protect, isAdmin, getNewsletterStats);
router.put('/subscribers/:id', protect, isAdmin, validateUpdateSubscriber, updateSubscriber);
router.delete('/subscribers/:id', protect, isAdmin, deleteSubscriber);

module.exports = router; 