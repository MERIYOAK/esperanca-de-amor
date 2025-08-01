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
  Package
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
  discountPercentage: number;
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
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/offers');
        
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
      case 'flash':
        return <Zap className="h-4 w-4" />;
      case 'gift':
        return <Gift className="h-4 w-4" />;
      case 'trending':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'flash':
        return 'bg-red-100 text-red-800';
      case 'gift':
        return 'bg-purple-100 text-purple-800';
      case 'trending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    const now = new Date();
    const expiry = new Date(validUntil);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  };

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
          offerId: offer._id,
          createOrder: false
        })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the cart to update the cart count and items
        await refreshCart();
        
        const productsCount = data.data.addedProducts?.length || offer.productIds.length;
        // Show success message
        toast({
          title: 'Offer Claimed Successfully! 🎉',
          description: `${productsCount} product${productsCount > 1 ? 's' : ''} from "${offer.title}" added to your cart with ${offer.discountPercentage}% discount!`,
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
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Tag className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Special Offers & Deals
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover amazing deals and exclusive offers on our products. 
            Don't miss out on these limited-time opportunities!
          </p>
        </div>

        {/* Offers Grid */}
        {offers.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Offers</h2>
            <p className="text-gray-600">
              Check back soon for new deals and special offers!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <Card key={offer._id} className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 overflow-hidden animate-scaleIn">
                {/* Offer Image */}
                {offer.image && (
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Discount Badge Overlay */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        {offer.discountPercentage}% OFF
                      </div>
                    </div>
                    
                    {/* Hover Buttons Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                          {offer.discountPercentage}%
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
                        <ShoppingCart className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {offer.productIds.length} Product{offer.productIds.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        {offer.productIds.slice(0, 3).map((product) => (
                          <div key={product._id} className="flex items-center space-x-1 text-xs text-gray-600">
                            <span>•</span>
                            <span className="truncate max-w-20">{product.name}</span>
                          </div>
                        ))}
                        {offer.productIds.length > 3 && (
                          <span className="text-xs text-gray-500">
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

                  {/* Action Button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Target: {offer.targetAudience}</span>
                      <span>Location: {offer.displayLocation}</span>
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