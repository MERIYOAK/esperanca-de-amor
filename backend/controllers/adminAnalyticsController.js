const asyncHandler = require('../utils/asyncHandler');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const Offer = require('../models/Offer');
const Newsletter = require('../models/Newsletter');

// Get comprehensive analytics data
const getAnalytics = asyncHandler(async (req, res) => {
  const { timeRange = '30d' } = req.query;
  
  // Calculate date range based on timeRange
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
    case '1y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Get previous period for growth calculation
  const periodLength = now.getTime() - startDate.getTime();
  const previousStartDate = new Date(startDate.getTime() - periodLength);

  // Get all-time stats
  const [
    allTimeOrders,
    allTimeRevenue,
    currentRevenue,
    currentOrders,
    currentCustomers,
    previousRevenue,
    previousOrders,
    previousCustomers,
    totalProducts,
    totalUsers,
    totalAnnouncements,
    totalOffers,
    totalNewsletterSubscribers,
    topProducts,
    customerSegments,
    orderStatusDistribution,
    monthlyTrends,
    recentOrders
  ] = await Promise.all([
    // All-time orders
    Order.countDocuments(),
    
    // All-time revenue
    Order.aggregate([
      {
        $match: {
          status: { $in: ['delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]),
    
    // Current period revenue
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]),
    
    // Current period orders
    Order.countDocuments({
      createdAt: { $gte: startDate }
    }),
    
    // Current period new customers
    User.countDocuments({
      createdAt: { $gte: startDate }
    }),
    
    // Previous period revenue
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousStartDate, $lt: startDate },
          status: { $in: ['delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]),
    
    // Previous period orders
    Order.countDocuments({
      createdAt: { $gte: previousStartDate, $lt: startDate }
    }),
    
    // Previous period new customers
    User.countDocuments({
      createdAt: { $gte: previousStartDate, $lt: startDate }
    }),
    
    // Total counts
    Product.countDocuments(),
    User.countDocuments(),
    Announcement.countDocuments(),
    Offer.countDocuments({ isActive: true }),
    Newsletter.countDocuments({ isSubscribed: true }),
    
    // Top performing products
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['delivered'] }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      {
        $sort: { revenue: -1 }
      },
      {
        $limit: 10
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
          _id: 1,
          name: '$product.name',
          category: '$product.category',
          totalSold: 1,
          revenue: 1
        }
      }
    ]),
    
    // Customer segments
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['delivered'] }
        }
      },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $addFields: {
          segment: {
            $cond: {
              if: { $gte: ['$totalSpent', 1000] },
              then: 'High Value',
              else: {
                $cond: {
                  if: { $gte: ['$totalSpent', 500] },
                  then: 'Medium Value',
                  else: 'Low Value'
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: '$segment',
          count: { $sum: 1 },
          averageOrderValue: { $avg: '$totalSpent' }
        }
      },
      {
        $addFields: {
          segment: '$_id'
        }
      },
      {
        $project: {
          _id: 0,
          segment: 1,
          count: 1,
          averageOrderValue: 1
        }
      }
    ]),
    
    // Order status distribution
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
      },
      {
        $addFields: {
          status: '$_id'
        }
      },
      {
        $project: {
          _id: 0,
          status: 1,
          count: 1
        }
      }
    ]),
    
    // Monthly trends (last 12 months)
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $limit: 12
      }
    ]),
    
    // Recent orders
    Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email')
      .populate('items.product', 'name price')
  ]);

  // Calculate growth percentages
  const currentRevenueTotal = currentRevenue[0]?.total || 0;
  const previousRevenueTotal = previousRevenue[0]?.total || 0;
  const allTimeRevenueTotal = allTimeRevenue[0]?.total || 0;
  
  const revenueGrowth = previousRevenueTotal > 0 
    ? ((currentRevenueTotal - previousRevenueTotal) / previousRevenueTotal) * 100 
    : 0;

  const orderGrowth = previousOrders > 0 
    ? ((currentOrders - previousOrders) / previousOrders) * 100 
    : 0;

  const customerGrowth = previousCustomers > 0 
    ? ((currentCustomers - previousCustomers) / previousCustomers) * 100 
    : 0;

  // Calculate percentages for customer segments
  const totalCustomers = customerSegments.reduce((sum, segment) => sum + segment.count, 0);
  const segmentsWithPercentage = customerSegments.map(segment => ({
    ...segment,
    percentage: totalCustomers > 0 ? (segment.count / totalCustomers) * 100 : 0
  }));

  // Calculate percentages for order status
  const totalOrders = orderStatusDistribution.reduce((sum, status) => sum + status.count, 0);
  const statusWithPercentage = orderStatusDistribution.map(status => ({
    ...status,
    percentage: totalOrders > 0 ? (status.count / totalOrders) * 100 : 0
  }));

  // Format monthly trends
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const formattedMonthlyTrends = monthlyTrends.map(trend => ({
    month: `${monthNames[trend._id.month - 1]} ${trend._id.year}`,
    revenue: trend.revenue,
    orders: trend.orders,
    customers: 0 // Would need additional aggregation for customers per month
  }));

  // Calculate average order value
  const averageOrderValue = currentOrders > 0 ? currentRevenueTotal / currentOrders : 0;

  const analyticsData = {
    overview: {
      totalRevenue: currentRevenueTotal,
      totalOrders,
      totalCustomers,
      averageOrderValue,
      revenueGrowth,
      orderGrowth,
      customerGrowth,
      allTimeOrders,
      allTimeRevenue: allTimeRevenueTotal
    },
    salesData: [], // Would need daily aggregation for chart data
    topProducts,
    customerSegments: segmentsWithPercentage,
    orderStatusDistribution: statusWithPercentage,
    monthlyTrends: formattedMonthlyTrends,
    recentOrders
  };

  res.status(200).json({
    success: true,
    data: analyticsData
  });
});

// Get sales trend data for charts
const getSalesTrend = asyncHandler(async (req, res) => {
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

  const salesData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $in: ['delivered'] }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
        },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);

  const formattedData = salesData.map(item => ({
    date: item._id.date,
    revenue: item.revenue,
    orders: item.orders
  }));

  res.status(200).json({
    success: true,
    data: formattedData
  });
});

// Export analytics data
const exportAnalytics = asyncHandler(async (req, res) => {
  const { format = 'json' } = req.query;
  
  // Get comprehensive analytics data
  const analyticsData = await getAnalytics(req, res);
  
  if (format === 'csv') {
    // Convert to CSV format
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
    
    // Implementation for CSV export
    res.status(200).send('CSV export not implemented yet');
  } else {
    res.status(200).json({
      success: true,
      data: analyticsData
    });
  }
});

module.exports = {
  getAnalytics,
  getSalesTrend,
  exportAnalytics
}; 