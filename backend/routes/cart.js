const express = require('express');
const { body } = require('express-validator');
const {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  checkout,
  getCartSummary
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateAddToCart = [
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer')
];

const validateUpdateCartItem = [
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer')
];

const validateCheckout = [
  body('shippingAddress.street')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),
  body('shippingAddress.city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('shippingAddress.phone')
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 characters'),
  body('paymentMethod')
    .isIn(['cash_on_delivery', 'bank_transfer', 'mobile_money'])
    .withMessage('Valid payment method is required'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

// All cart routes require authentication
router.use(protect);

// Cart operations
router.get('/', getCart);
router.get('/summary', getCartSummary);
router.post('/add', validateAddToCart, addToCart);
router.delete('/clear', clearCart);
router.delete('/:itemId', removeFromCart);
router.put('/:itemId', validateUpdateCartItem, updateCartItem);
router.post('/checkout', validateCheckout, checkout);

module.exports = router; 