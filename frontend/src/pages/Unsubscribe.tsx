import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle,
  XCircle,
  Mail,
  Home,
  Loader2,
  ArrowRight,
  Heart
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface UnsubscribeResponse {
  success: boolean;
  message: string;
}

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [isResubscribing, setIsResubscribing] = useState(false);
  const [resubscribeStatus, setResubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (!emailParam) {
      setStatus('error');
      setMessage('No email address provided. Please use the unsubscribe link from your newsletter email.');
      return;
    }

    setEmail(emailParam);
    handleUnsubscribe(emailParam);
  }, [searchParams]);

  const handleUnsubscribe = async (emailAddress: string) => {
    try {
      setIsProcessing(true);
      const response = await fetch(`http://localhost:5000/api/newsletter/unsubscribe?email=${encodeURIComponent(emailAddress)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data: UnsubscribeResponse = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'You have been successfully unsubscribed from our newsletter.');
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to unsubscribe. Please try again or contact support.');
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      setStatus('error');
      setMessage('An error occurred while unsubscribing. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleResubscribe = async () => {
    try {
      setIsResubscribing(true);
      setResubscribeStatus('loading');
      
      const response = await fetch('http://localhost:5000/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          source: 'resubscribe'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResubscribeStatus('success');
        setMessage('You have been successfully resubscribed! Please check your email for confirmation.');
      } else {
        setResubscribeStatus('error');
        setMessage(data.message || 'Failed to resubscribe. Please try again.');
      }
    } catch (error) {
      console.error('Error resubscribing:', error);
      setResubscribeStatus('error');
      setMessage('An error occurred while resubscribing. Please try again.');
    } finally {
      setIsResubscribing(false);
    }
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
                <h2 className="text-xl font-semibold text-gray-900">Processing Your Request</h2>
                <p className="text-gray-600">Please wait while we unsubscribe you from our newsletter...</p>
              </div>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isResubscribing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <Card className="p-8">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-red-600" />
                <h2 className="text-xl font-semibold text-gray-900">Resubscribing You</h2>
                <p className="text-gray-600">Please wait while we resubscribe you to our newsletter...</p>
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
                {status === 'success' && resubscribeStatus === 'idle' ? (
                  <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                ) : resubscribeStatus === 'success' ? (
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
                    (status === 'success' && resubscribeStatus === 'idle') || resubscribeStatus === 'success'
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-red-100 text-red-800 border-red-200'
                  }
                >
                  {resubscribeStatus === 'success' ? 'Resubscribed' : status === 'success' ? 'Unsubscribed' : 'Error'}
                </Badge>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {resubscribeStatus === 'success' 
                    ? 'Successfully Resubscribed!' 
                    : status === 'success' 
                    ? 'Successfully Unsubscribed!' 
                    : 'Unsubscribe Failed'
                  }
                </h1>
                <p className="text-gray-600 leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Resubscribe Success Content */}
              {resubscribeStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="text-left">
                      <h3 className="font-semibold text-green-800 mb-1">What happens next?</h3>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Check your email for a confirmation link</li>
                        <li>• Click the confirmation link to activate your subscription</li>
                        <li>• You'll receive our welcome email once confirmed</li>
                        <li>• Start receiving our newsletter updates again</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Unsubscribe Success Content */}
              {status === 'success' && resubscribeStatus === 'idle' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="text-left">
                      <h3 className="font-semibold text-green-800 mb-1">What happens next?</h3>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• You won't receive any more newsletter emails</li>
                        <li>• Your email has been removed from our list</li>
                        <li>• You can always resubscribe anytime</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Content */}
              {status === 'error' && resubscribeStatus === 'idle' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="text-left">
                      <h3 className="font-semibold text-red-800 mb-1">What happened?</h3>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• The email address may not be in our system</li>
                        <li>• The unsubscribe link may have expired</li>
                        <li>• There was a temporary technical issue</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Resubscribe Error Content */}
              {resubscribeStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="text-left">
                      <h3 className="font-semibold text-red-800 mb-1">What happened?</h3>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• There was an issue processing your resubscription</li>
                        <li>• You may already be subscribed</li>
                        <li>• There was a temporary technical issue</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* We'll Miss You Message - Only show when unsubscribed, not when resubscribed */}
              {status === 'success' && resubscribeStatus === 'idle' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Heart className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="text-left">
                      <h3 className="font-semibold text-red-800 mb-1">We'll miss you! 💔</h3>
                      <p className="text-sm text-red-700">
                        We're sorry to see you go. If you change your mind, you can always resubscribe to our newsletter anytime.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Welcome Back Message - Only show when resubscribed */}
              {resubscribeStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Heart className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="text-left">
                      <h3 className="font-semibold text-green-800 mb-1">Welcome back! 🎉</h3>
                      <p className="text-sm text-green-700">
                        We're so glad to have you back! You'll receive our newsletter updates once you confirm your subscription.
                      </p>
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
                
                {status === 'success' && resubscribeStatus === 'idle' && (
                  <Button 
                    variant="outline"
                    onClick={handleResubscribe}
                    className="flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Resubscribe
                  </Button>
                )}

                {resubscribeStatus === 'success' && (
                  <Button 
                    variant="outline"
                    onClick={handleGoHome}
                    className="flex-1 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Continue to Home
                  </Button>
                )}
              </div>

              {/* Additional Info */}
              <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
                <p>
                  {resubscribeStatus === 'success' 
                    ? 'Please check your email and click the confirmation link to complete your resubscription.'
                    : status === 'success' 
                    ? 'You can resubscribe anytime by visiting our website and using the newsletter signup form.'
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

export default Unsubscribe; 