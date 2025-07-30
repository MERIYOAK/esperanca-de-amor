const Offer = require('../models/Offer');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const asyncHandler = require('../utils/asyncHandler');

// Get all active offers
const getOffers = asyncHandler(async (req, res) => {
  const offers = await Offer.find({ isActive: true })
    .populate('category', 'name')
    .populate('productIds', 'name price images')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      offers
    }
  });
});

// Get a specific offer
const getOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id)
    .populate('category', 'name')
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

// Claim an offer
const claimOffer = asyncHandler(async (req, res) => {
  const { offerId } = req.body;
  const userId = req.user.id;

  if (!offerId) {
    return res.status(400).json({
      success: false,
      message: 'Offer ID is required'
    });
  }

  const offer = await Offer.findById(offerId);
  
  if (!offer) {
    return res.status(404).json({
      success: false,
      message: 'Offer not found'
    });
  }

  if (!offer.isValid()) {
    return res.status(400).json({
      success: false,
      message: 'Offer is not valid or has expired'
    });
  }

  // Check if user already claimed this offer
  const alreadyClaimed = offer.claimedBy.some(claim => 
    claim.user.toString() === userId
  );

  if (alreadyClaimed) {
    return res.status(400).json({
      success: false,
      message: 'You have already claimed this offer'
    });
  }

  // Claim the offer
  await offer.claim(userId);

  // Add the first product from the offer to user's cart
  if (offer.productIds && offer.productIds.length > 0) {
    const firstProductId = offer.productIds[0];
    
    // Check if product exists
    const product = await Product.findById(firstProductId);
    if (!product) {
      return res.status(400).json({
        success: false,
        message: 'Product in offer not found'
      });
    }

    // Add to cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if product already in cart
    const existingItem = cart.items.find(item => 
      item.product.toString() === firstProductId.toString()
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({
        product: firstProductId,
        quantity: 1,
        price: product.price * (1 - offer.discount / 100) // Apply discount
      });
    }

    await cart.save();
  }

  res.status(200).json({
    success: true,
    message: 'Offer claimed successfully',
    data: {
      offer: {
        id: offer._id,
        title: offer.title,
        discount: offer.discount,
        productAdded: offer.productIds[0]
      }
    }
  });
});

// Create a new offer (Admin only)
const createOffer = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    discount,
    category,
    productIds,
    validUntil,
    image,
    maxUses
  } = req.body;

  const offer = await Offer.create({
    title,
    description,
    discount,
    category,
    productIds,
    validUntil: new Date(validUntil),
    image,
    maxUses: maxUses || -1
  });

  res.status(201).json({
    success: true,
    message: 'Offer created successfully',
    data: {
      offer
    }
  });
});

// Update an offer (Admin only)
const updateOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!offer) {
    return res.status(404).json({
      success: false,
      message: 'Offer not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Offer updated successfully',
    data: {
      offer
    }
  });
});

// Delete an offer (Admin only)
const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findByIdAndDelete(req.params.id);

  if (!offer) {
    return res.status(404).json({
      success: false,
      message: 'Offer not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Offer deleted successfully'
  });
});

module.exports = {
  getOffers,
  getOffer,
  claimOffer,
  createOffer,
  updateOffer,
  deleteOffer
}; 