const http = require('http');

console.log('🧪 Testing Newsletter Flow (Without Email Configuration)...\n');

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

const testNewsletterSubscribe = async () => {
  console.log('\n📋 2. Testing newsletter subscription...');
  try {
    const response = await makeRequest('POST', '/api/newsletter/subscribe', testSubscriber);
    console.log('📋 Response status:', response.status);
    console.log('📋 Response data:', response.data);
    
    if (response.status === 201) {
      console.log('✅ Newsletter subscription endpoint working');
      return true;
    } else {
      console.log('⚠️ Newsletter subscription endpoint responded with status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Newsletter subscription failed:', error.message);
    return false;
  }
};

const testDuplicateSubscription = async () => {
  console.log('\n📋 3. Testing duplicate subscription...');
  try {
    const response = await makeRequest('POST', '/api/newsletter/subscribe', testSubscriber);
    console.log('📋 Response status:', response.status);
    console.log('📋 Response data:', response.data);
    
    if (response.status === 400) {
      console.log('✅ Duplicate subscription properly handled');
      return true;
    } else {
      console.log('⚠️ Duplicate subscription handling unexpected');
      return false;
    }
  } catch (error) {
    console.log('❌ Duplicate subscription test failed:', error.message);
    return false;
  }
};

const testSecondSubscription = async () => {
  console.log('\n📋 4. Testing second subscription...');
  try {
    const response = await makeRequest('POST', '/api/newsletter/subscribe', testSubscriber2);
    console.log('📋 Response status:', response.status);
    console.log('📋 Response data:', response.data);
    
    if (response.status === 201) {
      console.log('✅ Second subscription working');
      return true;
    } else {
      console.log('⚠️ Second subscription failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Second subscription test failed:', error.message);
    return false;
  }
};

const testInvalidEmail = async () => {
  console.log('\n📋 5. Testing invalid email...');
  try {
    const invalidSubscriber = {
      email: 'invalid-email',
      name: 'Test User',
      source: 'homepage'
    };
    
    const response = await makeRequest('POST', '/api/newsletter/subscribe', invalidSubscriber);
    console.log('📋 Response status:', response.status);
    console.log('📋 Response data:', response.data);
    
    if (response.status === 400) {
      console.log('✅ Invalid email properly handled');
      return true;
    } else {
      console.log('⚠️ Invalid email handling unexpected');
      return false;
    }
  } catch (error) {
    console.log('❌ Invalid email test failed:', error.message);
    return false;
  }
};

const testMissingEmail = async () => {
  console.log('\n📋 6. Testing missing email...');
  try {
    const invalidSubscriber = {
      name: 'Test User',
      source: 'homepage'
    };
    
    const response = await makeRequest('POST', '/api/newsletter/subscribe', invalidSubscriber);
    console.log('📋 Response status:', response.status);
    console.log('📋 Response data:', response.data);
    
    if (response.status === 400) {
      console.log('✅ Missing email properly handled');
      return true;
    } else {
      console.log('⚠️ Missing email handling unexpected');
      return false;
    }
  } catch (error) {
    console.log('❌ Missing email test failed:', error.message);
    return false;
  }
};

const testPendingSubscribers = async () => {
  console.log('\n📋 7. Testing pending subscribers endpoint...');
  try {
    const response = await makeRequest('GET', '/api/admin/newsletter/pending');
    console.log('📋 Response status:', response.status);
    console.log('📋 Response data:', response.data);
    
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
  console.log('\n📋 8. Testing newsletter stats endpoint...');
  try {
    const response = await makeRequest('GET', '/api/admin/newsletter/stats');
    console.log('📋 Response status:', response.status);
    console.log('📋 Response data:', response.data);
    
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

// Main test function
const runAllTests = async () => {
  console.log('🚀 Starting Newsletter Flow Tests...\n');
  
  const tests = [
    { name: 'Server Connection', fn: testServerConnection },
    { name: 'Newsletter Subscribe', fn: testNewsletterSubscribe },
    { name: 'Duplicate Subscription', fn: testDuplicateSubscription },
    { name: 'Second Subscription', fn: testSecondSubscription },
    { name: 'Invalid Email', fn: testInvalidEmail },
    { name: 'Missing Email', fn: testMissingEmail },
    { name: 'Pending Subscribers', fn: testPendingSubscribers },
    { name: 'Newsletter Stats', fn: testNewsletterStats }
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
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Newsletter system is working correctly.');
    console.log('\n📖 Next steps:');
    console.log('1. Configure email settings in .env file');
    console.log('2. Test email sending with: node test-email-config.js');
    console.log('3. Test complete flow with email confirmation');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the server and database connection.');
  }
};

// Run the tests
runAllTests().catch(console.error); 