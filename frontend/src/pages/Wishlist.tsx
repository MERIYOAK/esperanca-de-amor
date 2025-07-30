import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowLeft, Package, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WishlistItem {
  id: string;
  product: {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
    rating: number;
    isOnSale?: boolean;
    discount?: number;
    stock: number;
  };
  addedAt: Date;
}

const Wishlist = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { wishlistItems, removeFromWishlist, clearWishlist, isLoading } = useWishlist();
  const { toast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);
  const [isClearingWishlist, setIsClearingWishlist] = useState(false);

  // Authentication check
  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-foreground mb-4">Your Wishlist</h1>
              <p className="text-muted-foreground mb-6">
                Please log in to view and manage your wishlist
              </p>
            </div>
            
            <Card className="p-6">
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center space-x-2 text-muted-foreground mb-4">
                  <LogIn className="h-5 w-5" />
                  <span>Authentication Required</span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-6">
                  You need to be logged in to access your wishlist, save items, and manage your favorites.
                </p>
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => navigate('/login')}
                    className="w-full"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Log In to Continue
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/shop')}
                    className="w-full"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Browse Products
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleRemoveFromWishlist = (itemId: string, productName: string) => {
    // Add confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to remove "${productName}" from your wishlist?`
    );
    
    if (!confirmed) {
      return;
    }

    removeFromWishlist(itemId);
  };

  const handleClearWishlist = async () => {
    // Add confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to clear your entire wishlist? This action cannot be undone.'
    );
    
    if (!confirmed) {
      return;
    }

    setIsClearingWishlist(true);
    try {
      await clearWishlist();
    } catch (error) {
      console.error('Error clearing wishlist:', error);
    } finally {
      setIsClearingWishlist(false);
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items to cart",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    setIsAddingToCart(item.id);
    try {
      await addToCart(item.product.id.toString(), 1);
      toast({
        title: "Added to cart",
        description: `${item.product.name} has been added to your cart`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(null);
    }
  };

  const handleViewProduct = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price / 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-4">
                    <div className="aspect-square bg-muted rounded-lg"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">My Wishlist</h1>
                <p className="text-muted-foreground mt-1">
                  Your saved items will appear here
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate('/shop')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </div>

            {/* Empty State */}
            <div className="text-center py-16">
              <Heart className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Your Wishlist is Empty</h2>
              <p className="text-muted-foreground text-lg mb-8">
                Start adding items to your wishlist by browsing our products
              </p>
              <Button onClick={() => navigate('/shop')} className="text-lg px-8 py-3">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Start Shopping
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Wishlist</h1>
              <p className="text-muted-foreground mt-1">
                {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {wishlistItems.length > 0 && (
                <Button 
                  variant="destructive" 
                  onClick={handleClearWishlist}
                  disabled={isClearingWishlist}
                >
                  {isClearingWishlist ? (
                    <div className="flex items-center">
                      <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                      Clearing...
                    </div>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </>
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/shop')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </div>
          </div>

          {/* Wishlist Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                <div className="relative overflow-hidden">
                  {item.product.isOnSale && (
                    <div className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium animate-pulse-slow">
                      -{item.product.discount}%
                    </div>
                  )}
                  
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4 flex space-x-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-background/90 text-foreground hover:bg-background hover:scale-105 transition-all duration-200"
                        onClick={() => handleViewProduct(item.product.id)}
                      >
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 hover:scale-105 transition-all duration-200"
                        onClick={() => handleAddToCart(item)}
                        disabled={isAddingToCart === item.id}
                      >
                        {isAddingToCart === item.id ? (
                          <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-full">
                      {item.product.category}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFromWishlist(item.id, item.product.name)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-200">
                    {item.product.name}
                  </h3>
                  
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Heart
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(item.product.rating)
                              ? 'fill-red-400 text-red-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-muted-foreground">({item.product.rating})</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-primary">
                        {formatPrice(item.product.price)}
                      </span>
                      {item.product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(item.product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Added {formatDate(item.addedAt)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.product.stock > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary Card */}
          <div className="mt-8">
            <Card className="bg-secondary/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-primary" />
                    <span className="font-medium">Wishlist Summary</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Items</p>
                    <p className="text-2xl font-bold text-primary">{wishlistItems.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist; 