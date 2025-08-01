const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const testServer = async () => {
  try {
    // Test database connection
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test basic Express server
    const app = express();
    app.use(express.json());

    // Test route
    app.get('/test', (req, res) => {
      res.json({ message: 'Server is working!' });
    });

    // Start server on port 5000
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Server test running on port ${PORT}`);
      console.log(`✅ Test URL: http://localhost:${PORT}/test`);
      console.log('\n🎉 Server test completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('  1. Start the full server: npm run dev');
      console.log('  2. Test admin login: http://localhost:8080/admin/login');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Server test failed:', error.message);
    process.exit(1);
  }
};

testServer(); 