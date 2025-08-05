const mongoose = require('mongoose');
const Offer = require('../models/Offer');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const migrateOffers = async () => {
  try {
    console.log('🔄 Migrating existing offers to new schema...');
    
    const offers = await Offer.find({});
    
    if (offers.length === 0) {
      console.log('❌ No offers found to migrate.');
      return;
    }
    
    console.log(`📊 Found ${offers.length} offers to migrate:`);
    
    for (let i = 0; i < offers.length; i++) {
      const offer = offers[i];
      console.log(`\n${i + 1}. Migrating: ${offer.title}`);
      
      // Update offer with new fields
      const updates = {};
      
      // Generate code from title if not exists
      if (!offer.code) {
        updates.code = offer.title.replace(/\s+/g, '_').toUpperCase();
        console.log(`   → Generated code: ${updates.code}`);
      }
      
      // Set type to discount if not exists
      if (!offer.type) {
        updates.type = 'discount';
        console.log(`   → Set type: ${updates.type}`);
      }
      
      // Map discount to discountValue
      if (!offer.discountValue && offer.discount) {
        updates.discountValue = offer.discount;
        updates.discountType = 'percentage';
        console.log(`   → Mapped discount: ${offer.discount}%`);
      }
      
      // Set default discountValue if not exists
      if (!offer.discountValue) {
        updates.discountValue = 10;
        updates.discountType = 'percentage';
        console.log(`   → Set default discount: 10%`);
      }
      
      // Map validFrom to startDate or set default
      if (!offer.startDate) {
        if (offer.validFrom) {
          updates.startDate = offer.validFrom;
          console.log(`   → Mapped startDate: ${offer.validFrom}`);
        } else {
          updates.startDate = new Date();
          console.log(`   → Set default startDate: ${new Date()}`);
        }
      }
      
      // Map validUntil to endDate or set default
      if (!offer.endDate) {
        if (offer.validUntil) {
          updates.endDate = offer.validUntil;
          console.log(`   → Mapped endDate: ${offer.validUntil}`);
        } else {
          updates.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
          console.log(`   → Set default endDate: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}`);
        }
      }
      
      // Map productIds to applicableProducts
      if (!offer.applicableProducts) {
        if (offer.productIds && offer.productIds.length > 0) {
          updates.applicableProducts = offer.productIds;
          console.log(`   → Mapped applicableProducts: ${offer.productIds.length} products`);
        } else {
          updates.applicableProducts = [];
          console.log(`   → Set empty applicableProducts array`);
        }
      }
      
      // Map maxUses to usageLimit
      if (!offer.usageLimit) {
        if (offer.maxUses !== -1) {
          updates.usageLimit = offer.maxUses;
          console.log(`   → Mapped usageLimit: ${offer.maxUses}`);
        } else {
          updates.usageLimit = null; // unlimited
          console.log(`   → Set usageLimit: unlimited`);
        }
      }
      
      // Set minimumOrderAmount if not exists
      if (!offer.minimumOrderAmount) {
        updates.minimumOrderAmount = 0;
        console.log(`   → Set minimumOrderAmount: 0`);
      }
      
      // Update the offer
      if (Object.keys(updates).length > 0) {
        await Offer.findByIdAndUpdate(offer._id, updates, { new: true });
        console.log(`   ✅ Updated successfully`);
      } else {
        console.log(`   ⚠️  No updates needed`);
      }
    }
    
    console.log('\n🎉 Migration completed!');
    console.log('📊 You can now view the offers in the admin dashboard.');
    
  } catch (error) {
    console.error('❌ Error migrating offers:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed.');
  }
};

migrateOffers(); 