const Offer = require('../models/Offer');
const Product = require('../models/Product');
const { deleteImageFromS3 } = require('../utils/s3Upload');
const asyncHandler = require('../utils/asyncHandler');
const XLSX = require('xlsx');

// @desc    Get all offers with pagination and filtering
// @route   GET /api/admin/offers
// @access  Private (Admin)
const getOffers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, status, type, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
  const filter = {};

  if (status && status !== 'all') {
    filter.isActive = status === 'active';
  }

  if (type && type !== 'all') {
    filter.type = type;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } }
    ];
  }

  const [offers, total] = await Promise.all([
    Offer.find(filter)
      .populate('applicableProducts', 'name price')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Offer.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: {
      offers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get single offer by ID
// @route   GET /api/admin/offers/:id
// @access  Private (Admin)
const getOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id)
    .populate('applicableProducts', 'name price images category');

  if (!offer) {
    return res.status(404).json({
      success: false,
      message: 'Offer not found'
    });
  }

  res.status(200).json({
    success: true,
    data: offer
  });
});

// @desc    Create new offer
// @route   POST /api/admin/offers
// @access  Private (Admin)
const createOffer = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    code,
    type,
    discountValue,
    discountType,
    minimumOrderAmount,
    maximumDiscountAmount,
    startDate,
    endDate,
    usageLimit,
    isActive
  } = req.body;

  // Handle applicableProducts array from form data
  let applicableProducts = [];
  if (req.body['applicableProducts[]']) {
    // If it's an array
    if (Array.isArray(req.body['applicableProducts[]'])) {
      applicableProducts = req.body['applicableProducts[]'];
    } else {
      // If it's a single value
      applicableProducts = [req.body['applicableProducts[]']];
    }
  }

  // Validate required fields
  if (!title || !code || !type || !discountValue || !discountType) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }

  // Check if offer code already exists
  const existingOffer = await Offer.findOne({ code: code.toUpperCase() });
  if (existingOffer) {
    return res.status(400).json({
      success: false,
      message: 'Offer code already exists'
    });
  }

  // Validate discount type and value
  if (discountType === 'percentage' && (discountValue < 1 || discountValue > 100)) {
    return res.status(400).json({
      success: false,
      message: 'Percentage discount must be between 1 and 100'
    });
  }

  if (discountType === 'fixed' && discountValue <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Fixed discount amount must be greater than 0'
    });
  }

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start >= end) {
    return res.status(400).json({
      success: false,
      message: 'End date must be after start date'
    });
  }

  // Prepare offer data
  const offerData = {
    title,
    description,
    code: code.toUpperCase(),
    type,
    discountValue: parseFloat(discountValue),
    discountType,
    minimumOrderAmount: parseFloat(minimumOrderAmount) || 0,
    maximumDiscountAmount: parseFloat(maximumDiscountAmount) || null,
    startDate: start,
    endDate: end,
    usageLimit: parseInt(usageLimit) || null,
    applicableProducts: applicableProducts,
    isActive: isActive !== undefined ? isActive : true,
    createdBy: req.admin._id // Set the admin user who created the offer
  };

  // Handle image upload if present
  if (req.file) {
    offerData.image = req.file.location; // S3 URL
  }

  const offer = await Offer.create(offerData);

  const populatedOffer = await Offer.findById(offer._id)
    .populate('applicableProducts', 'name price images category');

  res.status(201).json({
    success: true,
    message: 'Offer created successfully',
    data: populatedOffer
  });
});

// @desc    Update offer
// @route   PUT /api/admin/offers/:id
// @access  Private (Admin)
const updateOffer = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    code,
    type,
    discountValue,
    discountType,
    minimumOrderAmount,
    maximumDiscountAmount,
    startDate,
    endDate,
    usageLimit,
    applicableProducts,
    isActive
  } = req.body;

  const offer = await Offer.findById(req.params.id);
  if (!offer) {
    return res.status(404).json({
      success: false,
      message: 'Offer not found'
    });
  }

  // Check if code is being changed and if it already exists
  if (code && code !== offer.code) {
    const existingOffer = await Offer.findOne({ 
      code: code.toUpperCase(),
      _id: { $ne: req.params.id }
    });
    if (existingOffer) {
      return res.status(400).json({
        success: false,
        message: 'Offer code already exists'
      });
    }
  }

  // Validate discount type and value
  if (discountType === 'percentage' && (discountValue < 1 || discountValue > 100)) {
    return res.status(400).json({
      success: false,
      message: 'Percentage discount must be between 1 and 100'
    });
  }

  if (discountType === 'fixed' && discountValue <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Fixed discount amount must be greater than 0'
    });
  }

  // Validate dates if provided
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }
  }

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (code !== undefined) updateData.code = code.toUpperCase();
  if (type !== undefined) updateData.type = type;
  if (discountValue !== undefined) updateData.discountValue = discountValue;
  if (discountType !== undefined) updateData.discountType = discountType;
  if (minimumOrderAmount !== undefined) updateData.minimumOrderAmount = minimumOrderAmount;
  if (maximumDiscountAmount !== undefined) updateData.maximumDiscountAmount = maximumDiscountAmount;
  if (startDate !== undefined) updateData.startDate = new Date(startDate);
  if (endDate !== undefined) updateData.endDate = new Date(endDate);
  if (usageLimit !== undefined) updateData.usageLimit = usageLimit;
  if (applicableProducts !== undefined) updateData.applicableProducts = applicableProducts;
  if (isActive !== undefined) updateData.isActive = isActive;

  const updatedOffer = await Offer.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('applicableProducts', 'name price images category');

  res.status(200).json({
    success: true,
    message: 'Offer updated successfully',
    data: updatedOffer
  });
});

// @desc    Delete offer
// @route   DELETE /api/admin/offers/:id
// @access  Private (Admin)
const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  
  if (!offer) {
    return res.status(404).json({
      success: false,
      message: 'Offer not found'
    });
  }

  await Offer.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Offer deleted successfully'
  });
});

// @desc    Toggle offer status
// @route   PATCH /api/admin/offers/:id/toggle
// @access  Private (Admin)
const toggleOfferStatus = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  
  if (!offer) {
    return res.status(404).json({
      success: false,
      message: 'Offer not found'
    });
  }

  offer.isActive = !offer.isActive;
  await offer.save();

  const updatedOffer = await Offer.findById(req.params.id)
    .populate('applicableProducts', 'name price images category');

  res.status(200).json({
    success: true,
    message: `Offer ${offer.isActive ? 'activated' : 'deactivated'} successfully`,
    data: updatedOffer
  });
});

// @desc    Get offer statistics
// @route   GET /api/admin/offers/stats
// @access  Private (Admin)
const getOfferStats = asyncHandler(async (req, res) => {
  const [totalOffers, activeOffers, inactiveOffers, expiringOffers] = await Promise.all([
    Offer.countDocuments(),
    Offer.countDocuments({ isActive: true }),
    Offer.countDocuments({ isActive: false }),
    Offer.countDocuments({
      isActive: true,
      endDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
      }
    })
  ]);

  const stats = {
    totalOffers,
    activeOffers,
    inactiveOffers,
    expiringOffers,
    activePercentage: totalOffers > 0 ? (activeOffers / totalOffers) * 100 : 0
  };

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Export offers
// @route   GET /api/admin/offers/export
// @access  Private (Admin)
const exportOffers = asyncHandler(async (req, res) => {
  const { status, type } = req.query;
  
  const filter = {};
  if (status && status !== 'all') {
    filter.isActive = status === 'active';
  }
  if (type && type !== 'all') {
    filter.type = type;
  }

  const offers = await Offer.find(filter)
    .populate('applicableProducts', 'name price')
    .sort({ createdAt: -1 });

  // Create Excel data
  const excelData = offers.map(offer => ({
    title: offer.title || 'N/A',
    description: offer.description || 'N/A',
    code: offer.code || 'N/A',
    type: offer.type || 'N/A',
    discountType: offer.discountType || 'N/A',
    discountValue: offer.discountValue || 0,
    isActive: offer.isActive ? 'Yes' : 'No',
    startDate: offer.startDate ? new Date(offer.startDate).toISOString() : 'N/A',
    endDate: offer.endDate ? new Date(offer.endDate).toISOString() : 'N/A',
    applicableProducts: offer.applicableProducts?.map(p => p.name).join(', ') || 'All Products',
    minimumOrderAmount: offer.minimumOrderAmount || 'N/A',
    maximumDiscount: offer.maximumDiscountAmount || 'N/A',
    usageLimit: offer.usageLimit || 'Unlimited',
    createdAt: offer.createdAt ? new Date(offer.createdAt).toISOString() : 'N/A'
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const columnWidths = [
    { wch: 25 }, // title
    { wch: 40 }, // description
    { wch: 15 }, // code
    { wch: 15 }, // type
    { wch: 15 }, // discountType
    { wch: 12 }, // discountValue
    { wch: 10 }, // isActive
    { wch: 20 }, // startDate
    { wch: 20 }, // endDate
    { wch: 30 }, // applicableProducts
    { wch: 15 }, // minimumOrderAmount
    { wch: 15 }, // maximumDiscount
    { wch: 12 }, // usageLimit
    { wch: 20 }  // createdAt
  ];
  worksheet['!cols'] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Offers');

  // Generate Excel file buffer
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  // Set headers for Excel download
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=offers-export-${new Date().toISOString().split('T')[0]}.xlsx`);

  // Send the Excel file
  res.send(excelBuffer);
});

module.exports = {
  getOffers,
  getOffer,
  createOffer,
  updateOffer,
  deleteOffer,
  toggleOfferStatus,
  getOfferStats,
  exportOffers
}; 