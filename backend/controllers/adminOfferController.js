const Offer = require('../models/Offer');
const { deleteImageFromS3 } = require('../utils/s3Upload');
const asyncHandler = require('../utils/asyncHandler');

// Get all offers with pagination and filters (Admin)
const getOffers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const category = req.query.category || '';
  const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder || 'desc';

  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {};
  
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  if (category) {
    filter.category = category;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive;
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Get offers with pagination
  const offers = await Offer.find(filter)
    .populate('productIds', 'name price images')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const total = await Offer.countDocuments(filter);

  // Get categories for filter dropdown (hardcoded)
  const categories = [
    { name: 'Foodstuffs', _id: 'foodstuffs' },
    { name: 'Household items', _id: 'household-items' },
    { name: 'Beverages', _id: 'beverages' },
    { name: 'Electronics', _id: 'electronics' },
    { name: 'Construction materials', _id: 'construction-materials' },
    { name: 'Plastics', _id: 'plastics' },
    { name: 'Cosmetics', _id: 'cosmetics' },
    { name: 'Powder detergent', _id: 'powder-detergent' },
    { name: 'Liquid detergent', _id: 'liquid-detergent' },
    { name: 'Juices', _id: 'juices' },
    { name: 'Dental care', _id: 'dental-care' },
    { name: 'Beef', _id: 'beef' }
  ];

  res.status(200).json({
    success: true,
    data: {
      offers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      categories
    }
  });
});

// Get single offer (Admin)
const getOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id)
    .populate('productIds', 'name price images');

  if (!offer) {
    return res.status(404).json({
      success: false,
      message: 'Offer not found'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      offer
    }
  });
});

// Create new offer (Admin)
const createOffer = asyncHandler(async (req, res) => {
  console.log('🔍 DEBUG: createOffer called');
  console.log('📋 Request body:', req.body);
  console.log('📋 Request files:', req.files);
  console.log('📋 Request headers:', req.headers);

  const {
    title,
    description,
    discount,
    category,
    productIds,
    validFrom,
    validUntil,
    isActive,
    maxUses
  } = req.body;

  console.log('📋 Extracted data:');
  console.log('  - title:', title);
  console.log('  - description:', description);
  console.log('  - discount:', discount);
  console.log('  - category:', category);
  console.log('  - productIds:', productIds);
  console.log('  - validFrom:', validFrom);
  console.log('  - validUntil:', validUntil);
  console.log('  - isActive:', isActive);
  console.log('  - maxUses:', maxUses);
  console.log('  - req.admin:', req.admin);
  console.log('  - req.admin.id:', req.admin?.id);

  // Validate required fields
  if (!title || !description || !discount || !category || !validUntil) {
    console.log('❌ Validation failed:');
    console.log('  - title exists:', !!title);
    console.log('  - description exists:', !!description);
    console.log('  - discount exists:', !!discount);
    console.log('  - category exists:', !!category);
    console.log('  - validUntil exists:', !!validUntil);
    
    return res.status(400).json({
      success: false,
      message: 'Title, description, discount, category, and valid until date are required'
    });
  }

  console.log('✅ Validation passed');

  // Check if category exists (using hardcoded categories)
  console.log('🔍 Checking if category exists:', category);
  
  // Hardcoded categories that are allowed
  const allowedCategories = [
    'foodstuffs', 'household-items', 'beverages', 'electronics', 
    'construction-materials', 'plastics', 'cosmetics', 'powder-detergent', 
    'liquid-detergent', 'juices', 'dental-care', 'beef'
  ];
  
  if (!allowedCategories.includes(category)) {
    console.log('❌ Category not found in allowed list:', category);
    return res.status(400).json({
      success: false,
      message: 'Invalid category. Please select a valid category from the list.'
    });
  }

  console.log('✅ Category validation passed');

  // Process image from uploaded file
  let imageUrl = '';
  if (req.file) {
    console.log('📋 Processing uploaded file');
    imageUrl = req.file.location;
    console.log('📋 Image URL:', imageUrl);
    
    // Validate that it's an S3 URL
    if (!imageUrl.includes('cabindaretailshop.s3.amazonaws.com')) {
      console.log('❌ Invalid image URL - not from S3 bucket');
      return res.status(400).json({
        success: false,
        message: 'Invalid image URL. Only S3 bucket images are allowed.'
      });
    }
  } else {
    console.log('📋 No file uploaded - image will be null');
    // Don't set any placeholder - let the field be null/empty
    imageUrl = '';
  }

  // Parse productIds if it's a string
  let parsedProductIds = [];
  if (productIds) {
    console.log('📋 Original productIds:', productIds);
    if (typeof productIds === 'string') {
      try {
        // First try to parse as JSON
        const jsonParsed = JSON.parse(productIds);
        if (Array.isArray(jsonParsed)) {
          parsedProductIds = jsonParsed;
          console.log('📋 JSON parsed productIds:', parsedProductIds);
        } else {
          console.log('📋 productIds is not an array, treating as single ID');
          parsedProductIds = [jsonParsed];
        }
      } catch (error) {
        console.log('❌ Error parsing productIds as JSON:', error.message);
        // If JSON parsing fails, try string extraction
        const match = productIds.match(/"([^"]+)"/);
        if (match) {
          parsedProductIds = [match[1]];
          console.log('📋 Extracted productId from string:', parsedProductIds);
        } else {
          // If no quotes found, treat as single ID
          const cleanId = productIds.replace(/[\[\]"'\s]/g, '');
          if (cleanId) {
            parsedProductIds = [cleanId];
            console.log('📋 Cleaned single productId:', parsedProductIds);
          }
        }
      }
    } else if (Array.isArray(productIds)) {
      parsedProductIds = productIds;
    }
    console.log('📋 Final parsed productIds:', parsedProductIds);
  }

  const offerData = {
    title,
    description,
    discount: parseFloat(discount),
    category,
    productIds: parsedProductIds,
    validFrom: validFrom ? new Date(validFrom) : new Date(),
    validUntil: new Date(validUntil),
    isActive: isActive === 'true' || isActive === true,
    image: imageUrl,
    maxUses: maxUses ? parseInt(maxUses) : -1,
    createdBy: req.admin?.id || '688a6b647ff31ccbe6ff2f22' // Fallback to admin ID
  };

  console.log('📋 Final offer data:', offerData);

  try {
    const offer = await Offer.create(offerData);
    console.log('✅ Offer created successfully:', offer._id);
    console.log('📋 Saved offer image:', offer.image);

    const populatedOffer = await Offer.findById(offer._id)
      .populate('productIds', 'name price images');
    console.log('✅ Offer populated successfully');
    console.log('📋 Populated offer image:', populatedOffer.image);

    res.status(201).json({
      success: true,
      message: 'Offer created successfully',
      data: {
        offer: populatedOffer
      }
    });
  } catch (error) {
    console.error('❌ Error creating offer:', error);
    console.error('❌ Error details:', error.message);
    throw error;
  }
});

// Update offer (Admin)
const updateOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);

  if (!offer) {
    return res.status(404).json({
      success: false,
      message: 'Offer not found'
    });
  }

  const {
    title,
    description,
    discount,
    category,
    productIds,
    validFrom,
    validUntil,
    isActive,
    maxUses
  } = req.body;

  // Check if category exists if it's being updated
  if (category) {
    // Hardcoded categories that are allowed
    const allowedCategories = [
      'foodstuffs', 'household-items', 'beverages', 'electronics', 
      'construction-materials', 'plastics', 'cosmetics', 'powder-detergent', 
      'liquid-detergent', 'juices', 'dental-care', 'beef'
    ];
    
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Please select a valid category from the list.'
      });
    }
  }

  // Handle image updates
  let imageUrl = offer.image;

  // Add new uploaded image
  if (req.file) {
    imageUrl = req.file.location;
  }

  // Parse productIds if it's a string
  let parsedProductIds = offer.productIds;
  if (productIds) {
    if (typeof productIds === 'string') {
      try {
        parsedProductIds = JSON.parse(productIds);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product IDs format'
        });
      }
    } else if (Array.isArray(productIds)) {
      parsedProductIds = productIds;
    }
  }

  // Update offer
  const updatedOffer = await Offer.findByIdAndUpdate(
    req.params.id,
    {
      title: title || offer.title,
      description: description || offer.description,
      discount: discount ? parseFloat(discount) : offer.discount,
      category: category || offer.category,
      productIds: parsedProductIds,
      validFrom: validFrom ? new Date(validFrom) : offer.validFrom,
      validUntil: validUntil ? new Date(validUntil) : offer.validUntil,
      image: imageUrl,
      isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : offer.isActive,
      maxUses: maxUses ? parseInt(maxUses) : offer.maxUses,
      updatedBy: req.admin.id
    },
    { new: true, runValidators: true }
  ).populate('productIds', 'name price images');

  res.status(200).json({
    success: true,
    message: 'Offer updated successfully',
    data: {
      offer: updatedOffer
    }
  });
});

// Delete offer (Admin)
const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);

  if (!offer) {
    return res.status(404).json({
      success: false,
      message: 'Offer not found'
    });
  }

  // Delete image from S3
  if (offer.image) {
    await deleteImageFromS3(offer.image);
  }

  await Offer.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Offer deleted successfully'
  });
});

module.exports = {
  getOffers,
  getOffer,
  createOffer,
  updateOffer,
  deleteOffer
}; 