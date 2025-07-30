const Newsletter = require('../models/Newsletter');
const nodemailer = require('nodemailer');

// Configure email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
const subscribe = async (req, res, next) => {
  try {
    const { name, email, preferences } = req.body;

    // Check if already subscribed
    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return res.status(400).json({
          success: false,
          message: 'You are already subscribed to our newsletter'
        });
      } else {
        // Resubscribe
        await existingSubscriber.resubscribe();
        return res.status(200).json({
          success: true,
          message: 'Successfully resubscribed to newsletter'
        });
      }
    }

    // Create new subscriber
    const subscriber = await Newsletter.create({
      name,
      email,
      preferences: preferences || {
        promotions: true,
        newProducts: true,
        weeklyNewsletter: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: { subscriber }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
// @access  Public
const unsubscribe = async (req, res, next) => {
  try {
    const { email } = req.body;

    const subscriber = await Newsletter.findOne({ email });
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    await subscriber.unsubscribe();

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all subscribers (Admin only)
// @route   GET /api/newsletter/subscribers
// @access  Private/Admin
const getSubscribers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isActive, search } = req.query;

    const query = {};
    
    if (typeof isActive === 'boolean') {
      query.isActive = isActive;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const subscribers = await Newsletter.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ subscribedAt: -1 });

    const total = await Newsletter.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        subscribers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalSubscribers: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send newsletter email (Admin only)
// @route   POST /api/newsletter/send
// @access  Private/Admin
const sendNewsletter = async (req, res, next) => {
  try {
    const { subject, content, type = 'general', subscriberIds } = req.body;

    if (!subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'Subject and content are required'
      });
    }

    let subscribers;

    // If specific subscriber IDs are provided
    if (subscriberIds && subscriberIds.length > 0) {
      subscribers = await Newsletter.find({
        _id: { $in: subscriberIds },
        isActive: true
      });
    } else {
      // Get subscribers based on type
      switch (type) {
        case 'promotions':
          subscribers = await Newsletter.getSubscribersByPreference('promotions');
          break;
        case 'newProducts':
          subscribers = await Newsletter.getSubscribersByPreference('newProducts');
          break;
        case 'weeklyNewsletter':
          subscribers = await Newsletter.getSubscribersByPreference('weeklyNewsletter');
          break;
        default:
          subscribers = await Newsletter.getActiveSubscribers();
      }
    }

    if (subscribers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active subscribers found'
      });
    }

    // Create email transporter
    const transporter = createTransporter();

    // Send emails
    const emailPromises = subscribers.map(async (subscriber) => {
      try {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: subscriber.email,
          subject: subject,
          html: content.replace(/{{name}}/g, subscriber.name)
        };

        await transporter.sendMail(mailOptions);
        
        // Update subscriber email count
        await subscriber.incrementEmailCount();
        
        return { success: true, email: subscriber.email };
      } catch (error) {
        console.error(`Failed to send email to ${subscriber.email}:`, error);
        return { success: false, email: subscriber.email, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    res.status(200).json({
      success: true,
      message: `Newsletter sent successfully to ${successful.length} subscribers`,
      data: {
        totalSubscribers: subscribers.length,
        successful: successful.length,
        failed: failed.length,
        failedEmails: failed.map(f => f.email)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get newsletter statistics (Admin only)
// @route   GET /api/newsletter/stats
// @access  Private/Admin
const getNewsletterStats = async (req, res, next) => {
  try {
    const totalSubscribers = await Newsletter.countDocuments();
    const activeSubscribers = await Newsletter.countDocuments({ isActive: true });
    const inactiveSubscribers = await Newsletter.countDocuments({ isActive: false });

    // Get subscribers by preference
    const promotionsSubscribers = await Newsletter.countDocuments({
      isActive: true,
      'preferences.promotions': true
    });

    const newProductsSubscribers = await Newsletter.countDocuments({
      isActive: true,
      'preferences.newProducts': true
    });

    const weeklyNewsletterSubscribers = await Newsletter.countDocuments({
      isActive: true,
      'preferences.weeklyNewsletter': true
    });

    // Get recent subscribers
    const recentSubscribers = await Newsletter.find({ isActive: true })
      .sort({ subscribedAt: -1 })
      .limit(5)
      .select('name email subscribedAt');

    res.status(200).json({
      success: true,
      data: {
        totalSubscribers,
        activeSubscribers,
        inactiveSubscribers,
        preferences: {
          promotions: promotionsSubscribers,
          newProducts: newProductsSubscribers,
          weeklyNewsletter: weeklyNewsletterSubscribers
        },
        recentSubscribers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subscriber preferences (Admin only)
// @route   PUT /api/newsletter/subscribers/:id
// @access  Private/Admin
const updateSubscriber = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, preferences, isActive } = req.body;

    const subscriber = await Newsletter.findById(id);
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    // Update fields
    if (name) subscriber.name = name;
    if (email) subscriber.email = email;
    if (preferences) subscriber.preferences = { ...subscriber.preferences, ...preferences };
    if (typeof isActive === 'boolean') subscriber.isActive = isActive;

    await subscriber.save();

    res.status(200).json({
      success: true,
      message: 'Subscriber updated successfully',
      data: { subscriber }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subscriber (Admin only)
// @route   DELETE /api/newsletter/subscribers/:id
// @access  Private/Admin
const deleteSubscriber = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subscriber = await Newsletter.findById(id);
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    await Newsletter.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Subscriber deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  subscribe,
  unsubscribe,
  getSubscribers,
  sendNewsletter,
  getNewsletterStats,
  updateSubscriber,
  deleteSubscriber
}; 