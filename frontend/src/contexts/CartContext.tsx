import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    images: Array<{ url: string; alt?: string }>;
    category: string;
    isOnSale?: boolean;
    discount?: number;
  };
  quantity: number;
  addedAt: Date;
}

interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  updatedAt: Date;
}

interface CartContextType {
  cart: Cart | null;
  cartItems: CartItem[];
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, token } = useAuth();
  const { toast } = useToast();

  const API_BASE_URL = 'http://localhost:5000/api';

  // Demo products for testing (since we don't have real products in DB yet)
  const demoProducts = {
    "1": {
      _id: "1",
      name: "Fresh Avocados",
      price: 2500,
      originalPrice: 3000,
      images: [{ url: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300&h=300&fit=crop" }],
      category: "Fresh Fruits",
      isOnSale: true,
      discount: 17
    },
    "2": {
      _id: "2",
      name: "Premium Coffee Beans",
      price: 8500,
      images: [{ url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=300&fit=crop" }],
      category: "Beverages",
      isOnSale: false
    },
    "3": {
      _id: "3",
      name: "Organic Honey",
      price: 4200,
      images: [{ url: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&h=300&fit=crop" }],
      category: "Organic",
      isOnSale: false
    },
    "4": {
      _id: "4",
      name: "Fresh Fish Selection",
      price: 6800,
      originalPrice: 7500,
      images: [{ url: "https://images.unsplash.com/photo-1544943910-4ca6073dd0b4?w=300&h=300&fit=crop" }],
      category: "Seafood",
      isOnSale: true,
      discount: 9
    },
    "5": {
      _id: "5",
      name: "Local Palm Oil",
      price: 3500,
      images: [{ url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=300&fit=crop" }],
      category: "Cooking Oils",
      isOnSale: false
    },
    "6": {
      _id: "6",
      name: "Imported Wine",
      price: 12000,
      originalPrice: 15000,
      images: [{ url: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=300&h=300&fit=crop" }],
      category: "Alcoholic Beverages",
      isOnSale: true,
      discount: 20
    },
    "7": {
      _id: "7",
      name: "Fresh Pineapple",
      price: 1800,
      images: [{ url: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=300&h=300&fit=crop" }],
      category: "Fresh Fruits",
      isOnSale: false
    },
    "8": {
      _id: "8",
      name: "Imported Cheese",
      price: 5500,
      originalPrice: 6200,
      images: [{ url: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=300&fit=crop" }],
      category: "Dairy",
      isOnSale: true,
      discount: 11
    }
  };

  // Demo cart state for testing
  const [demoCart, setDemoCart] = useState<CartItem[]>([]);

  // Fetch cart from backend
  const fetchCart = async () => {
    if (!user || !token) {
      setCart(null);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.data);
      } else if (response.status === 404) {
        // Cart doesn't exist yet, create it
        setCart(null);
      } else {
        throw new Error('Failed to fetch cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      // For demo purposes, we'll use local state if backend fails
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user || !token) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items to cart",
        variant: "destructive",
      });
      return;
    }

    // Check if this is a demo product ID
    const isDemoProduct = demoProducts[productId as keyof typeof demoProducts];
    
    if (isDemoProduct) {
      // Handle demo products locally
      setDemoCart(prev => {
        const existingItem = prev.find(item => item.product._id === productId);
        if (existingItem) {
          return prev.map(item => 
            item.product._id === productId 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          const newItem: CartItem = {
            id: `demo-${Date.now()}`,
            product: isDemoProduct,
            quantity,
            addedAt: new Date()
          };
          return [...prev, newItem];
        }
      });
      
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.data);
        toast({
          title: "Added to cart",
          description: "Item has been added to your cart",
        });
      } else {
        throw new Error('Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId: string) => {
    if (!user || !token) {
      toast({
        title: "Authentication required",
        description: "Please log in to manage cart",
        variant: "destructive",
      });
      return;
    }

    // Handle demo items
    if (itemId.startsWith('demo-')) {
      setDemoCart(prev => prev.filter(item => item.id !== itemId));
      toast({
        title: "Item removed",
        description: "Product has been removed from your cart",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.data);
        toast({
          title: "Item removed",
          description: "Product has been removed from your cart",
        });
      } else {
        throw new Error('Failed to remove item from cart');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user || !token) {
      toast({
        title: "Authentication required",
        description: "Please log in to manage cart",
        variant: "destructive",
      });
      return;
    }

    if (quantity < 1) {
      await removeFromCart(itemId);
      return;
    }

    // Handle demo items
    if (itemId.startsWith('demo-')) {
      setDemoCart(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        )
      );
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.data);
      } else {
        throw new Error('Failed to update cart item');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      toast({
        title: "Error",
        description: "Failed to update item quantity",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!user || !token) {
      toast({
        title: "Authentication required",
        description: "Please log in to manage cart",
        variant: "destructive",
      });
      return;
    }

    // Clear demo cart
    setDemoCart([]);

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setCart(null);
        toast({
          title: "Cart cleared",
          description: "All items have been removed from your cart",
        });
      } else {
        throw new Error('Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh cart
  const refreshCart = async () => {
    await fetchCart();
  };

  // Fetch cart when user changes
  useEffect(() => {
    fetchCart();
  }, [user, token]);

  // Combine real cart items with demo cart items
  const cartItems = [...(cart?.items || []), ...demoCart];

  const value: CartContextType = {
    cart,
    cartItems,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 