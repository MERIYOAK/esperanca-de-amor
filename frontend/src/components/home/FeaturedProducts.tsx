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

  // Format category name for display
  const formatCategoryName = (category: string) => {
    if (!category) return 'Unknown Category';
    
    // Convert kebab-case to Title Case
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Fetch featured products from backend
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products?featured=true`);
        
        if (response.ok) {
          const data = await response.json();
          
          // Check if data.data.products exists
          if (!data.data || !data.data.products || !Array.isArray(data.data.products)) {
            console.error('Invalid API response structure:', data);
            setProducts([]);
            return;
          }
          
          // Transform backend products to frontend format
          const transformedProducts = data.data.products.map((product: any, index: number) => ({
            id: product._id, // Use actual MongoDB ObjectId
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.images?.[0]?.url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop',
            category: formatCategoryName(product.category),
            rating: product.rating || 4.5,
            isOnSale: product.isOnSale,
            discount: product.discount
          }));
          
          setProducts(transformedProducts);
        } else {
          console.error('Failed to fetch featured products');
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

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
      await addToCart(product.id, 1);
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
    <section className="py-12 md:py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-16 animate-fadeInUp">
          <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">Featured Products</h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our handpicked selection of the finest products, sourced locally and imported for your satisfaction.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {isLoading ? (
            <div className="col-span-full text-center py-8 md:py-16">
              <p>Loading featured products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-8 md:py-16">
              <p>No featured products found. Please check back later.</p>
            </div>
          ) : (
            products.map((product, index) => (
              <Card key={product.id} className={`group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 overflow-hidden animate-scaleIn`} style={{ animationDelay: `${index * 100}ms` }}>
                <div className="relative overflow-hidden">
                  {product.isOnSale && (
                    <div className="absolute top-2 md:top-3 left-2 md:left-3 z-10 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium animate-pulse-slow">
                      -{product.discount}%
                    </div>
                  )}
                  
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-32 md:h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4 flex space-x-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-white/90 text-gray-900 hover:bg-white hover:scale-105 transition-all duration-200 text-xs"
                        onClick={() => handleViewProduct(product)}
                      >
                        <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white hover:scale-105 transition-all duration-200 text-xs"
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                <CardContent className="p-3 md:p-6">
                  <div className="mb-2">
                    <span className="text-xs text-red-700 font-medium bg-red-100 px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>
                  
                  <h3 className="text-sm md:text-lg font-semibold mb-2 group-hover:text-red-600 transition-colors duration-200 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center mb-2 md:mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 md:h-4 md:w-4 ${
                            i < Math.floor(product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-1 md:ml-2 text-xs md:text-sm text-gray-500">({product.rating})</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 md:space-x-2">
                      <span className="text-lg md:text-2xl font-bold text-red-600">
                        {product.price.toLocaleString()} Kz
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs md:text-sm text-gray-500 line-through">
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

        <div className="text-center mt-8 md:mt-12 animate-fadeInUp">
          <Button 
            size="lg" 
            variant="outline" 
            className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white hover:scale-105 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all duration-300 group relative overflow-hidden"
            onClick={() => navigate('/shop')}
          >
            <span className="relative z-10">View All Products</span>
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-700/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;