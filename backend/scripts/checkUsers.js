const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const checkUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if there are any users
    const users = await User.find({}).select('name email role');
    console.log('Users in database:', users);

    if (users.length === 0) {
      console.log('No users found in database. You need to register a user first.');
    } else {
      console.log(`Found ${users.length} user(s) in database:`);
      users.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

checkUsers(); 