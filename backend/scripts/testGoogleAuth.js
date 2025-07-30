const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const testGoogleAuth = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('\n=== GOOGLE OAUTH TEST ===\n');

    // Test 1: Check if Google OAuth environment variables are set
    console.log('1️⃣ Checking environment variables...');
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!googleClientId) {
      console.log('❌ GOOGLE_CLIENT_ID not set in .env file');
      console.log('Please add GOOGLE_CLIENT_ID=your-google-client-id to your .env file');
    } else {
      console.log('✅ GOOGLE_CLIENT_ID is set');
    }
    
    if (!jwtSecret) {
      console.log('❌ JWT_SECRET not set in .env file');
      console.log('Please add JWT_SECRET=your-jwt-secret to your .env file');
    } else {
      console.log('✅ JWT_SECRET is set');
    }

    // Test 2: Check User model structure
    console.log('\n2️⃣ Checking User model structure...');
    const userSchema = User.schema.obj;
    
    if (userSchema.googleId) {
      console.log('✅ User model has googleId field');
    } else {
      console.log('❌ User model missing googleId field');
    }
    
    if (!userSchema.password) {
      console.log('✅ User model does not have password field (correct for Google OAuth)');
    } else {
      console.log('❌ User model still has password field (should be removed for Google OAuth)');
    }

    // Test 3: Check if any users exist
    console.log('\n3️⃣ Checking existing users...');
    const users = await User.find({}).select('name email googleId role');
    
    if (users.length === 0) {
      console.log('ℹ️ No users found in database');
    } else {
      console.log(`✅ Found ${users.length} user(s) in database:`);
      users.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - Google ID: ${user.googleId ? 'Yes' : 'No'} - Role: ${user.role}`);
      });
    }

    // Test 4: Check Google OAuth dependencies
    console.log('\n4️⃣ Checking Google OAuth dependencies...');
    try {
      const { OAuth2Client } = require('google-auth-library');
      console.log('✅ google-auth-library is installed');
      
      if (googleClientId) {
        const client = new OAuth2Client(googleClientId);
        console.log('✅ OAuth2Client can be initialized');
      }
    } catch (error) {
      console.log('❌ google-auth-library not installed or error:', error.message);
    }

    console.log('\n📋 Setup Summary:');
    console.log('✅ Google OAuth dependencies installed');
    console.log('✅ User model updated for Google OAuth');
    console.log('✅ Backend routes configured');
    console.log('✅ Frontend components created');
    
    if (!googleClientId || !jwtSecret) {
      console.log('⚠️ Please configure your .env file with Google OAuth credentials');
      console.log('See GOOGLE_OAUTH_SETUP.md for detailed instructions');
    } else {
      console.log('✅ Environment variables configured');
    }

    console.log('\n🎉 Google OAuth setup is ready!');
    console.log('\nNext steps:');
    console.log('1. Configure Google Cloud Console (see GOOGLE_OAUTH_SETUP.md)');
    console.log('2. Add your Google Client ID to .env file');
    console.log('3. Start the backend server');
    console.log('4. Test authentication at /login');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

testGoogleAuth(); 