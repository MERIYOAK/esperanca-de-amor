const nodemailer = require('nodemailer');
require('dotenv').config();

const testEmailConfiguration = async () => {
  console.log('🧪 Testing email configuration...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('  - SMTP_HOST:', process.env.SMTP_HOST || 'Not set');
  console.log('  - SMTP_PORT:', process.env.SMTP_PORT || 'Not set');
  console.log('  - SMTP_USER:', process.env.SMTP_USER || 'Not set');
  console.log('  - SMTP_PASS:', process.env.SMTP_PASS ? 'Set' : 'Not set');
  console.log('  - FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set');
  
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('\n❌ Missing required email configuration. Please set up your .env file.');
    console.log('📖 See email-configuration-guide.md for setup instructions.');
    return;
  }
  
  try {
    console.log('\n📋 Creating email transporter...');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    console.log('✅ Email transporter created successfully');
    
    // Test connection
    console.log('\n📋 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    
    // Test sending email
    console.log('\n📋 Testing email sending...');
    const testEmail = {
      from: process.env.SMTP_USER,
      to: 'test@example.com', // This will fail but we can test the connection
      subject: 'Test Email from EDA Store Newsletter System',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from the EDA Store newsletter system.</p>
        <p>If you receive this email, your email configuration is working correctly!</p>
        <hr>
        <p><small>Sent from: ${process.env.SMTP_HOST}</small></p>
      `
    };
    
    const result = await transporter.sendMail(testEmail);
    console.log('✅ Email sent successfully!');
    console.log('📋 Message ID:', result.messageId);
    
    console.log('\n🎉 Email configuration is working correctly!');
    console.log('📖 You can now use the newsletter system to send confirmation emails.');
    
  } catch (error) {
    console.error('\n❌ Email configuration test failed:');
    console.error('  - Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('  1. Your email address is correct');
      console.log('  2. Your app password is correct (not your main password)');
      console.log('  3. 2-factor authentication is enabled on your Gmail account');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n💡 Connection failed. Please check:');
      console.log('  1. Your internet connection');
      console.log('  2. SMTP host and port are correct');
      console.log('  3. Firewall settings allow SMTP connections');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n💡 SMTP host not found. Please check:');
      console.log('  1. SMTP_HOST is set correctly');
      console.log('  2. You have internet connection');
    }
    
    console.log('\n📖 See email-configuration-guide.md for troubleshooting tips.');
  }
};

// Run the test
testEmailConfiguration(); 