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
  const { login } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Load Google OAuth script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        // Enable debug mode for troubleshooting
        if (import.meta.env.DEV) {
          localStorage.setItem('gsi_debug', 'true');
        }
        
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id',
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'outline',
            size: 'large',
            text: 'signin_with', // Always use signin_with for consistent experience
            shape: 'rectangular',
            width: 300, // Use fixed width instead of percentage
          }
        );
      }
    };

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

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
      <div id="google-signin-button" className="w-full flex justify-center"></div>
    </div>
  );
};

export default GoogleAuth; 