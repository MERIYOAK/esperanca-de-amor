import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import GoogleAuth from '@/components/auth/GoogleAuth';
import { ArrowLeft } from 'lucide-react';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleGoogleSuccess = (user: any) => {
    // Redirect to shop or profile
    navigate('/shop');
  };

  const handleGoogleError = (error: string) => {
    console.error('Google authentication error:', error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to Esperança de Amor</CardTitle>
          <CardDescription>
            Log in to access your account and start shopping
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <GoogleAuth 
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
          
          <div className="text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/')}
              className="text-muted-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login; 