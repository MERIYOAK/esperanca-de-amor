import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Tag, 
  ShoppingCart, 
  Star, 
  TrendingUp,
  Percent,
  Gift,
  Zap,
  Eye,
  Package,
  Users,
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Offer {
  _id: string;
  title: string;
  description: string;
  discount: number;
  discountAmount?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  maxClaims?: number;
  claimedCount: number;
  image?: string;
  productIds: Array<{
    _id: string;
    name: string;
    price: number;
    images: string[];
  }>;
  terms: string;
  category: string;
  targetAudience: string;
  displayLocation: string;
}

const Offers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingOffer, setClaimingOffer] = useState<string | null>(null);
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/offers`);
        
        if (response.ok) {
          const data = await response.json();
          setOffers(data.data?.offers || []);
        } else {
          setError('Failed to fetch offers');
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
        setError('Failed to load offers');
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'foodstuffs':
        return <Tag className="h-4 w-4 text-green-600" />;
      case 'beverages':
        return <Zap className="h-4 w-4 text-blue-600" />;
      case 'electronics':
        return <TrendingUp className="h-4 w-4 text-purple-600" />;
      case 'household':
        return <ShoppingCart className="h-4 w-4 text-orange-600" />;
      default:
        return <Gift className="h-4 w-4 text-red-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'foodstuffs':
        return 'bg-green-100 text-green-800';
      case 'beverages':
        return 'bg-blue-100 text-blue-800';
      case 'electronics':
        return 'bg-purple-100 text-purple-800';
      case 'household':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const isExpiringSoon = (validUntil: string) => {
    const endDate = new Date(validUntil);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  };

  // Convert target audience to user-friendly label
  const getTargetAudienceLabel = (targetAudience: string) => {
    switch (targetAudience) {
      case 'all':
        return 'For Everyone';
      case 'registered':
        return 'Members Only';
      case 'guests':
        return 'New Customers';
      default:
        return 'For Everyone';
    }
  };

  // Convert display location to user-friendly label
  const getDisplayLocationLabel = (displayLocation: string) => {
    switch (displayLocation) {
      case 'top':
        return 'Featured';
      case 'bottom':
        return 'Updates';
      case 'sidebar':
        return 'News';
      case 'modal':
        return 'Important';
      default:
        return 'News';
    }
  };

  // Get appropriate icon for target audience
  const getTargetAudienceIcon = (targetAudience: string) => {
    switch (targetAudience) {
      case 'registered':
        return <Users className="h-3 w-3" />;
      case 'guests':
        return <Users className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Offers</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Special Offers & Promotions</h1>
          <p className="text-gray-600">Discover amazing deals and exclusive offers on our products.</p>
        </div>

        {offers.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Offers Available</h2>
            <p className="text-gray-600">Check back soon for new offers and promotions!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <Card key={offer._id} className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 overflow-hidden animate-scaleIn">
                {/* Offer Image */}
                {offer.image && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 z-20">
                      <Badge className="bg-red-600 text-white">
                        {offer.discount}% OFF
                      </Badge>
                    </div>
                    
                    {/* Hover Buttons Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-white hover:bg-gray-100 text-gray-900 hover:scale-105 transition-all duration-200 text-xs border border-gray-300"
                            onClick={() => handleViewOffer(offer)}
                          >
                            <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white hover:scale-105 transition-all duration-200 text-xs"
                            onClick={() => handleClaimOffer(offer)}
                            disabled={claimingOffer === offer._id || isExpired(offer.validUntil)}
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
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Offer Content */}
                <div className="p-6">
                  {/* Offer Header */}
                  <div className="relative p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(offer.category)}
                        <Badge className={getCategoryColor(offer.category)}>
                          {offer.category || 'Special'}
                        </Badge>
                      </div>
                      {!offer.image && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {offer.discount}%
                          </div>
                          <div className="text-sm text-gray-500">OFF</div>
                        </div>
                      )}
                    </div>

                    {/* Offer Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {offer.title}
                    </h3>

                    {/* Offer Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {offer.description}
                    </p>

                    {/* Products Preview */}
                    {offer.productIds && offer.productIds.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Package className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {offer.productIds.length} product{offer.productIds.length > 1 ? 's' : ''} included
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          {offer.productIds.slice(0, 3).map((product, index) => (
                            <div key={product._id} className="flex items-center space-x-1 text-xs text-gray-500">
                              <span>{product.name}</span>
                              {index < Math.min(3, offer.productIds.length) - 1 && <span>,</span>}
                            </div>
                          ))}
                          {offer.productIds.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{offer.productIds.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Hover Buttons for offers without images */}
                    {!offer.image && (
                      <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-white hover:bg-gray-100 text-gray-900 hover:scale-105 transition-all duration-200 text-xs border border-gray-300"
                              onClick={() => handleViewOffer(offer)}
                            >
                              <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white hover:scale-105 transition-all duration-200 text-xs"
                              onClick={() => handleClaimOffer(offer)}
                              disabled={claimingOffer === offer._id || isExpired(offer.validUntil)}
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
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Offer Details */}
                  <div className="px-6 pb-4">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">Valid Until:</span>
                        </div>
                        <span className={`font-medium ${
                          isExpired(offer.validUntil) 
                            ? 'text-red-600' 
                            : isExpiringSoon(offer.validUntil)
                            ? 'text-orange-600'
                            : 'text-gray-900'
                        }`}>
                          {formatDate(offer.validUntil)}
                        </span>
                      </div>

                      {offer.maxClaims && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Claims:</span>
                          <span className="font-medium text-gray-900">
                            {offer.claimedCount}/{offer.maxClaims}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status Badges */}
                    <div className="flex items-center justify-between mb-4">
                      {isExpired(offer.validUntil) && (
                        <Badge variant="destructive" className="text-xs">
                          Expired
                        </Badge>
                      )}
                      {isExpiringSoon(offer.validUntil) && !isExpired(offer.validUntil) && (
                        <Badge className="bg-orange-100 text-orange-800 text-xs">
                          Expiring Soon
                        </Badge>
                      )}
                      {offer.claimedCount > 0 && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Star className="h-3 w-3" />
                          <span>{offer.claimedCount} claimed</span>
                        </div>
                      )}
                    </div>

                    {/* User-friendly labels instead of technical details */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {/* User-friendly target audience label */}
                        <div className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                          {getTargetAudienceIcon(offer.targetAudience)}
                          <span className="text-xs font-medium">{getTargetAudienceLabel(offer.targetAudience)}</span>
                        </div>
                        
                        {/* User-friendly display location label */}
                        <div className="flex items-center space-x-1 bg-green-50 text-green-700 px-2 py-1 rounded-full">
                          <MapPin className="h-3 w-3" />
                          <span className="text-xs font-medium">{getDisplayLocationLabel(offer.displayLocation)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  {offer.terms && (
                    <div className="px-6 pb-4">
                      <details className="text-xs text-gray-500">
                        <summary className="cursor-pointer hover:text-gray-700">
                          View Terms & Conditions
                        </summary>
                        <p className="mt-2 text-gray-600">{offer.terms}</p>
                      </details>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Offers; 