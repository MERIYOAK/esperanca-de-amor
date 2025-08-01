const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up environment configuration...\n');

// Check if .env file already exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('📋 .env file already exists. Reading current configuration...');
  const currentEnv = fs.readFileSync(envPath, 'utf8');
  console.log('Current .env content:');
  console.log(currentEnv);
  console.log('\n📖 To update email configuration, edit the .env file manually.');
  return;
}

// Create basic .env template
const envTemplate = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ecommerce-esperanca

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=cabindaretailshop

# Email Configuration (Gmail Example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL for email links
FRONTEND_URL=http://localhost:3000

# Admin Configuration
ADMIN_EMAIL=admin@esperancadeamor.com
ADMIN_PASSWORD=admin123

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
`;

try {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env file created successfully!');
  console.log('📋 Location:', envPath);
  console.log('\n📖 Next steps:');
  console.log('1. Edit the .env file and update the email configuration:');
  console.log('   - SMTP_USER: Your Gmail address');
  console.log('   - SMTP_PASS: Your Gmail app password');
  console.log('   - FRONTEND_URL: Your frontend URL (http://localhost:3000)');
  console.log('\n2. For Gmail setup:');
  console.log('   - Enable 2-factor authentication');
  console.log('   - Generate app password for "EDA Store Newsletter"');
  console.log('   - Use the app password as SMTP_PASS');
  console.log('\n3. Test the configuration:');
  console.log('   node test-email-config.js');
  console.log('\n📖 See email-configuration-guide.md for detailed instructions.');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  console.log('\n📖 Please create the .env file manually with the following content:');
  console.log(envTemplate);
} 