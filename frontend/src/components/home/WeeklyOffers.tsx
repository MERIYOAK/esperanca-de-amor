import { Timer, TrendingUp, Package, Eye, Check } from 'lucide-react';
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
  category: string;
  productIds: Array<{
    _id: string;
    name: string;
    price: number;
    images: Array<{ url: string }>;
  }>;
  image: string;
  validUntil: string;
  isActive: boolean;
  originalPrice?: number;
  claimedBy?: Array<{ user: string; claimedAt: string }>;
}

const WeeklyOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingOffer, setClaimingOffer] = useState<string | null>(null);
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if current user has claimed this offer
  const hasUserClaimed = (offer: Offer) => {
    if (!user || !offer.claimedBy) return false;
    return offer.claimedBy.some((claim: any) => claim.user === user.id);
  };

  // Format category name for display
  const formatCategoryName = (category: string) => {
    if (!category) return 'Special Offer';
    
    // Convert kebab-case to Title Case
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Fetch offers from backend
  useEffect(() => {
    console.log('WeeklyOffers: Component mounted, fetching offers...');
    let isMounted = true;
    let abortController = new AbortController();
    let retryCount = 0;
    const maxRetries = 3;

    const fetchOffers = async () => {
      try {
        setIsLoading(true);
        console.log('WeeklyOffers: Fetching offers from API...');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/offers`, {
          signal: abortController.signal,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!isMounted) return;
        
        console.log('WeeklyOffers: Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('WeeklyOffers: API response data:', data);
          console.log('WeeklyOffers: Offers array:', data.data?.offers);
          setOffers(data.data.offers || []);
        } else if (response.status === 429) {
          console.warn('Rate limited - too many requests');
          if (retryCount < maxRetries) {
            retryCount++;
            const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
            console.log(`Retrying in ${retryDelay}ms (attempt ${retryCount}/${maxRetries})`);
            setTimeout(() => {
              if (isMounted) {
                fetchOffers();
              }
            }, retryDelay);
            return;
          }
          // Show fallback offers when rate limited
          setOffers([
            {
              _id: 'fallback-1',
              title: 'Special Discount',
              description: 'Limited time offer on selected products',
              discount: 15,
              category: 'Special Offer',
              productIds: [],
              image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop',
              validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              isActive: true,
              originalPrice: 6000
            },
            {
              _id: 'fallback-2',
              title: 'Flash Sale',
              description: 'Quick deals on popular items',
              discount: 20,
              category: 'Flash Sale',
              productIds: [],
              image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop',
              validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              isActive: true,
              originalPrice: 4000
            }
          ]);
        } else {
          console.error('Failed to fetch offers:', response.status);
          setOffers([]);
        }
      } catch (error: any) {
        if (!isMounted) return;
        
        if (error.name === 'AbortError') {
          console.log('Request aborted');
          return;
        }
        
        console.error('Error fetching offers:', error);
        setOffers([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchOffers();

    return () => {
      console.log('WeeklyOffers: Component unmounting, cleaning up...');
      isMounted = false;
      abortController.abort();
    };
  }, []); // Empty dependency array - only run once on mount

  const handleClaimOffer = async (offer: Offer) => {
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

      // Debug: Log the offer data being sent
      console.log('Claiming offer:', {
        offerId: offer._id,
        offerTitle: offer.title,
        user: user.id,
        token: localStorage.getItem('token') ? 'exists' : 'missing'
      });

      // Call the backend API to claim the offer
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/offers/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          offerId: offer._id,
          createOrder: false
        })
      });

      const data = await response.json();

      // Debug: Log the response
      console.log('Claim offer response:', {
        status: response.status,
        success: data.success,
        message: data.message,
        data: data.data
      });

      if (response.ok && data.success) {
        // Wait a moment for the backend to process the cart update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Immediately refresh the cart to update the cart count and items
        await refreshCart();
        
        const productsCount = data.data.addedProducts?.length || offer.productIds.length;
        // Show success message
        toast({
          title: 'Offer Claimed Successfully! 🎉',
          description: `${productsCount} product${productsCount > 1 ? 's' : ''} from "${offer.title}" added to your cart with ${offer.discount}% discount!`,
          variant: 'default',
        });
        
        // Navigate to cart to show the discounted item
        setTimeout(() => {
          navigate('/cart');
        }, 1500);
      } else if (response.status === 400 && data.message?.includes('already claimed')) {
        // Handle case where user has already claimed this offer
        toast({
          title: 'Already Claimed',
          description: 'You have already claimed this offer. Check your cart for the discounted items!',
          variant: 'default',
        });
        
        // Navigate to cart to show the already claimed items
        setTimeout(() => {
          navigate('/cart');
        }, 1500);
      } else {
        // Debug: Log the error details
        console.error('Claim offer failed:', {
          status: response.status,
          message: data.message,
          data: data
        });
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

  const handleViewOffer = (offer: Offer) => {
    navigate(`/offer/${offer._id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return '0';
    return price.toLocaleString();
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
    <section className="py-12 md:py-20 bg-gradient-to-r from-red-50 to-red-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-16 animate-fadeInUp">
          <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 text-gray-900">Weekly Offers</h2>
          <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto">
            Don't miss out on our weekly deals and special promotions. Limited time offers that you won't want to miss!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {isLoading ? (
            <div className="col-span-full text-center py-8 md:py-16">
              <p>Loading offers...</p>
            </div>
          ) : offers.length === 0 ? (
            <div className="col-span-full text-center py-8 md:py-16">
              <p>No offers available at the moment. Check back soon!</p>
            </div>
          ) : (
            offers.map((offer, index) => (
              <Card key={offer._id} className={`group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 overflow-hidden animate-scaleIn bg-white border-red-200`} style={{ animationDelay: `${index * 100}ms` }}>
                <div className="relative overflow-hidden">
                  {offer.discount > 0 && (
                    <div className="absolute top-2 md:top-3 left-2 md:left-3 z-10 bg-red-600 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold animate-pulse-slow">
                      -{offer.discount}%
                    </div>
                  )}
                  
                  <img
                    src={offer.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop'}
                    alt={offer.title || 'Offer'}
                    className="w-full h-32 md:h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4">
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-white hover:bg-gray-100 text-gray-900 hover:scale-105 transition-all duration-200 text-xs border border-gray-300"
                          onClick={() => handleViewOffer(offer)}
                        >
                          <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          View
                        </Button>
                        {hasUserClaimed(offer) ? (
                          <Button 
                            size="sm" 
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                            disabled
                          >
                            <Check className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                            Claimed
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white hover:scale-105 transition-all duration-200 text-xs"
                            onClick={() => handleClaimOffer(offer)}
                            disabled={claimingOffer === offer._id}
                          >
                            {claimingOffer === offer._id ? (
                              <>
                                <div className="animate-spin h-3 w-3 md:h-4 md:w-4 mr-1 border-2 border-white border-t-transparent rounded-full"></div>
                                Claiming...
                              </>
                            ) : (
                              <>
                                <Package className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                Claim
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="p-3 md:p-6">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-red-700 font-medium bg-red-100 px-2 py-1 rounded-full">
                      {offer.category || 'Special Offer'}
                    </span>
                    {hasUserClaimed(offer) && (
                      <span className="text-xs text-green-700 font-medium bg-green-100 px-2 py-1 rounded-full flex items-center">
                        <Check className="h-3 w-3 mr-1" />
                        Claimed
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-sm md:text-lg font-semibold mb-2 group-hover:text-red-600 transition-colors duration-200 line-clamp-2">
                    {offer.title || 'Special Offer'}
                  </h3>
                  
                  <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 line-clamp-2">
                    {offer.description || 'Limited time offer. Don\'t miss out!'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 md:space-x-2">
                      <span className="text-lg md:text-2xl font-bold text-red-600">
                        {offer.discount}% OFF
                      </span>
                      {offer.originalPrice && (
                        <span className="text-xs md:text-sm text-gray-500 line-through">
                          {formatPrice(offer.originalPrice)} Kz
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="text-center mt-8 md:mt-12 animate-fadeInUp">
          <Button 
            size="lg" 
            variant="outline" 
            className="border-red-600 text-red-600 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 hover:text-white hover:scale-105 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all duration-300 group relative overflow-hidden"
            onClick={() => navigate('/offers')}
          >
            <span className="relative z-10">View All Offers</span>
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-700/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WeeklyOffers;