const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const checkCustomers = async () => {
  try {
    console.log('🔍 Checking for customers in database...');
    
    const customers = await User.find({ role: 'customer' }).select('-password');
    
    if (customers.length === 0) {
      console.log('❌ No customers found in database.');
      console.log('💡 To see customers in the admin dashboard, you need to:');
      console.log('   1. Run: node scripts/createTestCustomers.js (for test data)');
      console.log('   2. Or have users register through Google OAuth on your website');
    } else {
      console.log(`✅ Found ${customers.length} customers:`);
      customers.forEach((customer, index) => {
        console.log(`   ${index + 1}. ${customer.name} (${customer.email}) - ${customer.isActive ? 'Active' : 'Inactive'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking customers:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed.');
  }
};

// Run the script
checkCustomers(); 