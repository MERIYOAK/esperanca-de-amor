const Offer = require('../models/Offer');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const asyncHandler = require('../utils/asyncHandler');
const Order = require('../models/Order'); // Added Order model import

// Get all active offers
const getOffers = asyncHandler(async (req, res) => {
  const now = new Date();
  
  const offers = await Offer.find({ 
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now }
  })
    .populate('productIds', 'name price images')
    .populate('claimedBy.user', 'name email')
    .sort({ createdAt: -1 });

  console.log(`Found ${offers.length} valid offers at ${now.toISOString()}`);

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
    .populate('productIds', 'name price images')
    .populate('claimedBy.user', 'name email');

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
  const { offerId, createOrder = false, shippingAddress, paymentMethod, notes } = req.body;
  const userId = req.user.id;

  if (!offerId) {
    return res.status(400).json({
      success: false,
      message: 'Offer ID is required'
    });
  }

  const offer = await Offer.findById(offerId).populate('productIds');
  
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

  // Add ALL products from the offer to user's cart
  const addedProducts = [];
  if (offer.productIds && offer.productIds.length > 0) {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    for (const product of offer.productIds) {
      // Check if product exists and is active
      if (!product.isActive) {
        console.log(`Product ${product.name} is not active, skipping...`);
        continue;
      }

      // Check if product already in cart
      const existingItem = cart.items.find(item => 
        item.product.toString() === product._id.toString()
      );

      const discountedPrice = product.price * (1 - offer.discount / 100);

      if (existingItem) {
        existingItem.quantity += 1;
        existingItem.price = discountedPrice; // Update price to discounted price
      } else {
        cart.items.push({
          product: product._id,
          quantity: 1,
          price: discountedPrice
        });
      }

      addedProducts.push({
        id: product._id,
        name: product.name,
        originalPrice: product.price,
        discountedPrice: discountedPrice,
        discount: offer.discount
      });
    }

    await cart.save();
  }

  let order = null;
  let whatsappLink = null;

  // Create order immediately if requested
  if (createOrder && addedProducts.length > 0) {
    try {
      // Calculate total amount
      const totalAmount = addedProducts.reduce((total, product) => {
        return total + product.discountedPrice;
      }, 0);

      // Generate order number
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const orderNumber = `EA${year}${month}${day}${timestamp.toString().slice(-6)}${random}`;

      // Create order items
      const orderItems = addedProducts.map(product => ({
        product: product.id,
        name: product.name,
        price: product.discountedPrice,
        quantity: 1,
        total: product.discountedPrice
      }));

      // Create order
      order = await Order.create({
        orderNumber,
        user: userId,
        items: orderItems,
        totalAmount,
        shippingAddress,
        paymentMethod,
        notes: notes || `Order from claimed offer: ${offer.title}`
      });

      // Generate WhatsApp message
      await order.generateWhatsAppMessage();

      // Create WhatsApp link
      const whatsappNumber = process.env.WHATSAPP_PHONE_NUMBER || '244922706107';
      const encodedMessage = encodeURIComponent(order.whatsappMessage);
      whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

      console.log('✅ Order created immediately for claimed offer:', order._id);
    } catch (error) {
      console.error('❌ Error creating order for claimed offer:', error);
      // Don't fail the offer claim if order creation fails
    }
  }

  res.status(200).json({
    success: true,
    message: 'Offer claimed successfully',
    data: {
      offer: {
        id: offer._id,
        title: offer.title,
        discount: offer.discount,
        productsAdded: addedProducts.length
      },
      addedProducts,
      order: order ? {
        id: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        whatsappLink
      } : null
    }
  });
});

// Create a new offer (Admin only)
const createOffer = asyncHandler(async (req, res) => {
  console.log('🔍 Creating new offer...');
  console.log('📋 Request body:', req.body);
  console.log('📋 Uploaded file:', req.file);
  
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

  // Handle productIds - convert from JSON string to array if needed
  let processedProductIds = productIds;
  if (productIds && typeof productIds === 'string') {
    try {
      processedProductIds = JSON.parse(productIds);
      console.log('✅ Parsed productIds:', processedProductIds);
    } catch (error) {
      console.error('❌ Error parsing productIds:', error);
      return res.status(400).json({
        success: false,
        message: 'Invalid productIds format. Expected valid JSON array.'
      });
    }
  }

  // Handle image - use uploaded file if available, otherwise use the image field
  let imageUrl = image;
  if (req.file) {
    imageUrl = req.file.location;
    console.log('✅ Using uploaded image:', imageUrl);
  } else if (image) {
    console.log('✅ Using existing image URL:', imageUrl);
  } else {
    console.log('⚠️ No image provided');
  }

  const offerData = {
    title,
    description,
    discount: parseInt(discount),
    category,
    productIds: processedProductIds,
    validUntil: new Date(validUntil),
    image: imageUrl,
    maxUses: maxUses ? parseInt(maxUses) : -1
  };

  console.log('📋 Creating offer with data:', offerData);

  const offer = await Offer.create(offerData);

  console.log('✅ Offer created successfully:', offer._id);
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
  console.log('🔍 Updating offer with ID:', req.params.id);
  console.log('📋 Request body:', req.body);
  console.log('📋 Uploaded file:', req.file);
  
  const updateData = { ...req.body };
  
  // Handle productIds - convert from JSON string to array if needed
  if (updateData.productIds && typeof updateData.productIds === 'string') {
    try {
      updateData.productIds = JSON.parse(updateData.productIds);
      console.log('✅ Parsed productIds:', updateData.productIds);
    } catch (error) {
      console.error('❌ Error parsing productIds:', error);
      return res.status(400).json({
        success: false,
        message: 'Invalid productIds format. Expected valid JSON array.'
      });
    }
  }
  
  // Convert numeric fields
  if (updateData.discount) {
    updateData.discount = parseInt(updateData.discount);
    console.log('✅ Parsed discount:', updateData.discount);
  }
  
  if (updateData.maxUses) {
    updateData.maxUses = parseInt(updateData.maxUses);
    console.log('✅ Parsed maxUses:', updateData.maxUses);
  }
  
  // Convert boolean fields
  if (updateData.isActive !== undefined) {
    updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true;
    console.log('✅ Parsed isActive:', updateData.isActive);
  }
  
  // Handle date fields
  if (updateData.validFrom) {
    updateData.validFrom = new Date(updateData.validFrom);
    console.log('✅ Parsed validFrom:', updateData.validFrom);
  }
  
  if (updateData.validUntil) {
    updateData.validUntil = new Date(updateData.validUntil);
    console.log('✅ Parsed validUntil:', updateData.validUntil);
  }

  // Handle image - use uploaded file if available, otherwise use the image field
  if (req.file) {
    updateData.image = req.file.location;
    console.log('✅ Using uploaded image:', updateData.image);
  } else if (updateData.image) {
    console.log('✅ Using existing image URL:', updateData.image);
  } else {
    console.log('⚠️ No image provided');
  }

  console.log('📋 Final update data:', updateData);

  const offer = await Offer.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!offer) {
    console.log('❌ Offer not found with ID:', req.params.id);
    return res.status(404).json({
      success: false,
      message: 'Offer not found'
    });
  }

  console.log('✅ Offer updated successfully:', offer._id);
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