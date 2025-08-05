const mongoose = require('mongoose');
const Offer = require('../models/Offer');
const Product = require('../models/Product');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const testPopulation = async () => {
  try {
    console.log('🔄 Testing population issue...');
    
    const now = new Date();
    console.log(`📅 Current time: ${now.toISOString()}`);
    
    // Test 1: Without population
    console.log('\n📊 Test 1: Without population');
    const offersWithoutPopulate = await Offer.find({ 
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ createdAt: -1 });
    
    console.log(`Found ${offersWithoutPopulate.length} offers without population`);
    
    // Test 2: With population
    console.log('\n📊 Test 2: With population');
    const offersWithPopulate = await Offer.find({ 
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
      .populate('applicableProducts', 'name price images')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${offersWithPopulate.length} offers with population`);
    
    // Check each offer's applicableProducts
    console.log('\n📋 Checking applicableProducts for each offer:');
    offersWithoutPopulate.forEach((offer, index) => {
      console.log(`\nOffer ${index + 1}: ${offer.title}`);
      console.log(`   ApplicableProducts: ${offer.applicableProducts?.length || 0}`);
      if (offer.applicableProducts && offer.applicableProducts.length > 0) {
        offer.applicableProducts.forEach((productId, pIndex) => {
          console.log(`   Product ${pIndex + 1}: ${productId}`);
        });
      }
    });
    
    // Test 3: Check if products exist
    console.log('\n📊 Test 3: Checking if products exist');
    for (const offer of offersWithoutPopulate) {
      if (offer.applicableProducts && offer.applicableProducts.length > 0) {
        console.log(`\nChecking products for offer: ${offer.title}`);
        for (const productId of offer.applicableProducts) {
          const product = await Product.findById(productId);
          console.log(`   Product ${productId}: ${product ? 'EXISTS' : 'NOT FOUND'}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing population:', error);
  }
};

// Run the test
testPopulation()
  .then(() => {
    console.log('🏁 Test completed');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ Test failed:', err);
    mongoose.connection.close();
  }); 