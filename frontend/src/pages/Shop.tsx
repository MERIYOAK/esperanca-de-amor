import { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Star, ShoppingCart, Eye, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  isOnSale?: boolean;
  discount?: number;
}

const Shop = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Handle URL search parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [location.search]);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Update URL with search parameter
    const searchParams = new URLSearchParams(location.search);
    if (value.trim()) {
      searchParams.set('search', value);
    } else {
      searchParams.delete('search');
    }
    
    const newUrl = value.trim() 
      ? `${location.pathname}?${searchParams.toString()}`
      : location.pathname;
    
    navigate(newUrl, { replace: true });
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    navigate(location.pathname, { replace: true });
  };

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/api/products');
        
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
        console.error('Error fetching products:', error);
        // Fallback to demo products
        setProducts(demoProducts);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Demo products as fallback
  const demoProducts: Product[] = [
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
    },
    {
      id: 7,
      name: 'Fresh Pineapple',
      price: 1800,
      image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=300&h=300&fit=crop',
      category: 'Fresh Fruits',
      rating: 4.7,
      isOnSale: false
    },
    {
      id: 8,
      name: 'Imported Cheese',
      price: 5500,
      originalPrice: 6200,
      image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=300&fit=crop',
      category: 'Dairy',
      rating: 4.6,
      isOnSale: true,
      discount: 11
    }
  ];

  const categories = ['All', 'Fresh Fruits', 'Beverages', 'Organic', 'Seafood', 'Cooking Oils', 'Alcoholic Beverages', 'Dairy'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = async (product: Product) => {
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
      // For demo purposes, we'll use the product id as a string
      // In a real app, this would be the actual product ID from the backend
      await addToCart(product.id.toString(), 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleViewProduct = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  const handleViewCart = () => {
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Our Products</h1>
          <p className="text-muted-foreground text-lg">
            Discover our carefully curated selection of premium products
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 hover:bg-transparent"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center space-x-2 bg-secondary rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-muted-foreground">
              Showing {filteredProducts.length} of {products.length} products
              {searchTerm && (
                <span className="text-primary">
                  {' '}for "{searchTerm}"
                </span>
              )}
            </p>
            {searchTerm && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearSearch}
                className="text-muted-foreground hover:text-foreground p-0 h-auto"
              >
                Clear search
              </Button>
            )}
          </div>
          <Button onClick={handleViewCart} variant="outline">
            <ShoppingCart className="h-4 w-4 mr-2" />
            View Cart
          </Button>
        </div>

        {/* Products Grid */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {filteredProducts.map((product, index) => (
            <Card 
              key={product.id} 
              className={`group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 overflow-hidden animate-scaleIn ${
                viewMode === 'list' ? 'flex' : ''
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                {product.isOnSale && (
                  <div className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium animate-pulse-slow">
                    -{product.discount}%
                  </div>
                )}
                
                <img
                  src={product.image}
                  alt={product.name}
                  className={`object-cover group-hover:scale-110 transition-transform duration-500 ${
                    viewMode === 'list' ? 'w-full h-full' : 'w-full h-48'
                  }`}
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

              <CardContent className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
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
                    <span className="text-xl font-bold text-primary">
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
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-12 flex justify-center animate-fadeInUp">
          <div className="flex items-center space-x-2">
            <Button variant="outline" disabled>Previous</Button>
            <Button variant="default">1</Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">Next</Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Shop;