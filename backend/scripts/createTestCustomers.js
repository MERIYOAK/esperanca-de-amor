const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const testCustomers = [
  {
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1-555-0101',
    role: 'customer',
    isActive: true,
    lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1-555-0102',
    role: 'customer',
    isActive: true,
    lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
  },
  {
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    phone: '+1-555-0103',
    role: 'customer',
    isActive: true,
    lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) // 45 days ago
  },
  {
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    phone: '+1-555-0104',
    role: 'customer',
    isActive: false, // Inactive customer
    lastLogin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
  },
  {
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    phone: '+1-555-0105',
    role: 'customer',
    isActive: true,
    lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
  },
  {
    name: 'Lisa Anderson',
    email: 'lisa.anderson@example.com',
    phone: '+1-555-0106',
    role: 'customer',
    isActive: true,
    lastLogin: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  },
  {
    name: 'Robert Taylor',
    email: 'robert.taylor@example.com',
    phone: '+1-555-0107',
    role: 'customer',
    isActive: true,
    lastLogin: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // 20 days ago
  },
  {
    name: 'Jennifer Martinez',
    email: 'jennifer.martinez@example.com',
    phone: '+1-555-0108',
    role: 'customer',
    isActive: false, // Inactive customer
    lastLogin: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
  },
  {
    name: 'Christopher Lee',
    email: 'christopher.lee@example.com',
    phone: '+1-555-0109',
    role: 'customer',
    isActive: true,
    lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    name: 'Amanda Garcia',
    email: 'amanda.garcia@example.com',
    phone: '+1-555-0110',
    role: 'customer',
    isActive: true,
    lastLogin: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
  }
];

const createTestCustomers = async () => {
  try {
    console.log('🔄 Creating test customers...');
    
    // Check if customers already exist
    const existingCustomers = await User.countDocuments({ role: 'customer' });
    if (existingCustomers > 0) {
      console.log(`⚠️  Found ${existingCustomers} existing customers. Skipping creation.`);
      console.log('💡 To recreate test customers, delete existing ones first.');
      return;
    }

    // Create test customers
    const createdCustomers = await User.insertMany(testCustomers);
    
    console.log(`✅ Successfully created ${createdCustomers.length} test customers:`);
    createdCustomers.forEach(customer => {
      console.log(`   - ${customer.name} (${customer.email}) - ${customer.isActive ? 'Active' : 'Inactive'}`);
    });
    
    console.log('\n🎉 Test customers created successfully!');
    console.log('📊 You can now view them in the Customer Management section of the admin dashboard.');
    
  } catch (error) {
    console.error('❌ Error creating test customers:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed.');
  }
};

// Run the script
createTestCustomers(); 