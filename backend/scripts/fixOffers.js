const mongoose = require('mongoose');
const Offer = require('../models/Offer');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const fixOffers = async () => {
  try {
    console.log('🔄 Fixing offers...');
    
    const offers = await Offer.find({});
    
    if (offers.length === 0) {
      console.log('❌ No offers found.');
      return;
    }
    
    console.log(`📊 Found ${offers.length} offers to fix:`);
    
    for (let i = 0; i < offers.length; i++) {
      const offer = offers[i];
      console.log(`\n${i + 1}. Fixing: ${offer.title}`);
      
      // Force update all required fields
      const updates = {
        type: 'discount',
        startDate: offer.validFrom || new Date(),
        applicableProducts: offer.productIds || []
      };
      
      console.log(`   → Setting type: ${updates.type}`);
      console.log(`   → Setting startDate: ${updates.startDate}`);
      console.log(`   → Setting applicableProducts: ${updates.applicableProducts.length} products`);
      
      await Offer.findByIdAndUpdate(offer._id, updates, { new: true });
      console.log(`   ✅ Updated successfully`);
    }
    
    console.log('\n🎉 Offers fixed!');
    console.log('📊 Offers should now render properly in the admin dashboard.');
    
  } catch (error) {
    console.error('❌ Error fixing offers:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed.');
  }
};

fixOffers(); 