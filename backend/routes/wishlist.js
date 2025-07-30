const express = require('express');
const { body } = require('express-validator');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlistItem,
  getWishlistCount
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateAddToWishlist = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID format')
];

// All routes require authentication
router.use(protect);

// @route   GET /api/wishlist
// @desc    Get user wishlist
// @access  Private
router.get('/', getWishlist);

// @route   POST /api/wishlist/add
// @desc    Add item to wishlist
// @access  Private
router.post('/add', validateAddToWishlist, addToWishlist);

// @route   DELETE /api/wishlist/clear
// @desc    Clear wishlist
// @access  Private
router.delete('/clear', clearWishlist);

// @route   GET /api/wishlist/check/:productId
// @desc    Check if product is in wishlist
// @access  Private
router.get('/check/:productId', checkWishlistItem);

// @route   GET /api/wishlist/count
// @desc    Get wishlist count
// @access  Private
router.get('/count', getWishlistCount);

// @route   DELETE /api/wishlist/:itemId
// @desc    Remove item from wishlist
// @access  Private
router.delete('/:itemId', removeFromWishlist);

module.exports = router; 