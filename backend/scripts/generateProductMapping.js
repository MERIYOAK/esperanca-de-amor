const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

const generateProductMapping = async () => {
  try {
    // Fetch all products from database
    const products = await Product.find({}).sort({ createdAt: 1 });
    
    console.log('\n📋 Product ID Mapping for Frontend:');
    console.log('=====================================');
    
    // Generate mapping object
    const mapping = {};
    products.forEach((product, index) => {
      const demoId = index + 1; // Demo products are numbered 1, 2, 3, etc.
      mapping[demoId] = product._id.toString();
      
      console.log(`Demo ID ${demoId} → MongoDB ID: ${product._id}`);
      console.log(`Product: ${product.name}`);
      console.log(`Price: $${(product.price / 100).toFixed(2)}`);
      console.log(`Category: ${product.category}`);
      console.log('---');
    });
    
    console.log('\n🎯 Frontend Product Mapping Object:');
    console.log('====================================');
    console.log(JSON.stringify(mapping, null, 2));
    
    console.log('\n📝 Instructions for Frontend:');
    console.log('==============================');
    console.log('1. Replace the demo product IDs in your frontend components');
    console.log('2. Use the mapping above to convert demo IDs to MongoDB ObjectIds');
    console.log('3. Update your API calls to use the real product IDs');
    console.log('4. Test the wishlist functionality with real database products');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating product mapping:', error);
    process.exit(1);
  }
};

// Run the mapping generation
connectDB().then(() => {
  generateProductMapping();
}); 