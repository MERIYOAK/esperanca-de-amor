const mongoose = require('mongoose');
const Offer = require('../models/Offer');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const finalizeMigration = async () => {
  try {
    console.log('🔄 Finalizing offer migration...');
    
    const offers = await Offer.find({});
    
    if (offers.length === 0) {
      console.log('❌ No offers found.');
      return;
    }
    
    console.log(`📊 Found ${offers.length} offers to finalize:`);
    
    for (let i = 0; i < offers.length; i++) {
      const offer = offers[i];
      console.log(`\n${i + 1}. Finalizing: ${offer.title}`);
      
      const updates = {};
      
      // Set type if missing
      if (!offer.type) {
        updates.type = 'discount';
        console.log(`   → Set type: discount`);
      }
      
      // Set startDate if missing
      if (!offer.startDate) {
        updates.startDate = offer.validFrom || new Date();
        console.log(`   → Set startDate: ${updates.startDate}`);
      }
      
      // Set applicableProducts if missing
      if (!offer.applicableProducts) {
        updates.applicableProducts = offer.productIds || [];
        console.log(`   → Set applicableProducts: ${updates.applicableProducts.length} products`);
      }
      
      // Update the offer
      if (Object.keys(updates).length > 0) {
        await Offer.findByIdAndUpdate(offer._id, updates, { new: true });
        console.log(`   ✅ Updated successfully`);
      } else {
        console.log(`   ⚠️  No updates needed`);
      }
    }
    
    console.log('\n🎉 Migration finalized!');
    console.log('📊 Offers should now render properly in the admin dashboard.');
    
  } catch (error) {
    console.error('❌ Error finalizing migration:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed.');
  }
};

finalizeMigration(); 