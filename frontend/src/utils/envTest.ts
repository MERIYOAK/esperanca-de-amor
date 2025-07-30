// Environment variable test utility
export const testEnvironmentVariables = () => {
  console.log('=== FRONTEND ENVIRONMENT VARIABLES TEST ===');
  
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const apiUrl = import.meta.env.VITE_API_URL;
  
  console.log('VITE_GOOGLE_CLIENT_ID:', googleClientId ? '✅ Set' : '❌ Not set');
  console.log('VITE_API_URL:', apiUrl ? '✅ Set' : '❌ Not set');
  
  if (!googleClientId) {
    console.warn('⚠️ VITE_GOOGLE_CLIENT_ID is not set. Please add it to your .env file.');
    console.warn('See FRONTEND_SETUP.md for instructions.');
  }
  
  if (!apiUrl) {
    console.warn('⚠️ VITE_API_URL is not set. Using default: http://localhost:5000');
  }
  
  return {
    googleClientId: googleClientId || 'not-set',
    apiUrl: apiUrl || 'http://localhost:5000'
  };
};

// Call this function to test environment variables
if (typeof window !== 'undefined') {
  // Only run in browser environment
  testEnvironmentVariables();
} 