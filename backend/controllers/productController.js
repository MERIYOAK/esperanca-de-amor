const Product = require('../models/Product');
const Category = require('../models/Category');
const { deleteFileFromS3, deleteMultipleFilesFromS3 } = require('../middleware/upload');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured,
      onSale
    } = req.query;

    const query = { isActive: true };

    // Category filter
    if (category) {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Featured filter
    if (featured === 'true') {
      query.featured = true;
    }

    // On sale filter
    if (onSale === 'true') {
      query.isOnSale = true;
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalProducts: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      shortDescription,
      price,
      originalPrice,
      category,
      stock,
      sku,
      weight,
      dimensions,
      tags,
      isOnSale,
      discount,
      featured
    } = req.body;

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if product with same slug exists
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this name already exists'
      });
    }

    // Process images from request
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        images.push({
          url: file.location,
          alt: file.originalname,
          isPrimary: index === 0
        });
      });
    }

    const product = await Product.create({
      name,
      slug,
      description,
      shortDescription,
      price,
      originalPrice,
      category,
      stock,
      sku,
      weight,
      dimensions,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      isOnSale,
      discount,
      featured,
      images
    });

    const populatedProduct = await Product.findById(product._id);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product: populatedProduct }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      shortDescription,
      price,
      originalPrice,
      category,
      stock,
      sku,
      weight,
      dimensions,
      tags,
      isOnSale,
      discount,
      featured
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Generate new slug if name changed
    if (name && name !== product.name) {
      const newSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      // Check if new slug exists
      const existingProduct = await Product.findOne({ slug: newSlug, _id: { $ne: product._id } });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with this name already exists'
        });
      }
      
      product.slug = newSlug;
    }

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (shortDescription) product.shortDescription = shortDescription;
    if (price) product.price = price;
    if (originalPrice !== undefined) product.originalPrice = originalPrice;
    if (category) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (sku) product.sku = sku;
    if (weight !== undefined) product.weight = weight;
    if (dimensions) product.dimensions = dimensions;
    if (tags) product.tags = tags.split(',').map(tag => tag.trim());
    if (typeof isOnSale === 'boolean') product.isOnSale = isOnSale;
    if (discount !== undefined) product.discount = discount;
    if (typeof featured === 'boolean') product.featured = featured;

    // Process new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: file.location,
        alt: file.originalname,
        isPrimary: index === 0
      }));

      // Delete old images from S3
      if (product.images.length > 0) {
        const oldImageUrls = product.images.map(img => img.url);
        await deleteMultipleFilesFromS3(oldImageUrls);
      }

      product.images = newImages;
    }

    await product.save();

    const updatedProduct = await Product.findById(product._id);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updatedProduct }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete images from S3
    if (product.images.length > 0) {
      const imageUrls = product.images.map(img => img.url);
      await deleteMultipleFilesFromS3(imageUrls);
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({ 
      isActive: true, 
      featured: true 
    })
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { products }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get products on sale
// @route   GET /api/products/sale
// @access  Public
const getProductsOnSale = async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({ 
      isActive: true, 
      isOnSale: true 
    })
      .limit(parseInt(limit))
      .sort({ discount: -1 });

    res.status(200).json({
      success: true,
      data: { products }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
const searchProducts = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const products = await Product.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    })
      .limit(parseInt(limit))
      .sort({ rating: -1 });

    res.status(200).json({
      success: true,
      data: { products }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsOnSale,
  searchProducts
}; 