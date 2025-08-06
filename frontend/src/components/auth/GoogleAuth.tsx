import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleAuthProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

const GoogleAuth = ({ onSuccess, onError, className = '' }: GoogleAuthProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [buttonRendered, setButtonRendered] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<string>('checking');
  const { login } = useAuth();
  const { toast } = useToast();

  // Test network connectivity without CORS issues
  const testNetworkConnectivity = async () => {
    try {
      console.log('🔍 Testing network connectivity...');
      
      // Test basic internet connectivity using a simple image
      const img = new Image();
      img.onload = () => {
        console.log('✅ Basic internet connectivity: OK');
        setNetworkStatus('connected');
      };
      img.onerror = () => {
        console.warn('⚠️ Basic connectivity test failed');
        setNetworkStatus('partial');
      };
      img.src = 'https://www.google.com/favicon.ico';
      
    } catch (error) {
      console.error('❌ Network connectivity test failed:', error);
      setNetworkStatus('disconnected');
    }
  };

  // Define handleCredentialResponse first since it's used in handleScriptLoad
  const handleCredentialResponse = async (response: any) => {
    setIsLoading(true);
    
    try {
      console.log('Google OAuth response received');
      
      // Send token to backend
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const backendResponse = await fetch(`${apiUrl}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: response.credential,
          tokenType: 'idToken',
          profileImage: null // User can upload custom profile image later
        }),
      });

      const data = await backendResponse.json();

      if (data.success) {
        // Login user with the new function signature
        login(data.data.user, data.data.token);
        
        // Show success message
        toast({
          title: data.data.isNewUser ? 'Account Created!' : 'Login Successful!',
          description: data.message,
          variant: 'default',
        });

        // Call success callback
        if (onSuccess) {
          onSuccess(data.data.user);
        }
      } else {
        throw new Error(data.message || 'Authentication failed');
      }
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      
      let errorMessage = 'Authentication failed. Please try again.';
      
      // Provide specific error messages for common issues
      if (error.message?.includes('origin is not allowed')) {
        errorMessage = 'Domain not authorized. Please check Google Cloud Console configuration.';
      } else if (error.message?.includes('client ID')) {
        errorMessage = 'Invalid Google Client ID. Please check your environment variables.';
      } else if (error.message?.includes('403')) {
        errorMessage = 'Access denied. Please check your Google OAuth configuration.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Authentication Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Define handleScriptLoad after handleCredentialResponse
  const handleScriptLoad = () => {
    if (window.google && window.google.accounts) {
      console.log('✅ Google object available');
      
      // Enable debug mode for troubleshooting
      if (import.meta.env.DEV) {
        localStorage.setItem('gsi_debug', 'true');
      }
      
      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id',
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        
        console.log('✅ Google OAuth initialized');

        // Get the button container
        const buttonContainer = document.getElementById('google-signin-button');
        if (buttonContainer) {
          console.log('✅ Button container found');
          
          // Clear any existing content
          buttonContainer.innerHTML = '';
          
          // Calculate responsive width
          const buttonWidth = window.innerWidth < 640 ? 280 : 300;
          console.log('🔍 Button width:', buttonWidth);
          
          window.google.accounts.id.renderButton(
            buttonContainer,
            {
              theme: 'outline',
              size: 'large',
              text: 'signin_with', // Always use signin_with for consistent experience
              shape: 'rectangular',
              width: buttonWidth, // Responsive width
            }
          );
          
          console.log('✅ Google button rendered');
          setButtonRendered(true);
          
          // Check if button is actually visible
          setTimeout(() => {
            const googleButton = buttonContainer.querySelector('div[role="button"]');
            if (googleButton) {
              console.log('✅ Google button element found in DOM');
              console.log('🔍 Button dimensions:', googleButton.getBoundingClientRect());
            } else {
              console.warn('⚠️ Google button element not found in DOM');
            }
          }, 1000);
          
        } else {
          console.error('❌ Button container not found');
        }
      } catch (error) {
        console.error('❌ Error initializing Google OAuth:', error);
        setScriptError('Failed to initialize Google OAuth');
      }
    } else {
      console.error('❌ Google object not available after script load');
      setScriptError('Google OAuth not available');
    }
  };

  // Load Google OAuth script using a CORS-safe approach
  const loadGoogleScript = () => {
    console.log('🔄 Loading Google OAuth script...');
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    // Remove crossOrigin to avoid CORS issues
    // script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      console.log('✅ Google script loaded successfully');
      setScriptLoaded(true);
      setScriptError(null);
      
      // Wait a moment for the Google object to be available
      setTimeout(() => {
        if (window.google && window.google.accounts) {
          handleScriptLoad();
        } else {
          console.error('❌ Google object not available after script load');
          setScriptError('Google OAuth not available after script load');
        }
      }, 500);
    };

    script.onerror = (error) => {
      console.error('❌ Failed to load Google script:', error);
      setScriptError('Failed to load Google OAuth script. Please check your internet connection.');
      
      // Try alternative loading method
      console.log('🔄 Trying alternative loading method...');
      loadGoogleScriptAlternative();
    };

    document.head.appendChild(script);
  };

  // Alternative loading method using JSONP-style approach
  const loadGoogleScriptAlternative = () => {
    console.log('🔄 Trying alternative loading method...');
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client?onload=googleAuthInit';
    script.async = true;
    script.defer = true;
    
    // Define global callback
    (window as any).googleAuthInit = () => {
      console.log('✅ Google script loaded via alternative method');
      setScriptLoaded(true);
      setScriptError(null);
      
      setTimeout(() => {
        if (window.google && window.google.accounts) {
          handleScriptLoad();
        } else {
          console.error('❌ Google object not available after alternative load');
          setScriptError('Google OAuth not available after alternative load');
        }
      }, 500);
    };

    script.onerror = (error) => {
      console.error('❌ Alternative loading also failed:', error);
      setScriptError('Unable to load Google OAuth. Please check your internet connection and try refreshing the page.');
    };

    document.head.appendChild(script);
  };

  useEffect(() => {
    console.log('🔍 GoogleAuth: Initializing...');
    console.log('🔍 Screen width:', window.innerWidth);
    console.log('🔍 Client ID configured:', !!import.meta.env.VITE_GOOGLE_CLIENT_ID);
    console.log('🔍 Current origin:', window.location.origin);
    console.log('🔍 User agent:', navigator.userAgent);
    
    // Test network connectivity first
    testNetworkConnectivity();
    
    // Check if Google object is already available
    if (window.google && window.google.accounts) {
      console.log('✅ Google object already available');
      setScriptLoaded(true);
      handleScriptLoad();
      return;
    }

    // Check if script is already loaded
    const existingScript = document.querySelector('script[src*="accounts.google.com"]');
    if (existingScript) {
      console.log('✅ Google script already exists, waiting for load...');
      // Wait a bit for the script to load if it's still loading
      setTimeout(() => {
        if (window.google && window.google.accounts) {
          console.log('✅ Google object now available');
          setScriptLoaded(true);
          handleScriptLoad();
        } else {
          console.log('⚠️ Script exists but Google object not available, retrying...');
          loadGoogleScript();
        }
      }, 1000);
      return;
    }

    // Start loading
    loadGoogleScript();

    return () => {
      // Cleanup
      try {
        const scripts = document.querySelectorAll('script[src*="accounts.google.com"]');
        scripts.forEach(script => {
          // Check if the script is still in the DOM and is a child of document.head
          if (script && document.head && document.head.contains(script)) {
            try {
              document.head.removeChild(script);
              console.log('✅ Google script removed successfully');
            } catch (error) {
              console.warn('⚠️ Script already removed or not found:', error);
            }
          } else {
            console.log('ℹ️ Script not found in document.head, skipping removal');
          }
        });
      } catch (error) {
        console.warn('⚠️ Error during script cleanup:', error);
      }
      
      // Clean up global callback
      try {
        if ((window as any).googleAuthInit) {
          delete (window as any).googleAuthInit;
          console.log('✅ Global callback cleaned up');
        }
      } catch (error) {
        console.warn('⚠️ Error cleaning up global callback:', error);
      }
    };
  }, []);

  const handleManualGoogleAuth = async () => {
    setIsLoading(true);
    
    try {
      // This is a fallback for manual Google OAuth
      // In a real implementation, you'd use Google's OAuth flow
      toast({
        title: 'Google OAuth',
        description: 'Please use the Google Sign-In button above.',
        variant: 'default',
      });
    } catch (error: any) {
      toast({
        title: 'Authentication Failed',
        description: error.message || 'Please use the Google Sign-In button.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const retryScriptLoad = () => {
    console.log('🔄 Retrying script load...');
    setScriptError(null);
    setScriptLoaded(false);
    setButtonRendered(false);
    setNetworkStatus('checking');
    
    // Force reload the component
    window.location.reload();
  };

  const getNetworkStatusColor = () => {
    switch (networkStatus) {
      case 'connected': return 'text-green-600';
      case 'partial': return 'text-yellow-600';
      case 'disconnected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getNetworkStatusText = () => {
    switch (networkStatus) {
      case 'connected': return '✅ Connected';
      case 'partial': return '⚠️ Partial Connection';
      case 'disconnected': return '❌ No Connection';
      default: return '⏳ Checking...';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Configuration Check */}
      {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Google Client ID not configured. Please add VITE_GOOGLE_CLIENT_ID to your .env file.
          </p>
        </div>
      )}
      
      {/* Network Status */}
      <div className="p-2 bg-gray-50 border border-gray-200 rounded text-xs">
        <p className={getNetworkStatusColor()}>
          Network: {getNetworkStatusText()}
        </p>
      </div>
      
      {/* Script Error Display */}
      {scriptError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 mb-2">
            ❌ {scriptError}
          </p>
          <div className="space-y-2">
            <p className="text-xs text-red-700">
              Troubleshooting tips:
            </p>
            <ul className="text-xs text-red-700 list-disc list-inside space-y-1">
              <li>Check your internet connection</li>
              <li>Try refreshing the page</li>
              <li>Disable ad blockers or VPN</li>
              <li>Check if Google services are accessible</li>
              <li>Try a different browser</li>
              <li>Clear browser cache and cookies</li>
            </ul>
            <Button 
              onClick={retryScriptLoad}
              size="sm"
              variant="outline"
              className="text-xs mt-2"
            >
              Retry Loading
            </Button>
          </div>
        </div>
      )}
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Logging in...</span>
          </div>
        </div>
      )}
      
      {/* Google Sign-In Button */}
      <div 
        id="google-signin-button" 
        className="w-full flex justify-center items-center min-h-[40px] sm:min-h-[48px]"
        style={{ 
          minHeight: '40px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {!scriptLoaded && !scriptError && (
          <div className="text-sm text-gray-500">Loading Google Sign-In...</div>
        )}
        {scriptError && (
          <div className="text-sm text-red-500">Google Sign-In unavailable</div>
        )}
      </div>
    </div>
  );
};

export default GoogleAuth; 