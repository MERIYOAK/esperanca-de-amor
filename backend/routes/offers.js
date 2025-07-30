const express = require('express');
const router = express.Router();
const {
  getOffers,
  getOffer,
  claimOffer,
  createOffer,
  updateOffer,
  deleteOffer
} = require('../controllers/offerController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getOffers);
router.get('/:id', getOffer);

// Protected routes (require authentication)
router.post('/claim', protect, claimOffer);

// Admin routes
router.post('/', protect, authorize('admin'), createOffer);
router.put('/:id', protect, authorize('admin'), updateOffer);
router.delete('/:id', protect, authorize('admin'), deleteOffer);

module.exports = router; 