const mongoose = require('mongoose');
const Offer = require('../models/Offer');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const debugOffers = async () => {
  try {
    console.log('🔍 Debugging offers in database...');
    
    const offers = await Offer.find({}).lean();
    
    console.log(`📊 Found ${offers.length} offers in database:`);
    
    offers.forEach((offer, index) => {
      console.log(`\n${index + 1}. ${offer.title}`);
      console.log('Raw offer data:');
      console.log(JSON.stringify(offer, null, 2));
    });
    
  } catch (error) {
    console.error('❌ Error debugging offers:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed.');
  }
};

debugOffers(); 