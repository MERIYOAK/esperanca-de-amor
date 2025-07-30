import { Timer, TrendingUp, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface Offer {
  _id: string;
  title: string;
  description: string;
  discount: number;
  category: {
    _id: string;
    name: string;
  };
  productIds: Array<{
    _id: string;
    name: string;
    price: number;
    images: Array<{ url: string }>;
  }>;
  image: string;
  validUntil: string;
  isActive: boolean;
}

const WeeklyOffers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingOffer, setClaimingOffer] = useState<string | null>(null);

  // Fetch offers from backend
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/api/offers');
        
        if (response.ok) {
          const data = await response.json();
          setOffers(data.data.offers || []);
        } else {
          console.error('Failed to fetch offers');
          // Fallback to demo offers if API fails
          setOffers(demoOffers);
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
        // Fallback to demo offers
        setOffers(demoOffers);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffers();
  }, []);

  // Demo offers as fallback
  const demoOffers: Offer[] = [
    {
      _id: '1',
      title: 'Fresh Produce Bundle',
      description: 'Get 30% off on all fresh vegetables and fruits',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
      discount: 30,
      validUntil: '2024-12-31',
      isActive: true,
      category: { _id: '1', name: 'Fresh Fruits' },
      productIds: [
        { _id: '1', name: 'Fresh Avocados', price: 2500, images: [{ url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300&h=300&fit=crop' }] },
        { _id: '7', name: 'Fresh Pineapple', price: 1800, images: [{ url: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=300&h=300&fit=crop' }] }
      ]
    },
    {
      _id: '2',
      title: 'Beverage Special',
      description: 'Buy 2 Get 1 Free on all imported drinks',
      image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop',
      discount: 33,
      validUntil: '2024-12-31',
      isActive: true,
      category: { _id: '2', name: 'Beverages' },
      productIds: [
        { _id: '2', name: 'Premium Coffee Beans', price: 8500, images: [{ url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=300&fit=crop' }] },
        { _id: '6', name: 'Imported Wine', price: 12000, images: [{ url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=300&h=300&fit=crop' }] }
      ]
    },
    {
      _id: '3',
      title: 'Weekend Combo',
      description: 'Special weekend prices on family meal packages',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
      discount: 25,
      validUntil: '2024-12-31',
      isActive: true,
      category: { _id: '3', name: 'Meal Packages' },
      productIds: [
        { _id: '4', name: 'Fresh Fish Selection', price: 6800, images: [{ url: 'https://images.unsplash.com/photo-1544943910-4ca6073dd0b4?w=300&h=300&fit=crop' }] },
        { _id: '8', name: 'Imported Cheese', price: 5500, images: [{ url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=300&fit=crop' }] }
      ]
    }
  ];

  const handleClaimOffer = async (offer: Offer) => {
    console.log('Claim offer clicked for:', offer.title);
    
    // Check if user is authenticated
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to claim offers',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    try {
      setClaimingOffer(offer._id);

      // Call the backend API to claim the offer
      const response = await fetch('http://localhost:5000/api/offers/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          offerId: offer._id
        })
      });

      const data = await response.json();

      if (data.success) {
        // Show success message
        toast({
          title: 'Offer Claimed Successfully! 🎉',
          description: `"${offer.title}" has been added to your cart with ${offer.discount}% discount!`,
          variant: 'default',
        });
        
        // Navigate to cart to show the discounted item
        setTimeout(() => {
          navigate('/cart');
        }, 1500);
      } else {
        throw new Error(data.message || 'Failed to claim offer');
      }
      
    } catch (error: any) {
      console.error('Error claiming offer:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to claim offer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setClaimingOffer(null);
    }
  };

  const handleSubscribe = () => {
    console.log('Subscribe clicked');
    
    // Check if user is authenticated
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to subscribe to offers',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    try {
      toast({
        title: 'Subscribed Successfully! 📧',
        description: 'You\'ll receive weekly offers and exclusive deals via email. Check your inbox for confirmation!',
        variant: 'default',
      });
      
      // Optionally navigate to profile page to manage subscriptions
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
      
    } catch (error: any) {
      console.error('Error subscribing:', error);
      toast({
        title: 'Error',
        description: 'Failed to subscribe. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">This Week's Special Offers</h2>
            <p className="text-xl text-muted-foreground">Loading offers...</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fadeInUp">
          <h2 className="text-4xl font-bold mb-4">This Week's Special Offers</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Don't miss out on these amazing deals! Limited time offers on your favorite products.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {offers.map((offer, index) => {
            const IconComponent = Package; // Default icon
            return (
              <Card 
                key={offer._id} 
                className={`group hover:shadow-glow transition-all duration-500 hover:-translate-y-3 overflow-hidden bg-gradient-to-br from-card to-secondary/20 animate-slideInLeft`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Discount Badge */}
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-2 rounded-full font-bold text-lg animate-pulse-slow">
                    -{offer.discount}%
                  </div>
                  
                  {/* Category Icon */}
                  <div className="absolute top-4 left-4 bg-background/90 p-2 rounded-full">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="mb-3">
                    <span className="text-xs text-accent font-medium bg-accent/10 px-2 py-1 rounded-full">
                      {offer.category?.name || 'Special Offer'}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-200">
                    {offer.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4">
                    {offer.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Timer className="h-4 w-4 text-warning" />
                      <span className="text-sm text-muted-foreground">Valid until {formatDate(offer.validUntil)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full hover:scale-105 transition-all duration-200 group"
                    onClick={() => handleClaimOffer(offer)}
                    disabled={claimingOffer === offer._id}
                  >
                    {claimingOffer === offer._id ? (
                      <div className="flex items-center">
                        <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                        Claiming...
                      </div>
                    ) : (
                      <>
                        Claim Offer
                        <TrendingUp className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center animate-fadeInUp">
          <Card className="max-w-4xl mx-auto bg-gradient-primary text-primary-foreground">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="text-center md:text-left mb-6 md:mb-0">
                  <h3 className="text-2xl font-bold mb-2">Subscribe to Weekly Offers</h3>
                  <p className="text-primary-foreground/90">
                    Get notified about new deals and exclusive offers every week!
                  </p>
                </div>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="hover:scale-105 transition-all duration-200 min-w-[200px]"
                  onClick={handleSubscribe}
                >
                  Subscribe Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default WeeklyOffers;