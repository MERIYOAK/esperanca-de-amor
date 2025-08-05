const mongoose = require('mongoose');
const Offer = require('../models/Offer');
const Product = require('../models/Product');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const debugOffersAPI = async () => {
  try {
    console.log('🔄 Debugging offers API...');
    
    const now = new Date();
    console.log(`📅 Current time: ${now.toISOString()}`);
    
    // Simulate the exact API query without population first
    const offers = await Offer.find({ 
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ createdAt: -1 });

    console.log(`📊 Raw query result: ${offers.length} offers`);
    
    offers.forEach((offer, index) => {
      console.log(`\n📋 Offer ${index + 1}:`);
      console.log(`   ID: ${offer._id}`);
      console.log(`   Title: ${offer.title}`);
      console.log(`   Code: ${offer.code}`);
      console.log(`   Type: ${offer.type}`);
      console.log(`   Active: ${offer.isActive}`);
      console.log(`   Start Date: ${offer.startDate}`);
      console.log(`   End Date: ${offer.endDate}`);
      console.log(`   Applicable Products: ${offer.applicableProducts?.length || 0}`);
    });
    
    // Transform offers like the API does
    const transformedOffers = offers.map(offer => ({
      _id: offer._id,
      title: offer.title,
      description: offer.description,
      code: offer.code,
      type: offer.type,
      discountValue: offer.discountValue,
      discountType: offer.discountType,
      minimumOrderAmount: offer.minimumOrderAmount,
      maximumDiscountAmount: offer.maximumDiscountAmount,
      startDate: offer.startDate,
      endDate: offer.endDate,
      usageLimit: offer.usageLimit,
      isActive: offer.isActive,
      image: offer.image,
      applicableProducts: offer.applicableProducts || [],
      // Legacy fields for backward compatibility
      discount: offer.discountValue,
      validFrom: offer.startDate,
      validUntil: offer.endDate,
      productIds: offer.applicableProducts || [],
      category: offer.type,
      claimedBy: offer.claimedBy || []
    }));
    
    console.log(`\n📊 Transformed offers: ${transformedOffers.length} offers`);
    
    // Simulate the API response
    const apiResponse = {
      success: true,
      data: {
        offers: transformedOffers
      }
    };
    
    console.log(`\n📊 API Response would contain: ${apiResponse.data.offers.length} offers`);
    
  } catch (error) {
    console.error('❌ Error debugging offers API:', error);
  }
};

// Run the debug
debugOffersAPI()
  .then(() => {
    console.log('🏁 Debug completed');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ Debug failed:', err);
    mongoose.connection.close();
  }); 