const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Test the offers API
const testOffersAPI = async () => {
  try {
    console.log('🔄 Testing offers API...');
    
    // Test the API endpoint
    const response = await fetch('http://localhost:5000/api/offers');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Offers API is working!');
      console.log(`📊 Found ${data.data.offers.length} active offers`);
      
      data.data.offers.forEach((offer, index) => {
        console.log(`\n📋 Offer ${index + 1}:`);
        console.log(`   Title: ${offer.title}`);
        console.log(`   Code: ${offer.code}`);
        console.log(`   Type: ${offer.type}`);
        console.log(`   Discount: ${offer.discountValue}${offer.discountType === 'percentage' ? '%' : '$'}`);
        console.log(`   Active: ${offer.isActive}`);
        console.log(`   Products: ${offer.applicableProducts.length}`);
      });
    } else {
      console.log('❌ Offers API failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Error testing offers API:', error);
  }
};

// Run the test
testOffersAPI()
  .then(() => {
    console.log('🏁 Test completed');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ Test failed:', err);
    mongoose.connection.close();
  }); 