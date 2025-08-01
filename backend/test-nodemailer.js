const nodemailer = require('nodemailer');

console.log('🧪 Testing Nodemailer Configuration...\n');

console.log('📋 Nodemailer version:', nodemailer.version);
console.log('📋 Available functions:');
console.log('  - createTransport:', typeof nodemailer.createTransport);
console.log('  - createTransporter:', typeof nodemailer.createTransporter);

console.log('\n📋 Testing createTransport function...');
try {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'test@example.com',
      pass: 'test-password'
    }
  });
  console.log('✅ createTransport works correctly');
} catch (error) {
  console.log('❌ createTransport failed:', error.message);
}

console.log('\n📋 Testing createTransporter function...');
try {
  const transporter = nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'test@example.com',
      pass: 'test-password'
    }
  });
  console.log('✅ createTransporter works correctly');
} catch (error) {
  console.log('❌ createTransporter failed:', error.message);
}

console.log('\n📋 Conclusion:');
if (typeof nodemailer.createTransport === 'function') {
  console.log('✅ Use nodemailer.createTransport() in the newsletter controller');
} else if (typeof nodemailer.createTransporter === 'function') {
  console.log('✅ Use nodemailer.createTransporter() in the newsletter controller');
} else {
  console.log('❌ Neither function is available');
} 