const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

const seedPromoBanners = async () => {
  try {
    const PromoBanner = require('../models/PromoBanner');

    // Clear existing promo banners
    await PromoBanner.deleteMany({});
    console.log('🗑️ Cleared existing promo banners');

    // Create demo promo banners with English text
    const demoBanners = [
      {
        text: "Free shipping on orders above $150",
        icon: "Gift",
        color: "from-red-600 to-red-700",
        isActive: true,
        sortOrder: 1
      },
      {
        text: "Delivery within 7 business days across the country",
        icon: "Truck",
        color: "from-orange-600 to-orange-700",
        isActive: true,
        sortOrder: 2
      },
      {
        text: "10% OFF on first purchase - Use code: WELCOME10",
        icon: "Percent",
        color: "from-yellow-600 to-yellow-700",
        isActive: true,
        sortOrder: 3
      },
      {
        text: "Up to 50% OFF on products during Black Week",
        icon: "Heart",
        color: "from-green-600 to-green-700",
        isActive: true,
        sortOrder: 4
      },
      {
        text: "Flash sale: 30% OFF on selected products",
        icon: "Clock",
        color: "from-blue-600 to-blue-700",
        isActive: true,
        sortOrder: 5
      },
      {
        text: "Buy 2 Get 1 Free on all accessories",
        icon: "ShoppingBag",
        color: "from-indigo-600 to-indigo-700",
        isActive: true,
        sortOrder: 6
      },
      {
        text: "New products arriving weekly - Stay tuned!",
        icon: "Star",
        color: "from-purple-600 to-purple-700",
        isActive: true,
        sortOrder: 7
      }
    ];

    const createdBanners = [];
    for (const bannerData of demoBanners) {
      const banner = await PromoBanner.create({
        ...bannerData,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      });
      createdBanners.push(banner);
      console.log(`✅ Created promo banner: ${banner.text}`);
    }

    console.log(`\n🎉 Successfully created ${createdBanners.length} promo banners!`);
    console.log('\n📋 Promo Banner Summary:');
    createdBanners.forEach((banner, index) => {
      console.log(`${index + 1}. ${banner.text} - Icon: ${banner.icon} - Color: ${banner.color}`);
    });

    console.log('\n🚀 Promo Banner seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding promo banners:', error);
    process.exit(1);
  }
};

// Run the seeding
connectDB().then(() => {
  seedPromoBanners();
}); 