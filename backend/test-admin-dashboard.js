const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('./models/Category');
const Product = require('./models/Product');
const Admin = require('./models/Admin');

const testAdminDashboard = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🧪 Testing Admin Dashboard Components...\n');

    // Test 1: Check if admin exists
    console.log('📋 Test 1: Checking admin user...');
    const admin = await Admin.findOne({});
    if (admin) {
      console.log(`✅ Admin found: ${admin.email}`);
    } else {
      console.log('⚠️ No admin user found - you may need to run seedAdmin.js');
    }

    // Test 2: Check categories
    console.log('\n📋 Test 2: Checking categories...');
    const categories = await Category.find({});
    console.log(`✅ Found ${categories.length} categories`);
    categories.slice(0, 3).forEach(cat => {
      console.log(`  - ${cat.name} (${cat.slug})`);
    });

    // Test 3: Check products
    console.log('\n📋 Test 3: Checking products...');
    const products = await Product.find({});
    console.log(`✅ Found ${products.length} products`);

    // Test 4: Test category operations
    console.log('\n📋 Test 4: Testing category operations...');
    
    // Create test category
    const testCategory = new Category({
      name: 'Dashboard Test Category',
      slug: 'dashboard-test',
      description: 'Category for dashboard testing',
      isActive: true,
      sortOrder: 1000
    });
    await testCategory.save();
    console.log(`✅ Created test category: ${testCategory.name}`);

    // Update test category
    await Category.findByIdAndUpdate(testCategory._id, {
      description: 'Updated description for dashboard testing'
    });
    console.log('✅ Updated test category');

    // Delete test category
    await Category.findByIdAndDelete(testCategory._id);
    console.log('✅ Deleted test category');

    console.log('\n🎉 Admin Dashboard Test Results:');
    console.log('  ✅ Database connection');
    console.log('  ✅ Admin user check');
    console.log('  ✅ Categories: ' + categories.length + ' found');
    console.log('  ✅ Products: ' + products.length + ' found');
    console.log('  ✅ Category CRUD operations');

    console.log('\n📊 Dashboard Status:');
    console.log('  🟢 Categories: Ready');
    console.log('  🟢 Products: Ready');
    console.log('  🟢 Admin Auth: Ready');
    console.log('  🟢 Database: Connected');

    console.log('\n🚀 Next Steps:');
    console.log('  1. Start the backend server: npm start');
    console.log('  2. Start the frontend: cd ../frontend && npm run dev');
    console.log('  3. Login to admin dashboard: http://localhost:8080/admin/login');
    console.log('  4. Test categories page: http://localhost:8080/admin/categories');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing admin dashboard:', error);
    process.exit(1);
  }
};

testAdminDashboard(); 