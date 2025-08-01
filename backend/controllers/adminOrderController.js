const asyncHandler = require('../utils/asyncHandler');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Get all orders with pagination and filtering
// @route   GET /api/admin/orders
// @access  Private (Admin)
const getOrders = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  // Build filter object
  const filter = {};
  if (status && status !== 'all') {
    filter.status = status;
  }
  if (search) {
    filter.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'user.name': { $regex: search, $options: 'i' } },
      { 'user.email': { $regex: search, $options: 'i' } }
    ];
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Order.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get single order by ID
// @route   GET /api/admin/orders/:id
// @access  Private (Admin)
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('cancelledBy', 'name');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Update order status
// @route   PATCH /api/admin/orders/:id/status
// @access  Private (Admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, notes, cancellationReason } = req.body;

  console.log('🔄 Status update request:', {
    orderId: req.params.id,
    currentStatus: req.body.status,
    newStatus: status,
    notes,
    cancellationReason
  });

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  console.log('📦 Current order status:', order.status);

  // More flexible status transitions - allow any valid status
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status: ${status}. Valid statuses: ${validStatuses.join(', ')}`
    });
  }

  // Only restrict transitions to prevent invalid business logic
  const restrictedTransitions = {
    delivered: ['cancelled'], // Can only cancel delivered orders
    cancelled: [] // Cannot change cancelled orders
  };

  const restrictedFrom = restrictedTransitions[order.status] || [];
  if (restrictedFrom.length > 0 && !restrictedFrom.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot change status from ${order.status} to ${status}. Allowed transitions: ${restrictedFrom.join(', ')}`
    });
  }

  console.log('✅ Status transition allowed');

  // Update order status
  await order.updateStatus(status, req.admin._id);

  // Update notes if provided
  if (notes) {
    order.notes = notes;
  }

  // Update cancellation reason if cancelling
  if (status === 'cancelled' && cancellationReason) {
    order.cancellationReason = cancellationReason;
  }

  await order.save();

  // Populate user for response
  await order.populate('user', 'name email');

  console.log('✅ Order status updated successfully');

  res.status(200).json({
    success: true,
    message: `Order status updated to ${status}`,
    data: order
  });
});

// @desc    Get order statistics
// @route   GET /api/admin/orders/stats
// @access  Private (Admin)
const getOrderStats = asyncHandler(async (req, res) => {
  const { timeRange = '30d' } = req.query;
  
  const now = new Date();
  let startDate;
  
  switch (timeRange) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const [statusCounts, totalOrders, totalRevenue] = await Promise.all([
    // Status distribution
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]),
    
    // Total orders in period
    Order.countDocuments({
      createdAt: { $gte: startDate }
    }),
    
    // Total revenue from delivered orders
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'delivered'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ])
  ]);

  const stats = {
    statusDistribution: statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    timeRange
  };

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Export orders
// @route   GET /api/admin/orders/export
// @access  Private (Admin)
const exportOrders = asyncHandler(async (req, res) => {
  const { format = 'json', status, startDate, endDate } = req.query;

  const filter = {};
  if (status && status !== 'all') {
    filter.status = status;
  }
  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  if (format === 'csv') {
    // Convert to CSV format
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
    
    // Implementation for CSV export
    res.status(200).send('CSV export not implemented yet');
  } else {
    res.status(200).json({
      success: true,
      data: orders
    });
  }
});

module.exports = {
  getOrders,
  getOrder,
  updateOrderStatus,
  getOrderStats,
  exportOrders
}; 