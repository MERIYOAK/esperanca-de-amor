import { useState, useEffect } from 'react';
import { ShoppingCart, Star, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch featured products from backend
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/api/products?featured=true');
        
        if (response.ok) {
          const data = await response.json();
          
          // Check if data.data.products exists
          if (!data.data || !data.data.products || !Array.isArray(data.data.products)) {
            console.error('Invalid API response structure:', data);
            // Fallback to demo products if backend fails
            setProducts(demoProducts);
            return;
          }
          
          // Transform backend products to frontend format
          const transformedProducts = data.data.products.map((product: any, index: number) => ({
            id: index + 1, // Keep numeric IDs for compatibility
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.images?.[0]?.url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop',
            category: product.category?.name || 'Unknown Category',
            rating: product.rating || 4.5,
            isOnSale: product.isOnSale,
            discount: product.discount
          }));
          
          setProducts(transformedProducts);
        } else {
          // Fallback to demo products if backend fails
          setProducts(demoProducts);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        // Fallback to demo products
        setProducts(demoProducts);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Demo products as fallback
  const demoProducts = [
    {
      id: 1,
      name: 'Fresh Avocados',
      price: 2500,
      originalPrice: 3000,
      image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300&h=300&fit=crop',
      category: 'Fresh Fruits',
      rating: 4.8,
      isOnSale: true,
      discount: 17
    },
    {
      id: 2,
      name: 'Premium Coffee Beans',
      price: 8500,
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=300&fit=crop',
      category: 'Beverages',
      rating: 4.9,
      isOnSale: false
    },
    {
      id: 3,
      name: 'Organic Honey',
      price: 4200,
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&h=300&fit=crop',
      category: 'Organic',
      rating: 4.7,
      isOnSale: false
    },
    {
      id: 4,
      name: 'Fresh Fish Selection',
      price: 6800,
      originalPrice: 7500,
      image: 'https://images.unsplash.com/photo-1544943910-4ca6073dd0b4?w=300&h=300&fit=crop',
      category: 'Seafood',
      rating: 4.6,
      isOnSale: true,
      discount: 9
    },
    {
      id: 5,
      name: 'Local Palm Oil',
      price: 3500,
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=300&fit=crop',
      category: 'Cooking Oils',
      rating: 4.8,
      isOnSale: false
    },
    {
      id: 6,
      name: 'Imported Wine',
      price: 12000,
      originalPrice: 15000,
      image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=300&h=300&fit=crop',
      category: 'Alcoholic Beverages',
      rating: 4.5,
      isOnSale: true,
      discount: 20
    }
  ];

  const handleViewProduct = (product: any) => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = async (product: any) => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items to cart",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    try {
      await addToCart(product.id.toString(), 1);
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fadeInUp">
          <h2 className="text-4xl font-bold mb-4">Featured Products</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our handpicked selection of the finest products, sourced locally and imported for your satisfaction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-full text-center py-16">
              <p>Loading featured products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <p>No featured products found. Please check back later.</p>
            </div>
          ) : (
            products.map((product, index) => (
              <Card key={product.id} className={`group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 overflow-hidden animate-scaleIn`} style={{ animationDelay: `${index * 100}ms` }}>
                <div className="relative overflow-hidden">
                  {product.isOnSale && (
                    <div className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium animate-pulse-slow">
                      -{product.discount}%
                    </div>
                  )}
                  
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4 flex space-x-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-background/90 text-foreground hover:bg-background hover:scale-105 transition-all duration-200"
                        onClick={() => handleViewProduct(product)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 hover:scale-105 transition-all duration-200"
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="mb-2">
                    <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-200">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-muted-foreground">({product.rating})</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-primary">
                        {product.price.toLocaleString()} Kz
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {product.originalPrice.toLocaleString()} Kz
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="text-center mt-12 animate-fadeInUp">
          <Button 
            size="lg" 
            variant="outline" 
            className="hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all duration-200"
            onClick={() => navigate('/shop')}
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;