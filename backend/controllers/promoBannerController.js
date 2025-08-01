const PromoBanner = require('../models/PromoBanner');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all promo banners (admin)
// @route   GET /api/admin/promo-banners
// @access  Private/Admin
const getPromoBanners = asyncHandler(async (req, res) => {
  const banners = await PromoBanner.find({}).sort({ sortOrder: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { banners }
  });
});

// @desc    Get active promo banners (public)
// @route   GET /api/public/promo-banners
// @access  Public
const getActivePromoBanners = asyncHandler(async (req, res) => {
  const now = new Date();
  const banners = await PromoBanner.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).sort({ sortOrder: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { banners }
  });
});

// @desc    Get single promo banner
// @route   GET /api/admin/promo-banners/:id
// @access  Private/Admin
const getPromoBanner = asyncHandler(async (req, res) => {
  const banner = await PromoBanner.findById(req.params.id);

  if (!banner) {
    return res.status(404).json({
      success: false,
      message: 'Promo banner not found'
    });
  }

  res.status(200).json({
    success: true,
    data: { banner }
  });
});

// @desc    Create promo banner
// @route   POST /api/admin/promo-banners
// @access  Private/Admin
const createPromoBanner = asyncHandler(async (req, res) => {
  const { text, icon, color, isActive, sortOrder, startDate, endDate } = req.body;

  const banner = await PromoBanner.create({
    text,
    icon,
    color,
    isActive: isActive !== undefined ? isActive : true,
    sortOrder: sortOrder || 0,
    startDate: startDate ? new Date(startDate) : new Date(),
    endDate: endDate ? new Date(endDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
  });

  res.status(201).json({
    success: true,
    message: 'Promo banner created successfully',
    data: { banner }
  });
});

// @desc    Update promo banner
// @route   PUT /api/admin/promo-banners/:id
// @access  Private/Admin
const updatePromoBanner = asyncHandler(async (req, res) => {
  const { text, icon, color, isActive, sortOrder, startDate, endDate } = req.body;

  const banner = await PromoBanner.findById(req.params.id);

  if (!banner) {
    return res.status(404).json({
      success: false,
      message: 'Promo banner not found'
    });
  }

  // Update fields
  if (text !== undefined) banner.text = text;
  if (icon !== undefined) banner.icon = icon;
  if (color !== undefined) banner.color = color;
  if (isActive !== undefined) banner.isActive = isActive;
  if (sortOrder !== undefined) banner.sortOrder = sortOrder;
  if (startDate !== undefined) banner.startDate = new Date(startDate);
  if (endDate !== undefined) banner.endDate = new Date(endDate);

  await banner.save();

  res.status(200).json({
    success: true,
    message: 'Promo banner updated successfully',
    data: { banner }
  });
});

// @desc    Delete promo banner
// @route   DELETE /api/admin/promo-banners/:id
// @access  Private/Admin
const deletePromoBanner = asyncHandler(async (req, res) => {
  const banner = await PromoBanner.findById(req.params.id);

  if (!banner) {
    return res.status(404).json({
      success: false,
      message: 'Promo banner not found'
    });
  }

  await PromoBanner.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Promo banner deleted successfully'
  });
});

// @desc    Toggle promo banner active status
// @route   PATCH /api/admin/promo-banners/:id/toggle
// @access  Private/Admin
const togglePromoBanner = asyncHandler(async (req, res) => {
  const banner = await PromoBanner.findById(req.params.id);

  if (!banner) {
    return res.status(404).json({
      success: false,
      message: 'Promo banner not found'
    });
  }

  banner.isActive = !banner.isActive;
  await banner.save();

  res.status(200).json({
    success: true,
    message: `Promo banner ${banner.isActive ? 'activated' : 'deactivated'} successfully`,
    data: { banner }
  });
});

module.exports = {
  getPromoBanners,
  getActivePromoBanners,
  getPromoBanner,
  createPromoBanner,
  updatePromoBanner,
  deletePromoBanner,
  togglePromoBanner
}; 