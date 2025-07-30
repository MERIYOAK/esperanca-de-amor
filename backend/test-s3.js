const AWS = require('aws-sdk');
require('dotenv').config();

// Check environment variables
console.log('🔍 Checking AWS Environment Variables...');
const requiredVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'AWS_S3_BUCKET'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing environment variables:', missingVars);
  console.error('Please check your .env file and ensure all variables are set.');
  process.exit(1);
}

console.log('✅ All environment variables are set');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function testS3Connection() {
  console.log('\n🔍 Testing S3 Connection...');
  
  try {
    // Test bucket access
    console.log(`Testing access to bucket: ${process.env.AWS_S3_BUCKET}`);
    await s3.headBucket({ Bucket: process.env.AWS_S3_BUCKET }).promise();
    console.log('✅ S3 bucket access successful');
    
    // Test listing objects
    console.log('\n🔍 Testing bucket listing...');
    const listResult = await s3.listObjectsV2({ 
      Bucket: process.env.AWS_S3_BUCKET,
      MaxKeys: 5 
    }).promise();
    
    console.log(`✅ Bucket listing successful. Found ${listResult.Contents?.length || 0} objects`);
    
    // Test upload permissions
    console.log('\n🔍 Testing upload permissions...');
    const testKey = `test-${Date.now()}.txt`;
    const testContent = 'This is a test file to verify upload permissions.';
    
    await s3.putObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain'
    }).promise();
    
    console.log('✅ Upload test successful');
    
    // Clean up test file
    await s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: testKey
    }).promise();
    
    console.log('✅ Delete test successful');
    console.log('\n🎉 All S3 tests passed! Your configuration is working correctly.');
    
  } catch (error) {
    console.error('\n❌ S3 test failed:', error.message);
    
    switch (error.code) {
      case 'NoSuchBucket':
        console.error('❌ The specified S3 bucket does not exist:', process.env.AWS_S3_BUCKET);
        console.error('💡 Please create the bucket or check the bucket name in your .env file');
        break;
        
      case 'AccessDenied':
        console.error('❌ Access denied to S3 bucket');
        console.error('💡 Please check your AWS credentials and IAM permissions');
        console.error('💡 Ensure your IAM user has the following permissions:');
        console.error('   - s3:GetObject');
        console.error('   - s3:PutObject');
        console.error('   - s3:DeleteObject');
        console.error('   - s3:ListBucket');
        break;
        
      case 'InvalidAccessKeyId':
        console.error('❌ Invalid AWS Access Key ID');
        console.error('💡 Please check your AWS_ACCESS_KEY_ID in the .env file');
        break;
        
      case 'SignatureDoesNotMatch':
        console.error('❌ Invalid AWS Secret Access Key');
        console.error('💡 Please check your AWS_SECRET_ACCESS_KEY in the .env file');
        break;
        
      case 'InvalidToken':
        console.error('❌ Invalid AWS session token');
        console.error('💡 If using temporary credentials, ensure they are still valid');
        break;
        
      default:
        console.error('💡 Please check your AWS configuration and try again');
    }
    
    process.exit(1);
  }
}

// Run the test
testS3Connection(); 