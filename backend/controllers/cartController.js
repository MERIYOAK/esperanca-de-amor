const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name price originalPrice images isOnSale discount stock'
      });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate product exists and is active
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Add item to cart
    await cart.addItem(productId, quantity);

    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'name price originalPrice images isOnSale discount stock'
    });

    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Find the item by its ID and remove it
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    cart.items.splice(itemIndex, 1);
    cart.updatedAt = new Date();
    await cart.save();

    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'name price originalPrice images isOnSale discount stock'
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Find the item by its ID
    const item = cart.items.find(item => item._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Check product stock
    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    // Update the quantity
    item.quantity = quantity;
    cart.updatedAt = new Date();
    await cart.save();

    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'name price originalPrice images isOnSale discount stock'
    });

    res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    await cart.clearCart();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Checkout cart (create order and send WhatsApp message)
// @route   POST /api/cart/checkout
// @access  Private
const checkout = async (req, res, next) => {
  try {
    console.log('🛒 Starting checkout process...');
    const { shippingAddress, paymentMethod, notes } = req.body;

    // Get user cart with populated products
    const cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name price originalPrice images isOnSale discount stock'
      });

    console.log('📦 Cart found:', cart ? 'Yes' : 'No');
    console.log('📦 Cart items count:', cart?.items?.length || 0);

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate stock for all items
    for (const item of cart.items) {
      console.log(`🔍 Checking stock for ${item.product.name}: ${item.product.stock} available, ${item.quantity} requested`);
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.product.name}`
        });
      }
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce((total, item) => {
      const price = item.product.isOnSale && item.product.discount 
        ? item.product.price - (item.product.price * item.product.discount / 100)
        : item.product.price;
      return total + (price * item.quantity);
    }, 0);

    console.log('💰 Total amount calculated:', totalAmount);

    // Create order items
    const orderItems = cart.items.map(item => {
      const price = item.product.isOnSale && item.product.discount 
        ? item.product.price - (item.product.price * item.product.discount / 100)
        : item.product.price;
      
      return {
        product: item.product._id,
        name: item.product.name,
        price: price,
        quantity: item.quantity,
        total: price * item.quantity
      };
    });

    console.log('📋 Order items created:', orderItems.length);

    // Generate order number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `EA${year}${month}${day}${timestamp.toString().slice(-6)}${random}`;

    console.log('🔢 Order number generated:', orderNumber);

    // Create order
    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      notes
    });

    console.log('✅ Order created successfully:', order._id);

    // Generate WhatsApp message
    await order.generateWhatsAppMessage();

    // Create WhatsApp link
    const whatsappNumber = process.env.WHATSAPP_PHONE_NUMBER || '244922706107';
    const encodedMessage = encodeURIComponent(order.whatsappMessage);
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Decrease stock for all products
    for (const item of cart.items) {
      await item.product.decreaseStock(item.quantity);
    }

    console.log('🎉 Checkout completed successfully');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order,
        whatsappLink,
        whatsappMessage: order.whatsappMessage
      }
    });
  } catch (error) {
    console.error('❌ Checkout error:', error);
    next(error);
  }
};

// @desc    Get cart summary
// @route   GET /api/cart/summary
// @access  Private
const getCartSummary = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name price originalPrice images isOnSale discount stock'
      });

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          itemCount: 0,
          totalPrice: 0,
          items: []
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        itemCount: cart.itemCount,
        totalPrice: cart.totalPrice,
        items: cart.items
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  checkout,
  getCartSummary
}; 