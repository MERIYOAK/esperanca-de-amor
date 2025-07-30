const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Newsletter = require('../models/Newsletter');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const customerUsers = await User.countDocuments({ role: 'customer' });

    // Product statistics
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const featuredProducts = await Product.countDocuments({ featured: true });
    const productsOnSale = await Product.countDocuments({ isOnSale: true });

    // Order statistics
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    // Revenue statistics
    const revenueData = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Newsletter statistics
    const totalSubscribers = await Newsletter.countDocuments();
    const activeSubscribers = await Newsletter.countDocuments({ isActive: true });

    // Recent data
    const recentUsers = await User.find()
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .select('orderNumber totalAmount status createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentProducts = await Product.find()
      .select('name price stock createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          admin: adminUsers,
          customer: customerUsers,
          recent: recentUsers
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          featured: featuredProducts,
          onSale: productsOnSale,
          recent: recentProducts
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
          recent: recentOrders
        },
        revenue: {
          total: totalRevenue
        },
        newsletter: {
          total: totalSubscribers,
          active: activeSubscribers
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res, next) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // User registration trend
    const userTrend = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Order trend
    const orderTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          name: '$product.name',
          totalQuantity: 1,
          totalRevenue: 1
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        userTrend,
        orderTrend,
        topProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system health
// @route   GET /api/admin/health
// @access  Private/Admin
const getSystemHealth = async (req, res, next) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Recent activity
    const recentUsers = await User.countDocuments({ createdAt: { $gte: oneDayAgo } });
    const recentOrders = await Order.countDocuments({ createdAt: { $gte: oneDayAgo } });
    const recentProducts = await Product.countDocuments({ createdAt: { $gte: oneDayAgo } });

    // Low stock products
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });

    // Pending orders
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    // System status
    const systemStatus = {
      database: 'connected',
      storage: 'operational',
      email: 'operational',
      timestamp: now
    };

    res.status(200).json({
      success: true,
      data: {
        recentActivity: {
          users: recentUsers,
          orders: recentOrders,
          products: recentProducts
        },
        alerts: {
          lowStockProducts,
          pendingOrders
        },
        systemStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

// Mount routes
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/health', getSystemHealth);

module.exports = router; 