import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  ArrowLeft,
  Users,
  MapPin
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Offer {
  _id: string;
  title: string;
  description: string;
  discount: number; // Changed from discountPercentage to match backend
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  maxUses?: number; // Changed from maxClaims to match backend
  usedCount: number; // Changed from claimedCount to match backend
  image?: string;
  productIds: Array<{
    _id: string;
    name: string;
    price: number;
    images: string[];
    isActive?: boolean;
  }>;
  category: string;
  claimedBy?: Array<{
    user: string;
    claimedAt: string;
  }>;
}

const OfferDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const { toast } = useToast();
  
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingOffer, setClaimingOffer] = useState(false);

  useEffect(() => {
    const fetchOffer = async () => {
      if (!id) {
        setError('Offer ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/offers/${id}`);
        
        if (response.ok) {
          const data = await response.json();
          setOffer(data.data?.offer || null);
        } else if (response.status === 404) {
          setError('Offer not found');
        } else {
          setError('Failed to fetch offer');
        }
      } catch (error) {
        console.error('Error fetching offer:', error);
        setError('Failed to load offer');
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [id]);

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'flash':
        return <Zap className="h-5 w-5" />;
      case 'gift':
        return <Gift className="h-5 w-5" />;
      case 'trending':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <Tag className="h-5 w-5" />;
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const handleClaimOffer = async () => {
    if (!offer) return;

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
      setClaimingOffer(true);

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
        toast({
          title: 'Offer Claimed Successfully! 🎉',
          description: `${productsCount} product${productsCount > 1 ? 's' : ''} from "${offer.title}" added to your cart with ${offer.discount}% discount!`,
          variant: 'default',
        });
        
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
      setClaimingOffer(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Offer Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The offer you are looking for does not exist.'}</p>
            <Button onClick={() => navigate('/offers')}>
              Back to Offers
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
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/offers')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Offers</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            {offer.image ? (
              <div className="relative">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-96 object-cover rounded-lg shadow-lg"
                />
                <div className="absolute top-4 right-4">
                  <div className="bg-red-600 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                    {offer.discount}% OFF
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No image available</p>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                {getCategoryIcon(offer.category)}
                <Badge className={getCategoryColor(offer.category)}>
                  {offer.category || 'Special'}
                </Badge>
                {isExpired(offer.validUntil) && (
                  <Badge variant="destructive">Expired</Badge>
                )}
                {isExpiringSoon(offer.validUntil) && !isExpired(offer.validUntil) && (
                  <Badge className="bg-orange-100 text-orange-800">Expiring Soon</Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{offer.title}</h1>
              <p className="text-lg text-gray-600 leading-relaxed">{offer.description}</p>
            </div>

            {/* Discount Info */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-red-600">{offer.discount}% OFF</h3>
                  <p className="text-gray-600">Limited time discount</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Valid Until</div>
                  <div className={`font-semibold ${
                    isExpired(offer.validUntil) 
                      ? 'text-red-600' 
                      : isExpiringSoon(offer.validUntil)
                      ? 'text-orange-600'
                      : 'text-gray-900'
                  }`}>
                    {formatDate(offer.validUntil)}
                  </div>
                </div>
              </div>
            </div>

            {/* Products Section */}
            {offer.productIds && offer.productIds.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Included Products ({offer.productIds.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {offer.productIds.map((product) => {
                    const originalPrice = product.price;
                    const discountedPrice = originalPrice * (1 - offer.discount / 100);
                    
                    return (
                      <Card key={product._id} className="p-4 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start space-x-3">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-lg shadow-sm"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            {(!product.images || product.images.length === 0) && (
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm leading-tight mb-1">
                              {product.name}
                            </h4>
                            
                            {/* Price Display */}
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-lg font-bold text-red-600">
                                {discountedPrice.toFixed(2)} Kz
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                {originalPrice.toFixed(2)} Kz
                              </span>
                              <Badge className="bg-red-100 text-red-800 text-xs">
                                -{offer.discount}%
                              </Badge>
                            </div>
                            
                            {/* Savings Info */}
                            <div className="text-xs text-gray-500">
                              You save {(originalPrice - discountedPrice).toFixed(2)} Kz
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Details */}
            <div className="space-y-4">
              {offer.maxUses && offer.maxUses > 0 && (
                <div className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Claims</div>
                    <div className="font-medium">{offer.usedCount}/{offer.maxUses} claimed</div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="pt-6">
              <Button 
                size="lg"
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transition-all duration-300 group shadow-lg hover:shadow-xl"
                onClick={handleClaimOffer}
                disabled={claimingOffer || isExpired(offer.validUntil)}
              >
                {claimingOffer ? (
                  <>
                    <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    Claiming Offer...
                  </>
                ) : (
                  <>
                    <Package className="h-5 w-5 mr-2" />
                    {isExpired(offer.validUntil) ? 'Offer Expired' : 'Claim This Offer'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OfferDetail; 