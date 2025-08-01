const mongoose = require('mongoose');
require('dotenv').config();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedOrders = async () => {
  try {
    // Get existing users and products
    const users = await User.find().limit(5);
    const products = await Product.find().limit(10);

    if (users.length === 0) {
      console.log('❌ No users found. Please seed users first.');
      return;
    }

    if (products.length === 0) {
      console.log('❌ No products found. Please seed products first.');
      return;
    }

    // Clear existing orders
    await Order.deleteMany({});
    console.log('🗑️ Cleared existing orders');

    const sampleOrders = [];

    // Create orders for the last 30 days
    for (let i = 0; i < 25; i++) {
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));
      
      const user = users[Math.floor(Math.random() * users.length)];
      const numItems = Math.floor(Math.random() * 5) + 1;
      const items = [];
      let totalAmount = 0;

      // Create random items for this order
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = product.price;
        const itemTotal = price * quantity;
        totalAmount += itemTotal;

        items.push({
          product: product._id,
          name: product.name,
          price: price,
          quantity: quantity,
          total: itemTotal
        });
      }

      // Random status
      const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const order = {
        orderNumber: orderNumber,
        user: user._id,
        items: items,
        totalAmount: totalAmount,
        status: status,
        shippingAddress: {
          street: 'Sample Street',
          city: 'Sample City',
          state: 'Sample State',
          zipCode: '12345',
          phone: '1234567890'
        },
        paymentMethod: 'cash_on_delivery',
        notes: 'Sample order for testing',
        createdAt: orderDate,
        updatedAt: orderDate
      };

      sampleOrders.push(order);
    }

    // Insert orders
    await Order.insertMany(sampleOrders);
    console.log(`✅ Created ${sampleOrders.length} sample orders`);

    // Show summary
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    console.log('\n📊 Orders Summary:');
    console.log(`Total Orders: ${totalOrders}`);
    console.log(`Total Revenue: $${(totalRevenue[0]?.total || 0) / 100}`);

    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📈 Status Distribution:');
    statusCounts.forEach(status => {
      console.log(`${status._id}: ${status.count}`);
    });

  } catch (error) {
    console.error('❌ Error seeding orders:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

connectDB().then(() => {
  seedOrders();
}); 