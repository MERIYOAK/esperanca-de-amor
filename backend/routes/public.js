const express = require('express');
const router = express.Router();
const { getActiveAnnouncements, getAnnouncement } = require('../controllers/adminAnnouncementController');
const { getActivePromoBanners } = require('../controllers/promoBannerController');
const { confirmSubscription } = require('../controllers/newsletterController');

// Public announcement routes (no authentication required)
router.get('/announcements/active', getActiveAnnouncements);
router.get('/announcements/:id', getAnnouncement);

// Public promo banner routes (no authentication required)
router.get('/promo-banners/active', getActivePromoBanners);

// Public newsletter routes (no authentication required)
router.post('/newsletter/confirm/:token', confirmSubscription);

module.exports = router; 