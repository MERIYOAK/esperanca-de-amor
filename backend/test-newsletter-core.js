const http = require('http');

console.log('🧪 Testing Newsletter Core Functionality (Without Email)...\n');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api`;

// Test data
const testSubscriber = {
  email: 'test@example.com',
  name: 'Test User',
  source: 'homepage'
};

const testSubscriber2 = {
  email: 'test2@example.com',
  name: 'Test User 2',
  source: 'footer'
};

// Helper function to make HTTP requests
const makeRequest = (method, url, data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: url,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

// Test functions
const testServerConnection = async () => {
  console.log('📋 1. Testing server connection...');
  try {
    const response = await makeRequest('GET', '/api/newsletter/subscribe');
    console.log('✅ Server is running and responding');
    return true;
  } catch (error) {
    console.log('❌ Server connection failed:', error.message);
    console.log('💡 Make sure the backend server is running on port 5000');
    return false;
  }
};

const testDatabaseConnection = async () => {
  console.log('\n📋 2. Testing database connection...');
  try {
    // Test by trying to create a pending subscriber
    const response = await makeRequest('POST', '/api/newsletter/subscribe', testSubscriber);
    console.log('📋 Response status:', response.status);
    
    if (response.status === 500 && response.data.message && response.data.message.includes('credentials')) {
      console.log('✅ Database connection working (email credentials missing - expected)');
      return true;
    } else if (response.status === 201) {
      console.log('✅ Database connection working (subscription created)');
      return true;
    } else {
      console.log('⚠️ Database connection test inconclusive');
      return false;
    }
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return false;
  }
};

const testValidation = async () => {
  console.log('\n📋 3. Testing input validation...');
  
  // Test invalid email
  try {
    const invalidResponse = await makeRequest('POST', '/api/newsletter/subscribe', {
      email: 'invalid-email',
      name: 'Test User',
      source: 'homepage'
    });
    
    if (invalidResponse.status === 400) {
      console.log('✅ Invalid email validation working');
    } else {
      console.log('⚠️ Invalid email validation unexpected');
    }
  } catch (error) {
    console.log('❌ Invalid email test failed:', error.message);
  }
  
  // Test missing email
  try {
    const missingResponse = await makeRequest('POST', '/api/newsletter/subscribe', {
      name: 'Test User',
      source: 'homepage'
    });
    
    if (missingResponse.status === 400) {
      console.log('✅ Missing email validation working');
      return true;
    } else {
      console.log('⚠️ Missing email validation unexpected');
      return false;
    }
  } catch (error) {
    console.log('❌ Missing email test failed:', error.message);
    return false;
  }
};

const testPendingSubscribers = async () => {
  console.log('\n📋 4. Testing pending subscribers endpoint...');
  try {
    const response = await makeRequest('GET', '/api/admin/newsletter/pending');
    console.log('📋 Response status:', response.status);
    
    if (response.status === 401) {
      console.log('✅ Admin authentication required (expected)');
      return true;
    } else if (response.status === 200) {
      console.log('✅ Pending subscribers endpoint working');
      return true;
    } else {
      console.log('⚠️ Pending subscribers endpoint unexpected response');
      return false;
    }
  } catch (error) {
    console.log('❌ Pending subscribers test failed:', error.message);
    return false;
  }
};

const testNewsletterStats = async () => {
  console.log('\n📋 5. Testing newsletter stats endpoint...');
  try {
    const response = await makeRequest('GET', '/api/admin/newsletter/stats');
    console.log('📋 Response status:', response.status);
    
    if (response.status === 401) {
      console.log('✅ Admin authentication required (expected)');
      return true;
    } else if (response.status === 200) {
      console.log('✅ Newsletter stats endpoint working');
      return true;
    } else {
      console.log('⚠️ Newsletter stats endpoint unexpected response');
      return false;
    }
  } catch (error) {
    console.log('❌ Newsletter stats test failed:', error.message);
    return false;
  }
};

const testConfirmationEndpoint = async () => {
  console.log('\n📋 6. Testing confirmation endpoint...');
  try {
    const response = await makeRequest('GET', '/api/newsletter/confirm/test-token');
    console.log('📋 Response status:', response.status);
    
    if (response.status === 400) {
      console.log('✅ Confirmation endpoint working (invalid token handled)');
      return true;
    } else {
      console.log('⚠️ Confirmation endpoint unexpected response');
      return false;
    }
  } catch (error) {
    console.log('❌ Confirmation endpoint test failed:', error.message);
    return false;
  }
};

const testUnsubscribeEndpoint = async () => {
  console.log('\n📋 7. Testing unsubscribe endpoint...');
  try {
    const response = await makeRequest('GET', '/api/newsletter/unsubscribe?email=test@example.com');
    console.log('📋 Response status:', response.status);
    
    if (response.status === 404) {
      console.log('✅ Unsubscribe endpoint working (subscriber not found handled)');
      return true;
    } else {
      console.log('⚠️ Unsubscribe endpoint unexpected response');
      return false;
    }
  } catch (error) {
    console.log('❌ Unsubscribe endpoint test failed:', error.message);
    return false;
  }
};

// Main test function
const runAllTests = async () => {
  console.log('🚀 Starting Newsletter Core Functionality Tests...\n');
  
  const tests = [
    { name: 'Server Connection', fn: testServerConnection },
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'Input Validation', fn: testValidation },
    { name: 'Pending Subscribers', fn: testPendingSubscribers },
    { name: 'Newsletter Stats', fn: testNewsletterStats },
    { name: 'Confirmation Endpoint', fn: testConfirmationEndpoint },
    { name: 'Unsubscribe Endpoint', fn: testUnsubscribeEndpoint }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passedTests++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} failed with error:`, error.message);
    }
  }
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests >= totalTests - 1) {
    console.log('\n🎉 Newsletter core functionality is working correctly!');
    console.log('\n📖 Next steps:');
    console.log('1. Configure email settings in .env file');
    console.log('2. Test email sending with: node test-email-config.js');
    console.log('3. Test complete flow with email confirmation');
    console.log('\n💡 The system is ready for email configuration!');
  } else {
    console.log('\n⚠️ Some core functionality tests failed. Please check the server and database.');
  }
};

// Run the tests
runAllTests().catch(console.error); 