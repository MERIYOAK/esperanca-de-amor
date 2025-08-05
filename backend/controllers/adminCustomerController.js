const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Order = require('../models/Order');
const XLSX = require('xlsx');

// @desc    Get all customers with pagination and filtering
// @route   GET /api/admin/customers
// @access  Private (Admin)
const getCustomers = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    search,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  // Build filter object
  const filter = { role: 'customer' }; // Only get customers
  
  if (status && status !== 'all') {
    filter.isActive = status === 'active';
  }
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const [customers, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: {
      customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get single customer by ID
// @route   GET /api/admin/customers/:id
// @access  Private (Admin)
const getCustomer = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.params.id)
    .select('-password');

  if (!customer || customer.role !== 'customer') {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  // Get customer's orders
  const orders = await Order.find({ user: customer._id })
    .sort({ createdAt: -1 })
    .limit(10);

  res.status(200).json({
    success: true,
    data: {
      customer,
      recentOrders: orders
    }
  });
});

// @desc    Update customer status (activate/deactivate)
// @route   PATCH /api/admin/customers/:id/status
// @access  Private (Admin)
const updateCustomerStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  const customer = await User.findById(req.params.id);

  if (!customer || customer.role !== 'customer') {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  customer.isActive = isActive;
  await customer.save();

  res.status(200).json({
    success: true,
    message: `Customer ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: customer
  });
});

// @desc    Delete customer
// @route   DELETE /api/admin/customers/:id
// @access  Private (Admin)
const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.params.id);

  if (!customer || customer.role !== 'customer') {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  // Check if customer has orders
  const orderCount = await Order.countDocuments({ user: customer._id });
  
  if (orderCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete customer with ${orderCount} orders. Please deactivate instead.`
    });
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Customer deleted successfully'
  });
});

// @desc    Get customer statistics
// @route   GET /api/admin/customers/stats
// @access  Private (Admin)
const getCustomerStats = asyncHandler(async (req, res) => {
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

  const [totalCustomers, activeCustomers, newCustomers, customerOrders] = await Promise.all([
    // Total customers
    User.countDocuments({ role: 'customer' }),
    
    // Active customers
    User.countDocuments({ role: 'customer', isActive: true }),
    
    // New customers in time range
    User.countDocuments({ 
      role: 'customer', 
      createdAt: { $gte: startDate } 
    }),
    
    // Customer orders in time range
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      {
        $unwind: '$customer'
      },
      {
        $match: {
          'customer.role': 'customer'
        }
      }
    ])
  ]);

  const stats = {
    totalCustomers,
    activeCustomers,
    inactiveCustomers: totalCustomers - activeCustomers,
    newCustomers,
    timeRange,
    averageOrdersPerCustomer: customerOrders.length > 0 
      ? customerOrders.reduce((acc, item) => acc + item.orderCount, 0) / customerOrders.length 
      : 0,
    averageSpentPerCustomer: customerOrders.length > 0 
      ? customerOrders.reduce((acc, item) => acc + item.totalSpent, 0) / customerOrders.length 
      : 0
  };

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Export customers
// @route   GET /api/admin/customers/export
// @access  Private (Admin)
const exportCustomers = asyncHandler(async (req, res) => {
  const { status, startDate, endDate } = req.query;

  console.log('📊 Customer export request:', {
    status,
    startDate,
    endDate
  });

  const filter = { role: 'customer' };
  
  if (status && status !== 'all' && status !== '') {
    filter.isActive = status === 'active';
  }
  
  if (startDate && endDate) {
    try {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } catch (error) {
      console.error('❌ Invalid date format:', error);
      return res.status(400).json({
        success: false,
        message: 'Invalid date format provided'
      });
    }
  }

  console.log('🔍 Customer export filter:', filter);

  try {
    const customers = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${customers.length} customers to export`);

    // Create Excel data
    const excelData = customers.map(customer => ({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || 'N/A',
      isActive: customer.isActive ? 'Yes' : 'No',
      role: customer.role,
      address: customer.address?.address || 'N/A',
      city: customer.address?.city || 'N/A',
      state: customer.address?.state || 'N/A',
      zipCode: customer.address?.zipCode || 'N/A',
      createdAt: new Date(customer.createdAt).toISOString(),
      lastLogin: customer.lastLogin ? new Date(customer.lastLogin).toISOString() : 'Never'
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 20 }, // name
      { wch: 25 }, // email
      { wch: 15 }, // phone
      { wch: 10 }, // isActive
      { wch: 12 }, // role
      { wch: 30 }, // address
      { wch: 15 }, // city
      { wch: 15 }, // state
      { wch: 10 }, // zipCode
      { wch: 20 }, // createdAt
      { wch: 20 }  // lastLogin
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for Excel download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=customers-export-${new Date().toISOString().split('T')[0]}.xlsx`);

    // Send the Excel file
    res.send(excelBuffer);
  } catch (error) {
    console.error('❌ Error exporting customers:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while exporting customers'
    });
  }
});

module.exports = {
  getCustomers,
  getCustomer,
  updateCustomerStatus,
  deleteCustomer,
  getCustomerStats,
  exportCustomers
}; 