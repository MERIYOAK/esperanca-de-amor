const http = require('http');

// Test if the server is running
const testServer = () => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET',
    headers: {
      'Origin': 'http://localhost:8080',
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log('✅ Server is running!');
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
    });
  });

  req.on('error', (err) => {
    console.log('❌ Server is not running or not accessible');
    console.log('Error:', err.message);
    console.log('\nTo start the server, run:');
    console.log('cd backend && npm start');
  });

  req.end();
};

// Test CORS preflight
const testCORS = () => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/offers',
    method: 'OPTIONS',
    headers: {
      'Origin': 'http://localhost:8080',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'Content-Type, Authorization'
    }
  };

  const req = http.request(options, (res) => {
    console.log('\n🔍 Testing CORS preflight...');
    console.log('Status:', res.statusCode);
    console.log('CORS Headers:');
    console.log('- Access-Control-Allow-Origin:', res.headers['access-control-allow-origin']);
    console.log('- Access-Control-Allow-Methods:', res.headers['access-control-allow-methods']);
    console.log('- Access-Control-Allow-Headers:', res.headers['access-control-allow-headers']);
    
    if (res.headers['access-control-allow-origin']) {
      console.log('✅ CORS is configured correctly!');
    } else {
      console.log('❌ CORS headers are missing!');
    }
  });

  req.on('error', (err) => {
    console.log('❌ CORS test failed:', err.message);
  });

  req.end();
};

console.log('🔍 Testing server status...');
testServer();

// Wait a bit then test CORS
setTimeout(() => {
  testCORS();
}, 1000); 