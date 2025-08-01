import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle,
  XCircle,
  Mail,
  Home,
  Loader2,
  ArrowRight
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface ConfirmationResponse {
  success: boolean;
  message: string;
}

const ConfirmSubscription = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const confirmSubscription = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid confirmation link. Please try subscribing again.');
        return;
      }

      try {
        setIsProcessing(true);
        const response = await fetch(`http://localhost:5000/api/newsletter/confirm/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data: ConfirmationResponse = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage(data.message || 'Your subscription has been confirmed successfully!');
        } else {
          setStatus('error');
          setMessage(data.message || 'Failed to confirm subscription. Please try again.');
        }
      } catch (error) {
        console.error('Error confirming subscription:', error);
        setStatus('error');
        setMessage('An error occurred while confirming your subscription. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    };

    confirmSubscription();
  }, [token]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleResubscribe = () => {
    navigate('/');
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <Card className="p-8">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-red-600" />
                <h2 className="text-xl font-semibold text-gray-900">Confirming Your Subscription</h2>
                <p className="text-gray-600">Please wait while we confirm your newsletter subscription...</p>
              </div>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="p-8">
            <div className="text-center space-y-6">
              {/* Status Icon */}
              <div className="flex justify-center">
                {status === 'success' ? (
                  <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div>
                <Badge 
                  className={
                    status === 'success' 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-red-100 text-red-800 border-red-200'
                  }
                >
                  {status === 'success' ? 'Success' : 'Error'}
                </Badge>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {status === 'success' 
                    ? 'Subscription Confirmed!' 
                    : 'Confirmation Failed'
                  }
                </h1>
                <p className="text-gray-600 leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Success Content */}
              {status === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="text-left">
                      <h3 className="font-semibold text-green-800 mb-1">What's Next?</h3>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• You'll receive our newsletter updates</li>
                        <li>• Get notified about new products and offers</li>
                        <li>• Stay updated with store news and promotions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Content */}
              {status === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="text-left">
                      <h3 className="font-semibold text-red-800 mb-1">What happened?</h3>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• The confirmation link may have expired</li>
                        <li>• You might already be subscribed</li>
                        <li>• There was a temporary issue</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  onClick={handleGoHome}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Home
                </Button>
                
                {status === 'error' && (
                  <Button 
                    variant="outline"
                    onClick={handleResubscribe}
                    className="flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Subscribe Again
                  </Button>
                )}
              </div>

              {/* Additional Info */}
              <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
                <p>
                  {status === 'success' 
                    ? 'You can unsubscribe anytime from our newsletter emails.'
                    : 'If you continue to have issues, please contact our support team.'
                  }
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ConfirmSubscription; 