const mongoose = require('mongoose');
const Offer = require('../models/Offer');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const checkAllOffers = async () => {
  try {
    console.log('🔄 Checking all offers in database...');
    
    const now = new Date();
    console.log(`📅 Current time: ${now.toISOString()}`);
    
    // Get all offers
    const allOffers = await Offer.find({}).sort({ createdAt: -1 });
    console.log(`📊 Total offers in database: ${allOffers.length}`);
    
    allOffers.forEach((offer, index) => {
      console.log(`\n📋 Offer ${index + 1}:`);
      console.log(`   ID: ${offer._id}`);
      console.log(`   Title: ${offer.title}`);
      console.log(`   Code: ${offer.code}`);
      console.log(`   Type: ${offer.type}`);
      console.log(`   Active: ${offer.isActive}`);
      console.log(`   Start Date: ${offer.startDate}`);
      console.log(`   End Date: ${offer.endDate}`);
      
      const startDate = new Date(offer.startDate);
      const endDate = new Date(offer.endDate);
      const isCurrentlyValid = startDate <= now && endDate >= now;
      
      console.log(`   Currently Valid: ${isCurrentlyValid}`);
      console.log(`   Days until start: ${Math.ceil((startDate - now) / (1000 * 60 * 60 * 24))}`);
      console.log(`   Days until end: ${Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))}`);
    });
    
    // Check which offers would be returned by the API
    const activeOffers = await Offer.find({ 
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });
    
    console.log(`\n✅ Active offers that would be returned by API: ${activeOffers.length}`);
    activeOffers.forEach((offer, index) => {
      console.log(`   ${index + 1}. ${offer.title} (${offer.code})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking offers:', error);
  }
};

// Run the check
checkAllOffers()
  .then(() => {
    console.log('🏁 Check completed');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ Check failed:', err);
    mongoose.connection.close();
  }); 