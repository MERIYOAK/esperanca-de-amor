const http = require('http');

const testAdminEndpoints = () => {
  console.log('🧪 Testing Admin Endpoints...\n');

  // Test 1: Check if server is responding
  console.log('📋 Test 1: Server connectivity...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Server responding with status: ${res.statusCode}`);
    
    if (res.statusCode === 200 || res.statusCode === 401) {
      console.log('✅ Admin login endpoint is accessible');
      console.log('✅ Server is working correctly');
    } else {
      console.log('⚠️ Unexpected status code');
    }

    console.log('\n🎉 Admin endpoints test completed!');
    console.log('\n📋 Next steps:');
    console.log('  1. Try admin login at: http://localhost:8080/admin/login');
    console.log('  2. Use credentials: admin@edastore.com / admin123456');
    console.log('  3. If still failing, check frontend console for errors');
  });

  req.on('error', (error) => {
    console.error('❌ Error testing admin endpoints:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('  1. Make sure backend server is running: npm run dev');
    console.log('  2. Check if port 5000 is available');
    console.log('  3. Verify MongoDB connection');
  });

  req.write(JSON.stringify({
    email: 'admin@edastore.com',
    password: 'admin123456'
  }));
  req.end();
};

testAdminEndpoints(); 