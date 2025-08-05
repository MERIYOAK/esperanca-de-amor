const mongoose = require('mongoose');
const Offer = require('../models/Offer');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const checkDateFiltering = async () => {
  try {
    console.log('🔄 Checking date filtering...');
    
    const now = new Date();
    console.log(`📅 Current time: ${now.toISOString()}`);
    console.log(`📅 Current time (local): ${now.toString()}`);
    
    // Get all offers first
    const allOffers = await Offer.find({}).sort({ createdAt: -1 });
    console.log(`📊 Total offers in database: ${allOffers.length}`);
    
    // Check each offer's date validity
    allOffers.forEach((offer, index) => {
      console.log(`\n📋 Offer ${index + 1}: ${offer.title}`);
      console.log(`   Start Date: ${offer.startDate}`);
      console.log(`   End Date: ${offer.endDate}`);
      console.log(`   Active: ${offer.isActive}`);
      
      const startDate = new Date(offer.startDate);
      const endDate = new Date(offer.endDate);
      
      const isStartValid = startDate <= now;
      const isEndValid = endDate >= now;
      const isActive = offer.isActive;
      
      console.log(`   Start Date Valid: ${isStartValid} (${startDate <= now ? 'OK' : 'TOO EARLY'})`);
      console.log(`   End Date Valid: ${isEndValid} (${endDate >= now ? 'OK' : 'EXPIRED'})`);
      console.log(`   Would be returned by API: ${isActive && isStartValid && isEndValid ? 'YES' : 'NO'}`);
    });
    
    // Test the exact API query
    const apiOffers = await Offer.find({ 
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ createdAt: -1 });
    
    console.log(`\n📊 Offers that would be returned by API: ${apiOffers.length}`);
    apiOffers.forEach((offer, index) => {
      console.log(`   ${index + 1}. ${offer.title} (${offer.code})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking date filtering:', error);
  }
};

// Run the check
checkDateFiltering()
  .then(() => {
    console.log('🏁 Check completed');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ Check failed:', err);
    mongoose.connection.close();
  }); 