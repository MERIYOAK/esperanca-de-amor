import { useState, useEffect } from 'react';
import { Trash2, Minus, Plus, ShoppingCart, ArrowLeft, MessageCircle, Package, LogIn, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, isLoading, removeFromCart, updateQuantity, clearCart } = useCart();
  const { toast } = useToast();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  // Authentication check
  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-4 md:py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6 md:mb-8">
              <ShoppingCart className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-3 md:mb-4" />
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 md:mb-4">Your Cart</h1>
              <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">
                Please log in to view and manage your shopping cart
              </p>
            </div>
            
            <Card className="p-4 md:p-6">
              <CardContent className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-center space-x-2 text-muted-foreground mb-3 md:mb-4">
                  <LogIn className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-sm md:text-base">Authentication Required</span>
                </div>
                
                <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">
                  You need to be logged in to access your cart, add items, and proceed with checkout.
                </p>
                
                <div className="space-y-2 md:space-y-3">
                  <Button 
                    onClick={() => navigate('/login')}
                    className="w-full"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Log In to Continue
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="w-full"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Continue Shopping
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

  const calculateItemTotal = (item: any) => {
    const price = item.product.isOnSale && item.product.discount 
      ? item.product.price - (item.product.price * item.product.discount / 100)
      : item.product.price;
    return price * item.quantity;
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const calculateDiscount = () => {
    return cartItems.reduce((total, item) => {
      if (item.product.originalPrice && item.product.isOnSale) {
        const originalTotal = item.product.originalPrice * item.quantity;
        const saleTotal = calculateItemTotal(item);
        return total + (originalTotal - saleTotal);
      }
      return total;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price / 100);
  };

  const handleWhatsAppCheckout = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty cart",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    setIsCheckoutLoading(true);

    try {
      // Clear cart immediately when checkout button is clicked
      await clearCart();
      
      // Call backend checkout endpoint to create order
      const response = await fetch('http://localhost:5000/api/cart/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shippingAddress: user.address || {
            street: 'Address not provided',
            city: 'City not provided',
            state: 'State not provided',
            zipCode: '00000',
            phone: user.phone || 'No phone'
          },
          paymentMethod: 'cash_on_delivery',
          notes: 'Order placed via WhatsApp checkout'
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Open WhatsApp with the generated message
        window.open(data.data.whatsappLink, '_blank');
        
        toast({
          title: "Order created successfully!",
          description: "Your order has been created and sent to WhatsApp. We'll contact you soon!",
        });

        // Navigate back to shop
        setTimeout(() => {
          navigate('/shop');
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error('Server error details:', errorData);
        throw new Error(errorData.message || 'Failed to create order');
      }

    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: error instanceof Error ? error.message : "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const continueShopping = () => {
    navigate('/shop');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-4 md:py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6 md:mb-8">
              <div className="h-16 w-16 md:h-24 md:w-24 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3 md:mb-4"></div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Loading Cart</h1>
              <p className="text-muted-foreground text-base md:text-lg">
                Please wait while we load your cart...
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-4 md:py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6 md:mb-8">
              <ShoppingCart className="h-16 w-16 md:h-24 md:w-24 text-muted-foreground mx-auto mb-3 md:mb-4" />
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Your Cart is Empty</h1>
              <p className="text-muted-foreground text-base md:text-lg">
                Looks like you haven't added any items to your cart yet.
              </p>
            </div>
            <Button onClick={continueShopping} className="text-sm md:text-lg px-6 md:px-8 py-2 md:py-3">
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              Continue Shopping
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 space-y-3 sm:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Shopping Cart</h1>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">
                {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
              </p>
            </div>
            <Button variant="outline" onClick={continueShopping} size="sm" className="text-sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3 md:space-y-4">
              {cartItems.map((item) => (
                <Card key={item._id} className="overflow-hidden">
                  <CardContent className="p-3 md:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.product.images[0]?.url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop'}
                          alt={item.product.name}
                          className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground text-sm md:text-lg line-clamp-2">
                              {item.product.name}
                            </h3>
                            <p className="text-muted-foreground text-xs md:text-sm">
                              {item.product.category}
                            </p>
                            {item.product.isOnSale && (
                              <Badge variant="destructive" className="mt-1 text-xs">
                                {item.product.discount}% OFF
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item._id)}
                            className="text-muted-foreground hover:text-destructive ml-2"
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 md:mt-4 space-y-2 sm:space-y-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-base md:text-lg font-semibold text-red-600">
                              {formatPrice(calculateItemTotal(item))}
                            </span>
                            {item.product.originalPrice && item.product.isOnSale && (
                              <span className="text-xs md:text-sm text-muted-foreground line-through">
                                {formatPrice(item.product.originalPrice * item.quantity)}
                              </span>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isLoading}
                              className="h-8 w-8 md:h-10 md:w-10"
                            >
                              <Minus className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                            <span className="w-8 md:w-12 text-center font-medium text-sm md:text-base">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              disabled={isLoading}
                              className="h-8 w-8 md:h-10 md:w-10"
                            >
                              <Plus className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader className="pb-3 md:pb-6">
                  <CardTitle className="flex items-center text-base md:text-lg">
                    <Package className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span>Subtotal ({cartItems.length} items)</span>
                      <span>{formatPrice(calculateSubtotal())}</span>
                    </div>
                    {calculateDiscount() > 0 && (
                      <div className="flex justify-between text-xs md:text-sm text-green-600">
                        <span>Discount</span>
                        <span>-{formatPrice(calculateDiscount())}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex items-center justify-between text-lg md:text-xl font-bold">
                      <span>Total:</span>
                      <span className="text-red-600">{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    onClick={handleWhatsAppCheckout}
                    disabled={isCheckoutLoading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 md:py-3 px-6 md:px-8 text-sm md:text-lg transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    {isCheckoutLoading ? (
                      <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin mr-2" />
                    ) : (
                      <MessageCircle className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    )}
                    Checkout via WhatsApp
                  </Button>

                  {!user && (
                    <p className="text-xs md:text-sm text-muted-foreground text-center">
                      Please log in to proceed with checkout
                    </p>
                  )}

                  {/* Additional Info */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Free delivery on orders over $50</p>
                    <p>• Secure checkout via WhatsApp</p>
                    <p>• 24/7 customer support</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart; 