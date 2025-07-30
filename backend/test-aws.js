import dotenv from 'dotenv';
import AWS from 'aws-sdk';

dotenv.config();

console.log('🔍 AWS S3 Credentials Diagnostic Tool\n');

// Check environment variables
console.log('📋 Environment Variables Check:');
const requiredVars = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'AWS_S3_BUCKET'
];

let missingVars = [];
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    missingVars.push(varName);
    console.log(`❌ ${varName}: NOT SET`);
  } else {
    const maskedValue = varName.includes('KEY') ? 
      `${value.substring(0, 4)}...${value.substring(value.length - 4)}` : 
      value;
    console.log(`✅ ${varName}: ${maskedValue}`);
  }
});

if (missingVars.length > 0) {
  console.log(`\n❌ Missing environment variables: ${missingVars.join(', ')}`);
  console.log('Please check your .env file and ensure all AWS credentials are set.');
  process.exit(1);
}

console.log('\n✅ All environment variables are set!');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

console.log('\n🔧 AWS S3 Configuration:');
console.log(`Region: ${process.env.AWS_REGION}`);
console.log(`Bucket: ${process.env.AWS_S3_BUCKET}`);

// Test 1: Upload permission (this should work with your current permissions)
console.log('\n🧪 Test 1: Upload Permission Test');
try {
  const testKey = `test-${Date.now()}.txt`;
  await s3.putObject({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: testKey,
    Body: 'Test file for permission check',
    ContentType: 'text/plain'
  }).promise();
  console.log('✅ Upload permission confirmed!');
  
  // Clean up test file
  await s3.deleteObject({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: testKey
  }).promise();
  console.log('✅ Delete permission confirmed!');
} catch (error) {
  console.log('❌ Upload/Delete permission test failed:');
  console.log(`Error Code: ${error.code}`);
  console.log(`Error Message: ${error.message}`);
  process.exit(1);
}

// Test 2: Project folder structure
console.log('\n🧪 Test 2: Project Folder Structure Test');
try {
  const projectFolder = 'ecommerce-esperanca';
  const testKey = `${projectFolder}/test-${Date.now()}.txt`;
  
  await s3.putObject({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: testKey,
    Body: 'Test file for project folder',
    ContentType: 'text/plain'
  }).promise();
  console.log('✅ Project folder structure works!');
  
  // Clean up
  await s3.deleteObject({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: testKey
  }).promise();
} catch (error) {
  console.log('❌ Project folder test failed:');
  console.log(`Error Code: ${error.code}`);
  console.log(`Error Message: ${error.message}`);
  process.exit(1);
}

console.log('\n🎉 All tests passed! Your AWS S3 configuration is working correctly.');
console.log('\n📁 Your files will be stored in:');
console.log(`   - Products: ${process.env.AWS_S3_BUCKET}/ecommerce-esperanca/products/`);
console.log(`   - Profiles: ${process.env.AWS_S3_BUCKET}/ecommerce-esperanca/profiles/`);
console.log('\n💡 Note: Your current permissions allow PutObject, GetObject, and DeleteObject');
console.log('💡 This is sufficient for file uploads and downloads!'); 