const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('./models/Category');

const testCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test 1: Check if categories exist
    const categories = await Category.find({});
    console.log(`📊 Found ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.slug}) - Active: ${cat.isActive}`);
    });

    console.log('\n🎉 Category test completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing categories:', error);
    process.exit(1);
  }
};

testCategories(); 