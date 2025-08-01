const express = require('express');
const router = express.Router();
const {
  subscribeToNewsletter,
  confirmSubscription,
  unsubscribeFromNewsletter
} = require('../controllers/newsletterController');

// Public newsletter routes
router.post('/subscribe', subscribeToNewsletter);
router.get('/confirm/:token', confirmSubscription);
router.get('/unsubscribe', unsubscribeFromNewsletter);

module.exports = router; 