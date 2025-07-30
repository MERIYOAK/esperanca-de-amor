// Google OAuth Configuration Test
// This utility helps diagnose Google OAuth issues

export const testGoogleOAuthConfig = () => {
  console.log('🔍 Testing Google OAuth Configuration...');
  
  // Check environment variables
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const apiUrl = import.meta.env.VITE_API_URL;
  
  console.log('📋 Environment Variables:');
  console.log('  VITE_GOOGLE_CLIENT_ID:', clientId ? '✅ Set' : '❌ Missing');
  console.log('  VITE_API_URL:', apiUrl ? '✅ Set' : '❌ Missing');
  
  if (!clientId) {
    console.error('❌ VITE_GOOGLE_CLIENT_ID is not set in your .env file');
    console.log('💡 Add this to your frontend/.env file:');
    console.log('   VITE_GOOGLE_CLIENT_ID=your-google-client-id-here');
    return false;
  }
  
  // Check if Google script is loaded
  const googleScript = document.querySelector('script[src*="accounts.google.com"]');
  console.log('🌐 Google Script:', googleScript ? '✅ Loaded' : '❌ Not loaded');
  
  // Check if Google object is available
  const googleAvailable = typeof window.google !== 'undefined';
  console.log('🔧 Google Object:', googleAvailable ? '✅ Available' : '❌ Not available');
  
  // Test backend connectivity
  testBackendConnectivity();
  
  // Check current origin
  const currentOrigin = window.location.origin;
  console.log('📍 Current Origin:', currentOrigin);
  console.log('💡 Make sure this origin is added to Google Cloud Console → OAuth 2.0 → Authorized JavaScript origins');
  
  return true;
};

const testBackendConnectivity = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/api/health`);
    
    if (response.ok) {
      console.log('🔗 Backend API:', '✅ Connected');
    } else {
      console.log('🔗 Backend API:', '❌ Error:', response.status);
    }
  } catch (error) {
    console.log('🔗 Backend API:', '❌ Connection failed');
    console.log('💡 Make sure your backend server is running on port 5000');
  }
};

// Auto-run test when imported
if (import.meta.env.DEV) {
  setTimeout(() => {
    testGoogleOAuthConfig();
  }, 1000);
} 