import { useState, useEffect } from 'react';
import { Trash2, Minus, Plus, ShoppingCart, ArrowLeft, MessageCircle, Package, LogIn } from 'lucide-react';
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
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-foreground mb-4">Your Cart</h1>
              <p className="text-muted-foreground mb-6">
                Please log in to view and manage your shopping cart
              </p>
            </div>
            
            <Card className="p-6">
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center space-x-2 text-muted-foreground mb-4">
                  <LogIn className="h-5 w-5" />
                  <span>Authentication Required</span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-6">
                  You need to be logged in to access your cart, add items, and proceed with checkout.
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
      // Create order message for WhatsApp
      const orderItems = cartItems.map(item => 
        `• ${item.product.name} x${item.quantity} - ${formatPrice(calculateItemTotal(item))}`
      ).join('\n');

      const totalAmount = formatPrice(calculateTotal());
      const discountAmount = formatPrice(calculateDiscount());

      const message = `🛒 *New Order from ${user.name}*

📋 *Order Items:*
${orderItems}

💰 *Order Summary:*
Subtotal: ${formatPrice(calculateSubtotal())}
${calculateDiscount() > 0 ? `Discount: -${discountAmount}\n` : ''}Total: ${totalAmount}

📞 *Contact Information:*
Name: ${user.name}
Email: ${user.email}
${user.phone ? `Phone: ${user.phone}` : ''}

📍 *Delivery Address:*
${user.address ? `${user.address.street}, ${user.address.city}, ${user.address.state} ${user.address.zipCode}` : 'Address not provided'}

---
*Order placed via Esperança de Amor E-commerce*`;

      // Encode message for WhatsApp
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/244922706107?text=${encodedMessage}`;

      // Open WhatsApp
      window.open(whatsappUrl, '_blank');

      // Clear cart after successful checkout
      await clearCart();
      
      toast({
        title: "Order sent!",
        description: "Your order has been sent to WhatsApp. We'll contact you soon!",
      });

      // Navigate back to shop
      setTimeout(() => {
        navigate('/shop');
      }, 2000);

    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: "There was an error processing your order. Please try again.",
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
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="h-24 w-24 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Loading Cart</h1>
              <p className="text-muted-foreground text-lg">
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
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <ShoppingCart className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-foreground mb-2">Your Cart is Empty</h1>
              <p className="text-muted-foreground text-lg">
                Looks like you haven't added any items to your cart yet.
              </p>
            </div>
            <Button onClick={continueShopping} className="text-lg px-8 py-3">
              <ArrowLeft className="h-5 w-5 mr-2" />
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
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
              <p className="text-muted-foreground mt-1">
                {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
              </p>
            </div>
            <Button variant="outline" onClick={continueShopping}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.product.images[0]?.url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop'}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground text-lg">
                              {item.product.name}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              {item.product.category}
                            </p>
                            {item.product.isOnSale && (
                              <Badge variant="destructive" className="mt-1">
                                {item.product.discount}% OFF
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.id)}
                            className="text-muted-foreground hover:text-destructive"
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-semibold text-foreground">
                              {formatPrice(calculateItemTotal(item))}
                            </span>
                            {item.product.originalPrice && item.product.isOnSale && (
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(item.product.originalPrice * item.quantity)}
                              </span>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isLoading}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={isLoading}
                            >
                              <Plus className="h-4 w-4" />
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
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({cartItems.length} items)</span>
                      <span>{formatPrice(calculateSubtotal())}</span>
                    </div>
                    {calculateDiscount() > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-{formatPrice(calculateDiscount())}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    onClick={handleWhatsAppCheckout}
                    disabled={isCheckoutLoading || !user || isLoading}
                    className="w-full text-lg py-3"
                  >
                    {isCheckoutLoading ? (
                      <div className="flex items-center">
                        <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Checkout via WhatsApp
                      </div>
                    )}
                  </Button>

                  {!user && (
                    <p className="text-sm text-muted-foreground text-center">
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