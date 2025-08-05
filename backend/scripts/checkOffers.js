const mongoose = require('mongoose');
const Offer = require('../models/Offer');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const checkOffers = async () => {
  try {
    console.log('🔍 Checking offers in database...');
    
    const offers = await Offer.find({}).lean();
    
    console.log(`📊 Found ${offers.length} offers in database:`);
    
    if (offers.length === 0) {
      console.log('❌ No offers found in database.');
      console.log('💡 Run "node scripts/createTestOffers.js" to create test offers.');
      return;
    }
    
    offers.forEach((offer, index) => {
      console.log(`\n${index + 1}. ${offer.title}`);
      console.log(`   Code: ${offer.code}`);
      console.log(`   Type: ${offer.type}`);
      console.log(`   Active: ${offer.isActive}`);
      console.log(`   Start Date: ${offer.startDate}`);
      console.log(`   End Date: ${offer.endDate}`);
      console.log(`   Discount: ${offer.discountValue}${offer.discountType === 'percentage' ? '%' : '$'}`);
      console.log(`   Usage Limit: ${offer.usageLimit || 'Unlimited'}`);
      console.log(`   Applicable Products: ${offer.applicableProducts?.length || 0}`);
    });
    
    console.log('\n🎯 Offer structure check:');
    const sampleOffer = offers[0];
    console.log('Required fields for admin controller:');
    console.log(`- code: ${sampleOffer.code ? '✅' : '❌'}`);
    console.log(`- type: ${sampleOffer.type ? '✅' : '❌'}`);
    console.log(`- discountValue: ${sampleOffer.discountValue ? '✅' : '❌'}`);
    console.log(`- discountType: ${sampleOffer.discountType ? '✅' : '❌'}`);
    console.log(`- startDate: ${sampleOffer.startDate ? '✅' : '❌'}`);
    console.log(`- endDate: ${sampleOffer.endDate ? '✅' : '❌'}`);
    console.log(`- applicableProducts: ${sampleOffer.applicableProducts ? '✅' : '❌'}`);
    
  } catch (error) {
    console.error('❌ Error checking offers:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed.');
  }
};

checkOffers(); 