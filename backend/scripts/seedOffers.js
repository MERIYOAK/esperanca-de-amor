const mongoose = require('mongoose');
const Offer = require('../models/Offer');
const Category = require('../models/Category');
const Product = require('../models/Product');
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

const seedOffers = async () => {
  try {
    // Clear existing offers
    await Offer.deleteMany({});
    console.log('🗑️ Cleared existing offers');

    // Get categories and products for reference
    const categories = await Category.find({});
    const products = await Product.find({});

    if (categories.length === 0 || products.length === 0) {
      console.log('❌ No categories or products found. Please seed categories and products first.');
      return;
    }

    // Find specific categories and products
    const freshFruitsCategory = categories.find(cat => cat.name === 'Fresh Fruits');
    const beveragesCategory = categories.find(cat => cat.name === 'Beverages');
    const seafoodCategory = categories.find(cat => cat.name === 'Seafood');

    const freshAvocados = products.find(p => p.name === 'Fresh Avocados');
    const freshPineapple = products.find(p => p.name === 'Fresh Pineapple');
    const premiumCoffee = products.find(p => p.name === 'Premium Coffee Beans');
    const importedWine = products.find(p => p.name === 'Imported Wine');
    const freshFish = products.find(p => p.name === 'Fresh Fish Selection');
    const importedCheese = products.find(p => p.name === 'Imported Cheese');

    const offers = [
      {
        title: 'Fresh Produce Bundle',
        description: 'Get 30% off on all fresh vegetables and fruits',
        discount: 30,
        category: freshFruitsCategory?._id,
        productIds: [freshAvocados?._id, freshPineapple?._id].filter(Boolean),
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
        isActive: true,
        maxUses: 100
      },
      {
        title: 'Beverage Special',
        description: 'Buy 2 Get 1 Free on all imported drinks',
        discount: 33,
        category: beveragesCategory?._id,
        productIds: [premiumCoffee?._id, importedWine?._id].filter(Boolean),
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop',
        isActive: true,
        maxUses: 50
      },
      {
        title: 'Weekend Combo',
        description: 'Special weekend prices on family meal packages',
        discount: 25,
        category: seafoodCategory?._id,
        productIds: [freshFish?._id, importedCheese?._id].filter(Boolean),
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
        isActive: true,
        maxUses: 75
      }
    ];

    // Create offers
    const createdOffers = await Offer.insertMany(offers);
    console.log(`✅ Created ${createdOffers.length} offers`);

    // Log the created offers
    createdOffers.forEach((offer, index) => {
      console.log(`${index + 1}. ${offer.title} - ${offer.discount}% off`);
    });

    console.log('🎉 Offers seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding offers:', error);
    process.exit(1);
  }
};

// Run the seeding
connectDB().then(() => {
  seedOffers();
}); 