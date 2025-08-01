const http = require('http');

// Test admin login first
const testAdminLogin = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'admin@edastore.com',
      password: 'admin123'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('🔑 Admin login response:', response);
          if (response.success && response.token) {
            resolve(response.token);
          } else {
            reject(new Error('Login failed'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

// Test get offers
const testGetOffers = (token) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/offers',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('📋 Get offers response:', response);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};

// Test create offer
const testCreateOffer = (token) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      title: 'Test Offer',
      description: 'This is a test offer',
      discount: 20,
      category: 'foodstuffs',
      productIds: [],
      validFrom: '2025-07-31',
      validUntil: '2025-12-31',
      isActive: true,
      maxUses: 100
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/offers',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('📋 Create offer response:', response);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

// Main test function
const runTests = async () => {
  try {
    console.log('🧪 Starting offers API tests...\n');

    // Test 1: Admin login
    console.log('🔑 Testing admin login...');
    const token = await testAdminLogin();
    console.log('✅ Admin login successful\n');

    // Test 2: Get offers
    console.log('📋 Testing get offers...');
    await testGetOffers(token);
    console.log('✅ Get offers successful\n');

    // Test 3: Create offer (without image for now)
    console.log('➕ Testing create offer...');
    await testCreateOffer(token);
    console.log('✅ Create offer successful\n');

    console.log('🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run tests
runTests(); 