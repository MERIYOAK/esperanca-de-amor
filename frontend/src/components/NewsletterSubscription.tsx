import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2, Sparkles } from 'lucide-react';

interface NewsletterSubscriptionProps {
  variant?: 'homepage' | 'footer';
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
}

const NewsletterSubscription: React.FC<NewsletterSubscriptionProps> = ({
  variant = 'homepage',
  title = 'Stay Updated',
  description = 'Subscribe to our newsletter for the latest updates and exclusive offers.',
  placeholder = 'Enter your email address',
  buttonText = 'Subscribe'
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter your email address',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          name,
          source: variant
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: data.message || 'Please check your email to confirm your subscription.',
          variant: 'default'
        });
        setEmail('');
        setName('');
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to subscribe. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: 'Error',
        description: 'Failed to subscribe. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden" data-newsletter-section>
      <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-800">
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Fading border effect at bottom - fades to footer background */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-foreground via-foreground/80 to-transparent"></div>

      <div className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-white/90 text-sm font-medium">Exclusive Updates</span>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {title}
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="text"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/15 focus:border-white/40 transition-all duration-200 backdrop-blur-sm"
                />
                <Input
                  type="email"
                  placeholder={placeholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/15 focus:border-white/40 transition-all duration-200 backdrop-blur-sm"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-white text-red-600 hover:bg-white/90 font-semibold py-3 px-8 text-lg transition-all duration-200 hover:scale-105 shadow-lg"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Mail className="h-5 w-5 mr-2" />
                )}
                {buttonText}
              </Button>
            </form>
          </div>

          <div className="mt-8 text-white/70 text-sm">
            <p>We'll send you updates about new products, promotions, and store news.</p>
            <p className="mt-2">No spam, unsubscribe anytime.</p>
          </div>

          <div className="mt-12 flex justify-center items-center space-x-8 text-white/60 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span>Instant Updates</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Exclusive Offers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSubscription; 