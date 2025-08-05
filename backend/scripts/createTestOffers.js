const mongoose = require('mongoose');
const Offer = require('../models/Offer');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const testOffers = [
  {
    title: 'Summer Sale Discount',
    description: 'Get 20% off on all summer products',
    code: 'SUMMER20',
    type: 'discount',
    discountValue: 20,
    discountType: 'percentage',
    minimumOrderAmount: 50,
    maximumDiscountAmount: 100,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    usageLimit: 100,
    applicableProducts: [],
    isActive: true
  },
  {
    title: 'Free Shipping Weekend',
    description: 'Free shipping on all orders this weekend',
    code: 'FREESHIP',
    type: 'free_shipping',
    discountValue: 0,
    discountType: 'fixed',
    minimumOrderAmount: 25,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    usageLimit: 50,
    applicableProducts: [],
    isActive: true
  },
  {
    title: 'Buy One Get One Free',
    description: 'Buy one item, get one free on selected products',
    code: 'BOGO50',
    type: 'buy_one_get_one',
    discountValue: 50,
    discountType: 'percentage',
    minimumOrderAmount: 100,
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    usageLimit: 25,
    applicableProducts: [],
    isActive: true
  },
  {
    title: 'Cashback Rewards',
    description: 'Get 10% cashback on your next purchase',
    code: 'CASHBACK10',
    type: 'cashback',
    discountValue: 10,
    discountType: 'percentage',
    minimumOrderAmount: 75,
    maximumDiscountAmount: 50,
    startDate: new Date(),
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
    usageLimit: 75,
    applicableProducts: [],
    isActive: true
  },
  {
    title: 'New Customer Discount',
    description: 'Special 15% discount for new customers',
    code: 'NEWCUST15',
    type: 'discount',
    discountValue: 15,
    discountType: 'percentage',
    minimumOrderAmount: 30,
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    usageLimit: 200,
    applicableProducts: [],
    isActive: false
  }
];

const createTestOffers = async () => {
  try {
    console.log('🔄 Creating test offers...');
    
    const existingOffers = await Offer.countDocuments();
    if (existingOffers > 0) {
      console.log(`⚠️  Found ${existingOffers} existing offers. Skipping creation.`);
      console.log('💡 To recreate test offers, delete existing ones first.');
      return;
    }
    
    const createdOffers = await Offer.insertMany(testOffers);
    
    console.log(`✅ Successfully created ${createdOffers.length} test offers:`);
    createdOffers.forEach(offer => {
      console.log(`   - ${offer.title} (${offer.code}) - ${offer.isActive ? 'Active' : 'Inactive'}`);
    });
    
    console.log('\n🎉 Test offers created successfully!');
    console.log('📊 You can now view them in the Offer Management section of the admin dashboard.');
    
  } catch (error) {
    console.error('❌ Error creating test offers:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed.');
  }
};

createTestOffers(); 