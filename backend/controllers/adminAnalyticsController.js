const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const XLSX = require('xlsx');

// @desc    Get comprehensive analytics dashboard data
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getAnalytics = asyncHandler(async (req, res) => {
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

  const [
    totalRevenue,
    totalOrders,
    totalCustomers,
    totalProducts,
    revenueData,
    orderData,
    customerData,
    topProducts,
    orderStatusDistribution,
    customerGrowth,
    averageOrderValue,
    conversionRate
  ] = await Promise.all([
    // Total revenue in time range
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['delivered', 'shipped'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]),
    
    // Total orders in time range
    Order.countDocuments({ createdAt: { $gte: startDate } }),
    
    // Total customers in time range
    User.countDocuments({ 
      role: 'customer',
      createdAt: { $gte: startDate }
    }),
    
    // Total products
    Product.countDocuments({ isActive: true }),
    
    // Revenue data for charts (daily)
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['delivered', 'shipped'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]),
    
    // Order data for charts (daily)
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]),
    
    // Customer growth data (daily)
    User.aggregate([
      {
        $match: {
          role: 'customer',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]),
    
    // Top selling products
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['delivered', 'shipped'] }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
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
          totalSold: 1,
          totalRevenue: 1,
          image: { $arrayElemAt: ['$product.images', 0] }
        }
      },
      {
        $sort: { totalSold: -1 }
      },
      {
        $limit: 10
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
      }
    ]),
    
    // Customer growth (cumulative)
    User.aggregate([
      {
        $match: {
          role: 'customer',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]),
    
    // Average order value
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['delivered', 'shipped'] }
        }
      },
      {
        $group: {
          _id: null,
          averageValue: { $avg: '$totalAmount' }
        }
      }
    ]),
    
    // Conversion rate (orders per customer)
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: '$orderCount' },
          uniqueCustomers: { $sum: 1 }
        }
      }
    ])
  ]);

  // Calculate metrics
  const totalRevenueAmount = totalRevenue[0]?.total || 0;
  const avgOrderValue = averageOrderValue[0]?.averageValue || 0;
  const conversionData = conversionRate[0];
  const conversionRateValue = conversionData ? (conversionData.totalOrders / conversionData.uniqueCustomers) : 0;

  // Process chart data
  const revenueChartData = revenueData.map(item => ({
    date: item._id,
    revenue: item.revenue / 100, // Convert from cents
    orders: item.orders
  }));

  const orderChartData = orderData.map(item => ({
    date: item._id,
    orders: item.count
  }));

  const customerChartData = customerGrowth.map(item => ({
    date: item._id,
    customers: item.count
  }));

  // Calculate cumulative customer growth
  let cumulative = 0;
  const cumulativeCustomerData = customerChartData.map(item => {
    cumulative += item.customers;
    return {
      date: item.date,
      customers: cumulative
    };
  });

  const analytics = {
    overview: {
      totalRevenue: totalRevenueAmount / 100, // Convert from cents
      totalOrders,
      totalCustomers,
      totalProducts,
      averageOrderValue: avgOrderValue / 100, // Convert from cents
      conversionRate: conversionRateValue
    },
    charts: {
      revenue: revenueChartData,
      orders: orderChartData,
      customers: cumulativeCustomerData
    },
    topProducts,
    orderStatusDistribution: orderStatusDistribution.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    timeRange
  };

  res.status(200).json({
    success: true,
    data: analytics
  });
});

// @desc    Get sales trend data
// @route   GET /api/admin/analytics/sales-trend
// @access  Private (Admin)
const getSalesTrend = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;
  
  const now = new Date();
  let startDate;
  
  switch (period) {
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
        status: { $in: ['delivered', 'shipped'] }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
        },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  const trendData = salesData.map(item => ({
    date: item._id,
    revenue: item.revenue / 100, // Convert from cents
    orders: item.orders
  }));

  res.status(200).json({
    success: true,
    data: {
      trendData,
      period
    }
  });
});

// @desc    Export analytics data
// @route   GET /api/admin/analytics/export
// @access  Private (Admin)
const exportAnalytics = asyncHandler(async (req, res) => {
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

  const [orders, customers, products] = await Promise.all([
    Order.find({ createdAt: { $gte: startDate } })
      .populate('user', 'name email')
      .sort({ createdAt: -1 }),
    User.find({ 
      role: 'customer',
      createdAt: { $gte: startDate }
    })
      .select('-password')
      .sort({ createdAt: -1 }),
    Product.find({ isActive: true })
      .sort({ createdAt: -1 })
  ]);

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Summary worksheet
  const summaryData = [{
    metric: 'Total Orders',
    value: orders.length,
    period: `${timeRange} period`
  }, {
    metric: 'Total Customers',
    value: customers.length,
    period: `${timeRange} period`
  }, {
    metric: 'Total Products',
    value: products.length,
    period: 'Active products'
  }, {
    metric: 'Total Revenue',
    value: `$${(orders
      .filter(order => ['delivered', 'shipped'].includes(order.status))
      .reduce((sum, order) => sum + order.totalAmount, 0) / 100).toFixed(2)}`,
    period: `${timeRange} period`
  }];

  const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
  summaryWorksheet['!cols'] = [
    { wch: 20 }, // metric
    { wch: 15 }, // value
    { wch: 20 }  // period
  ];
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

  // Orders worksheet
  const ordersData = orders.map(order => ({
    orderId: order._id.toString(),
    customerName: order.user?.name || 'N/A',
    customerEmail: order.user?.email || 'N/A',
    status: order.status,
    totalAmount: `$${(order.totalAmount / 100).toFixed(2)}`,
    items: order.items.length,
    createdAt: new Date(order.createdAt).toISOString()
  }));

  const ordersWorksheet = XLSX.utils.json_to_sheet(ordersData);
  ordersWorksheet['!cols'] = [
    { wch: 24 }, // orderId
    { wch: 20 }, // customerName
    { wch: 25 }, // customerEmail
    { wch: 12 }, // status
    { wch: 12 }, // totalAmount
    { wch: 8 },  // items
    { wch: 20 }  // createdAt
  ];
  XLSX.utils.book_append_sheet(workbook, ordersWorksheet, 'Orders');

  // Customers worksheet
  const customersData = customers.map(customer => ({
    name: customer.name,
    email: customer.email,
    phone: customer.phone || 'N/A',
    isActive: customer.isActive ? 'Yes' : 'No',
    createdAt: new Date(customer.createdAt).toISOString()
  }));

  const customersWorksheet = XLSX.utils.json_to_sheet(customersData);
  customersWorksheet['!cols'] = [
    { wch: 20 }, // name
    { wch: 25 }, // email
    { wch: 15 }, // phone
    { wch: 10 }, // isActive
    { wch: 20 }  // createdAt
  ];
  XLSX.utils.book_append_sheet(workbook, customersWorksheet, 'Customers');

  // Products worksheet
  const productsData = products.map(product => ({
    name: product.name,
    price: `$${(product.price / 100).toFixed(2)}`,
    category: product.category,
    stock: product.stock,
    isActive: product.isActive ? 'Yes' : 'No',
    createdAt: new Date(product.createdAt).toISOString()
  }));

  const productsWorksheet = XLSX.utils.json_to_sheet(productsData);
  productsWorksheet['!cols'] = [
    { wch: 25 }, // name
    { wch: 12 }, // price
    { wch: 15 }, // category
    { wch: 8 },  // stock
    { wch: 10 }, // isActive
    { wch: 20 }  // createdAt
  ];
  XLSX.utils.book_append_sheet(workbook, productsWorksheet, 'Products');

  // Generate Excel file buffer
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  // Set headers for Excel download
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=analytics-export-${new Date().toISOString().split('T')[0]}.xlsx`);

  // Send the Excel file
  res.send(excelBuffer);
});

// @desc    Export sales trend data
// @route   GET /api/admin/analytics/sales-trend/export
// @access  Private (Admin)
const exportSalesTrend = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;
  
  const now = new Date();
  let startDate;
  
  switch (period) {
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
        status: { $in: ['delivered', 'shipped'] }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
        },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
        averageOrderValue: { $avg: '$totalAmount' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Create Excel data
  const excelData = salesData.map(item => ({
    date: item._id,
    revenue: `$${(item.revenue / 100).toFixed(2)}`,
    orders: item.orders,
    averageOrderValue: `$${(item.averageOrderValue / 100).toFixed(2)}`,
    period: period
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const columnWidths = [
    { wch: 15 }, // date
    { wch: 15 }, // revenue
    { wch: 12 }, // orders
    { wch: 18 }, // averageOrderValue
    { wch: 10 }  // period
  ];
  worksheet['!cols'] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Trend');

  // Generate Excel file buffer
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  // Set headers for Excel download
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=sales-trend-export-${new Date().toISOString().split('T')[0]}.xlsx`);

  // Send the Excel file
  res.send(excelBuffer);
});

module.exports = {
  getAnalytics,
  getSalesTrend,
  exportAnalytics,
  exportSalesTrend
}; 