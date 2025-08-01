const Product = require('../models/Product');
const Category = require('../models/Category');
const { deleteImageFromS3, deleteMultipleImagesFromS3 } = require('../utils/s3Upload');
const asyncHandler = require('../utils/asyncHandler');

// Get all products with pagination and filters
const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const category = req.query.category || '';
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder || 'desc';

  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {};
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  if (category) {
    filter.category = category;
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Get products with pagination
  const products = await Product.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const total = await Product.countDocuments(filter);

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
      products,
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

// Get single product
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      product
    }
  });
});

// Create new product
const createProduct = asyncHandler(async (req, res) => {
  console.log('🔍 DEBUG: createProduct called');
  console.log('📋 Request body:', req.body);
  console.log('📋 Request files:', req.files);
  console.log('📋 Request headers:', req.headers);

  const {
    name,
    description,
    price,
    originalPrice,
    category,
    stock,
    tags,
    isActive
  } = req.body;

  console.log('📋 Extracted data:');
  console.log('  - name:', name);
  console.log('  - description:', description);
  console.log('  - price:', price);
  console.log('  - originalPrice:', originalPrice);
  console.log('  - category:', category);
  console.log('  - stock:', stock);
  console.log('  - tags:', tags);
  console.log('  - isActive:', isActive);

  // Validate required fields
  if (!name || !description || !price || !category) {
    console.log('❌ Validation failed:');
    console.log('  - name exists:', !!name);
    console.log('  - description exists:', !!description);
    console.log('  - price exists:', !!price);
    console.log('  - category exists:', !!category);
    
    return res.status(400).json({
      success: false,
      message: 'Name, description, price, and category are required'
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

  // Process images from uploaded files
  const processedImages = [];
  if (req.files && req.files.length > 0) {
    console.log('📋 Processing uploaded files:', req.files.length);
    processedImages.push(...req.files.map(file => ({
      url: file.location,
      alt: file.originalname
    })));
    console.log('📋 Processed images:', processedImages);
  } else {
    console.log('📋 No files uploaded');
  }

  // Parse tags if it's a string
  let parsedTags = [];
  if (tags) {
    console.log('📋 Original tags:', tags);
    if (typeof tags === 'string') {
      parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    } else if (Array.isArray(tags)) {
      parsedTags = tags;
    }
    console.log('📋 Parsed tags:', parsedTags);
  }

  // Generate slug from name
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  console.log('📋 Generated slug:', slug);

  const productData = {
    name,
    slug,
    description,
    price: parseFloat(price),
    originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
    category,
    stock: parseInt(stock) || 0,
    tags: parsedTags,
    images: processedImages,
    isActive: isActive === 'true' || isActive === true,
    createdBy: req.admin.id
  };

  console.log('📋 Final product data:', productData);

  try {
    const product = await Product.create(productData);
    console.log('✅ Product created successfully:', product._id);

    console.log('✅ Product created successfully');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product
      }
    });
  } catch (error) {
    console.error('❌ Error creating product:', error);
    console.error('❌ Error details:', error.message);
    if (error.code === 11000) {
      console.log('❌ Duplicate key error - slug already exists');
      return res.status(400).json({
        success: false,
        message: 'A product with this name already exists'
      });
    }
    throw error;
  }
});

// Update product
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  const {
    name,
    description,
    price,
    originalPrice,
    category,
    stock,
    tags,
    isActive
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
  let updatedImages = product.images || [];

  // Add new uploaded images
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(file => ({
      url: file.location,
      alt: file.originalname
    }));
    updatedImages.push(...newImages);
  }

  // Parse tags if it's a string
  let parsedTags = product.tags || [];
  if (tags) {
    if (typeof tags === 'string') {
      parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    } else if (Array.isArray(tags)) {
      parsedTags = tags;
    }
  }

  // Generate slug from name if name is being updated
  let slug = product.slug;
  if (name && name !== product.name) {
    slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  // Update product
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: name || product.name,
      slug: slug,
      description: description || product.description,
      price: price ? parseFloat(price) : product.price,
      originalPrice: originalPrice ? parseFloat(originalPrice) : product.originalPrice,
      category: category || product.category,
      stock: stock !== undefined ? parseInt(stock) : product.stock,
      tags: parsedTags,
      images: updatedImages,
      isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : product.isActive,
      updatedBy: req.admin.id
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: {
      product: updatedProduct
    }
  });
});

// Delete product
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Delete images from S3
  if (product.images && product.images.length > 0) {
    const imageUrls = product.images.map(img => img.url);
    await deleteMultipleImagesFromS3(imageUrls);
  }

  await Product.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// Bulk operations
const bulkDeleteProducts = asyncHandler(async (req, res) => {
  const { productIds } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Product IDs array is required'
    });
  }

  // Get products to delete their images
  const products = await Product.find({ _id: { $in: productIds } });
  
  // Delete images from S3
  for (const product of products) {
    if (product.images && product.images.length > 0) {
      const imageUrls = product.images.map(img => img.url);
      await deleteMultipleImagesFromS3(imageUrls);
    }
  }

  // Delete products
  const result = await Product.deleteMany({ _id: { $in: productIds } });

  res.status(200).json({
    success: true,
    message: `${result.deletedCount} products deleted successfully`
  });
});

// Update product stock
const updateProductStock = asyncHandler(async (req, res) => {
  const { stock } = req.body;

  if (stock === undefined || stock < 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid stock quantity is required'
    });
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { stock },
    { new: true, runValidators: true }
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Product stock updated successfully',
    data: {
      product
    }
  });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  updateProductStock
}; 