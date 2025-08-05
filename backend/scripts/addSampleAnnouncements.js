const mongoose = require('mongoose');
require('dotenv').config();

// Import the Announcement model
const Announcement = require('../models/Announcement');

// Sample announcements data
const sampleAnnouncements = [
  {
    title: "🚨 URGENT: System Maintenance Tonight",
    content: "We will be performing critical system maintenance tonight from 2:00 AM to 4:00 AM EST. During this time, the website may be temporarily unavailable. We apologize for any inconvenience and appreciate your patience.",
    type: "warning",
    priority: "urgent",
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    targetAudience: "all",
    displayLocation: "top",
    views: 0,
    clicks: 0,
    createdBy: "507f1f77bcf86cd799439011" // Sample admin ID
  },
  {
    title: "🎉 New Product Launch: Organic Honey Collection",
    content: "We're excited to announce our new Organic Honey Collection! Featuring pure, raw honey from local beekeepers. Available in three varieties: Wildflower, Clover, and Orange Blossom. Limited time offer - 20% off for the first week!",
    type: "promotion",
    priority: "high",
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    targetAudience: "all",
    displayLocation: "top",
    views: 0,
    clicks: 0,
    createdBy: "507f1f77bcf86cd799439011"
  },
  {
    title: "✅ Order Processing Update",
    content: "Good news! We've improved our order processing system. All orders placed before 3:00 PM will now be shipped the same day. Orders placed after 3:00 PM will be shipped the next business day. Thank you for your continued support!",
    type: "success",
    priority: "medium",
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    targetAudience: "registered",
    displayLocation: "sidebar",
    views: 0,
    clicks: 0,
    createdBy: "507f1f77bcf86cd799439011"
  },
  {
    title: "📢 Holiday Shipping Schedule",
    content: "Plan ahead for the holidays! Our shipping schedule for December: Orders placed by December 15th will arrive by December 24th. Express shipping available for last-minute orders. Check our shipping page for complete details.",
    type: "info",
    priority: "high",
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    targetAudience: "all",
    displayLocation: "top",
    views: 0,
    clicks: 0,
    createdBy: "507f1f77bcf86cd799439011"
  },
  {
    title: "⚠️ Delivery Delay Notice",
    content: "Due to weather conditions in the Northeast, some deliveries may be delayed by 1-2 business days. We're working closely with our shipping partners to minimize delays. Track your order in real-time through your account dashboard.",
    type: "warning",
    priority: "medium",
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    targetAudience: "registered",
    displayLocation: "modal",
    views: 0,
    clicks: 0,
    createdBy: "507f1f77bcf86cd799439011"
  },
  {
    title: "🎁 Customer Appreciation Week",
    content: "It's Customer Appreciation Week! From Monday to Friday, enjoy 15% off all products, free shipping on orders over $50, and exclusive member-only deals. Use code APPRECIATE15 at checkout. Thank you for being amazing customers!",
    type: "promotion",
    priority: "high",
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    targetAudience: "registered",
    displayLocation: "top",
    views: 0,
    clicks: 0,
    createdBy: "507f1f77bcf86cd799439011"
  },
  {
    title: "📱 Mobile App Now Available",
    content: "Download our new mobile app for iOS and Android! Get exclusive app-only deals, faster checkout, order tracking, and push notifications for sales and updates. Available now on the App Store and Google Play Store.",
    type: "info",
    priority: "medium",
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    targetAudience: "all",
    displayLocation: "sidebar",
    views: 0,
    clicks: 0,
    createdBy: "507f1f77bcf86cd799439011"
  },
  {
    title: "❌ Important: Return Policy Update",
    content: "We've updated our return policy to better serve our customers. Returns are now accepted within 30 days of purchase (previously 14 days). Items must be unused and in original packaging. See our updated return policy for full details.",
    type: "error",
    priority: "medium",
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    targetAudience: "all",
    displayLocation: "bottom",
    views: 0,
    clicks: 0,
    createdBy: "507f1f77bcf86cd799439011"
  },
  {
    title: "🌱 New Organic Product Line",
    content: "Introducing our new organic product line! We've added 25 new organic products including fresh produce, dairy, and pantry staples. All products are certified organic and sourced from local farmers. Shop the new collection today!",
    type: "success",
    priority: "low",
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
    targetAudience: "all",
    displayLocation: "sidebar",
    views: 0,
    clicks: 0,
    createdBy: "507f1f77bcf86cd799439011"
  },
  {
    title: "📧 Newsletter Subscription Bonus",
    content: "Subscribe to our newsletter and get 10% off your first order! Plus, stay updated on new products, exclusive deals, and healthy living tips. Unsubscribe anytime. Your privacy is important to us.",
    type: "promotion",
    priority: "low",
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
    targetAudience: "guests",
    displayLocation: "modal",
    views: 0,
    clicks: 0,
    createdBy: "507f1f77bcf86cd799439011"
  }
];

// Function to add sample announcements
const addSampleAnnouncements = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing sample announcements (optional - comment out if you want to keep existing ones)
    // await Announcement.deleteMany({});
    // console.log('🗑️ Cleared existing announcements');

    // Add sample announcements
    const addedAnnouncements = await Announcement.insertMany(sampleAnnouncements);
    console.log(`✅ Successfully added ${addedAnnouncements.length} sample announcements`);

    // Display the added announcements
    console.log('\n📋 Added Announcements:');
    addedAnnouncements.forEach((announcement, index) => {
      console.log(`${index + 1}. ${announcement.title} (${announcement.priority} priority)`);
    });

    console.log('\n🎉 Sample announcements have been added successfully!');
    console.log('💡 You can now test the announcement display on your website.');

  } catch (error) {
    console.error('❌ Error adding sample announcements:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
addSampleAnnouncements(); 