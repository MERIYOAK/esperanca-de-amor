const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id })
    .populate({
      path: 'items.product',
      select: 'name price originalPrice images category rating isOnSale discount stock',
      populate: {
        path: 'category',
        select: 'name'
      }
    });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, items: [] });
  }

  res.status(200).json({
    success: true,
    data: wishlist
  });
});

// @desc    Add item to wishlist
// @route   POST /api/wishlist/add
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required'
    });
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Find or create wishlist
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, items: [] });
  }

  // Check if product is already in wishlist
  const existingItem = wishlist.items.find(item => 
    item.product.toString() === productId
  );

  if (existingItem) {
    return res.status(400).json({
      success: false,
      message: 'Product is already in your wishlist'
    });
  }

  // Add product to wishlist
  wishlist.items.push({ product: productId });
  wishlist.updatedAt = Date.now();
  await wishlist.save();

  // Populate product details
  await wishlist.populate({
    path: 'items.product',
    select: 'name price originalPrice images category rating isOnSale discount stock',
    populate: {
      path: 'category',
      select: 'name'
    }
  });

  res.status(201).json({
    success: true,
    message: 'Product added to wishlist',
    data: wishlist
  });
});

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:itemId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  if (!itemId) {
    return res.status(400).json({
      success: false,
      message: 'Item ID is required'
    });
  }

  const wishlist = await Wishlist.findOne({ user: req.user._id });
  
  if (!wishlist) {
    return res.status(404).json({
      success: false,
      message: 'Wishlist not found'
    });
  }

  // Find and remove the item
  const itemIndex = wishlist.items.findIndex(item => 
    item._id.toString() === itemId
  );

  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Item not found in wishlist'
    });
  }

  wishlist.items.splice(itemIndex, 1);
  wishlist.updatedAt = Date.now();
  await wishlist.save();

  // Populate product details
  await wishlist.populate({
    path: 'items.product',
    select: 'name price originalPrice images category rating isOnSale discount stock',
    populate: {
      path: 'category',
      select: 'name'
    }
  });

  res.status(200).json({
    success: true,
    message: 'Item removed from wishlist',
    data: wishlist
  });
});

// @desc    Clear wishlist
// @route   DELETE /api/wishlist/clear
// @access  Private
const clearWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  
  if (!wishlist) {
    return res.status(404).json({
      success: false,
      message: 'Wishlist not found'
    });
  }

  wishlist.items = [];
  wishlist.updatedAt = Date.now();
  await wishlist.save();

  res.status(200).json({
    success: true,
    message: 'Wishlist cleared successfully',
    data: wishlist
  });
});

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
const checkWishlistItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required'
    });
  }

  const wishlist = await Wishlist.findOne({ user: req.user._id });
  
  if (!wishlist) {
    return res.status(200).json({
      success: true,
      data: { isInWishlist: false }
    });
  }

  const isInWishlist = wishlist.items.some(item => 
    item.product.toString() === productId
  );

  res.status(200).json({
    success: true,
    data: { isInWishlist }
  });
});

// @desc    Get wishlist count
// @route   GET /api/wishlist/count
// @access  Private
const getWishlistCount = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  
  const count = wishlist ? wishlist.items.length : 0;

  res.status(200).json({
    success: true,
    data: { count }
  });
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlistItem,
  getWishlistCount
}; 