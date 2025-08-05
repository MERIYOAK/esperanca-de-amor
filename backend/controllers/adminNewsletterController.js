const Newsletter = require('../models/Newsletter');
const asyncHandler = require('../utils/asyncHandler');
const nodemailer = require('nodemailer');

// Get all newsletter subscribers with pagination and filters
const getNewsletterSubscribers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder || 'desc';

  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {};
  
  if (search) {
    filter.$or = [
      { email: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } }
    ];
  }

  if (isActive !== undefined) {
    filter.isActive = isActive;
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Get subscribers with pagination
  const subscribers = await Newsletter.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const total = await Newsletter.countDocuments(filter);

  // Get stats
  const stats = await Newsletter.aggregate([
    {
      $group: {
        _id: null,
        totalSubscribers: { $sum: 1 },
        activeSubscribers: { $sum: { $cond: ['$isActive', 1, 0] } },
        inactiveSubscribers: { $sum: { $cond: ['$isActive', 0, 1] } }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      subscribers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: stats[0] || { totalSubscribers: 0, activeSubscribers: 0, inactiveSubscribers: 0 }
    }
  });
});

// Get single subscriber
const getNewsletterSubscriber = asyncHandler(async (req, res) => {
  const subscriber = await Newsletter.findById(req.params.id);

  if (!subscriber) {
    return res.status(404).json({
      success: false,
      message: 'Subscriber not found'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      subscriber
    }
  });
});

// Add new subscriber (Admin)
const addSubscriber = asyncHandler(async (req, res) => {
  const { email, name, preferences } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  // Check if subscriber already exists
  const existingSubscriber = await Newsletter.findOne({ email: email.toLowerCase() });
  if (existingSubscriber) {
    return res.status(400).json({
      success: false,
      message: 'Subscriber with this email already exists'
    });
  }

  const subscriber = await Newsletter.create({
    email: email.toLowerCase(),
    name: name || '',
    isActive: true,
    preferences: preferences || {
      promotions: true,
      newProducts: true,
      weeklyNewsletter: true
    }
  });

  res.status(201).json({
    success: true,
    message: 'Subscriber added successfully',
    data: {
      subscriber
    }
  });
});

// Send newsletter update
const sendNewsletterUpdate = asyncHandler(async (req, res) => {
  const { subject, content, template, targetAudience } = req.body;

  if (!subject || !content) {
    return res.status(400).json({
      success: false,
      message: 'Subject and content are required'
    });
  }

  // Build filter for target audience
  const filter = { isActive: true };
  
  if (targetAudience === 'active') {
    filter.isActive = true;
  } else if (targetAudience === 'inactive') {
    filter.isActive = false;
  }

  // Get subscribers
  const subscribers = await Newsletter.find(filter).select('email name');

  if (subscribers.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No subscribers found for the specified criteria'
    });
  }

  // Configure email transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // Email template
  const emailTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
        .btn { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        .unsubscribe { color: #666; text-decoration: none; }
        .unsubscribe:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>EDA Store Newsletter</h1>
        </div>
        <div class="content">
          <h2>${subject}</h2>
          ${content}
        </div>
        <div class="footer">
          <p>Thank you for subscribing to our newsletter!</p>
          <p><a href="${process.env.FRONTEND_URL}/unsubscribe?email={{emailEncoded}}" class="unsubscribe">Unsubscribe</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send emails
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const subscriber of subscribers) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: subscriber.email,
        subject: subject,
        html: emailTemplate
          .replace('{{name}}', subscriber.name || 'Valued Customer')
          .replace('{{email}}', subscriber.email)
          .replace('{{emailEncoded}}', encodeURIComponent(subscriber.email))
      });
      
      // Update subscriber stats
      await Newsletter.findByIdAndUpdate(subscriber._id, {
        $inc: { emailCount: 1 },
        lastEmailSent: new Date()
      });
      
      successCount++;
    } catch (error) {
      errorCount++;
      errors.push({
        email: subscriber.email,
        error: error.message
      });
    }
  }

  res.status(200).json({
    success: true,
    message: `Newsletter sent successfully to ${successCount} subscribers`,
    data: {
      totalRecipients: subscribers.length,
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined
    }
  });
});

// Export subscribers to CSV
const exportSubscribers = asyncHandler(async (req, res) => {
  const { status, startDate, endDate } = req.query;

  const filter = {};
  
  // Add status filter if provided
  if (status && status !== 'all' && status !== '') {
    filter.isActive = status === 'active';
  }
  
  // Add date range filter if provided
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

  try {
    const subscribers = await Newsletter.find(filter)
      .select('email name createdAt isActive preferences emailCount lastEmailSent')
      .sort({ createdAt: -1 });

    // Create CSV data
    const csvHeader = 'Email,Name,Status,Subscribed Date,Email Count,Last Email Sent,Preferences\n';
    const csvData = subscribers.map(sub => 
      `"${sub.email}","${sub.name || ''}","${sub.isActive ? 'Active' : 'Inactive'}","${sub.createdAt.toISOString()}","${sub.emailCount || 0}","${sub.lastEmailSent ? sub.lastEmailSent.toISOString() : 'Never'}","${JSON.stringify(sub.preferences || {})}"`
    ).join('\n');

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`);

    // Send the CSV file
    res.send(csvHeader + csvData);
  } catch (error) {
    console.error('❌ Error exporting newsletter subscribers:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while exporting newsletter subscribers'
    });
  }
});

// Update subscriber status
const updateSubscriberStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  if (isActive === undefined) {
    return res.status(400).json({
      success: false,
      message: 'isActive status is required'
    });
  }

  const subscriber = await Newsletter.findByIdAndUpdate(
    req.params.id,
    { 
      isActive,
      unsubscribedAt: isActive ? null : new Date()
    },
    { new: true, runValidators: true }
  );

  if (!subscriber) {
    return res.status(404).json({
      success: false,
      message: 'Subscriber not found'
    });
  }

  res.status(200).json({
    success: true,
    message: `Subscriber ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: {
      subscriber
    }
  });
});

// Delete subscriber
const deleteSubscriber = asyncHandler(async (req, res) => {
  const subscriber = await Newsletter.findById(req.params.id);

  if (!subscriber) {
    return res.status(404).json({
      success: false,
      message: 'Subscriber not found'
    });
  }

  await Newsletter.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Subscriber deleted successfully'
  });
});

// Bulk operations
const bulkDeleteSubscribers = asyncHandler(async (req, res) => {
  const { subscriberIds } = req.body;

  if (!subscriberIds || !Array.isArray(subscriberIds) || subscriberIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Subscriber IDs array is required'
    });
  }

  const result = await Newsletter.deleteMany({ _id: { $in: subscriberIds } });

  res.status(200).json({
    success: true,
    message: `${result.deletedCount} subscribers deleted successfully`
  });
});

// Get newsletter statistics
const getNewsletterStats = asyncHandler(async (req, res) => {
  const stats = await Newsletter.aggregate([
    {
      $group: {
        _id: null,
        totalSubscribers: { $sum: 1 },
        activeSubscribers: { $sum: { $cond: ['$isActive', 1, 0] } },
        inactiveSubscribers: { $sum: { $cond: ['$isActive', 0, 1] } },
        totalEmailsSent: { $sum: '$emailCount' }
      }
    }
  ]);

  // Get recent subscribers
  const recentSubscribers = await Newsletter.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('email name createdAt isActive');

  res.status(200).json({
    success: true,
    data: {
      stats: stats[0] || { 
        totalSubscribers: 0, 
        activeSubscribers: 0, 
        inactiveSubscribers: 0,
        totalEmailsSent: 0
      },
      recentSubscribers
    }
  });
});

module.exports = {
  getNewsletterSubscribers,
  getNewsletterSubscriber,
  addSubscriber,
  sendNewsletterUpdate,
  exportSubscribers,
  updateSubscriberStatus,
  deleteSubscriber,
  bulkDeleteSubscribers,
  getNewsletterStats
}; 