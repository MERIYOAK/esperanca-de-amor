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
  id: string; // Changed from number to string to handle MongoDB ObjectIds
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
    const categoryQuery = searchParams.get('category');
    
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
    
    if (categoryQuery) {
      setSelectedCategory(categoryQuery);
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

  // Handle category selection
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    
    // Update URL with category parameter
    const searchParams = new URLSearchParams(location.search);
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    
    // Keep existing search parameter if any
    if (searchTerm.trim()) {
      searchParams.set('search', searchTerm);
    }
    
    const newUrl = searchParams.toString() 
      ? `${location.pathname}?${searchParams.toString()}`
      : location.pathname;
    
    navigate(newUrl, { replace: true });
  };

  // Format category name for display
  const formatCategoryName = (category: string) => {
    if (!category) return 'Unknown Category';
    
    // Convert kebab-case to Title Case
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
          console.error('Failed to fetch products');
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = [
    'All',
    'foodstuffs',
    'household-items', 
    'beverages',
    'electronics',
    'construction-materials',
    'plastics',
    'cosmetics',
    'powder-detergent',
    'liquid-detergent',
    'juices',
    'dental-care',
    'beef'
  ];

  // Format category name for display in dropdown
  const formatCategoryDisplayName = (category: string) => {
    if (category === 'All') return 'All';
    
    // Convert kebab-case to Title Case
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || formatCategoryName(product.category) === formatCategoryDisplayName(selectedCategory);
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
      await addToCart(product.id, 1);
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
      <main className="container mx-auto px-4 py-4 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">Our Products</h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Discover our carefully curated selection of premium products
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-3 md:gap-4 mb-6 md:mb-8">
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
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {formatCategoryDisplayName(category)}
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 space-y-2 sm:space-y-0">
          <div>
            <p className="text-muted-foreground text-sm md:text-base">
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
                className="text-muted-foreground hover:text-foreground p-0 h-auto text-sm"
              >
                Clear search
              </Button>
            )}
          </div>
          <Button onClick={handleViewCart} variant="outline" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-sm">
            <ShoppingCart className="h-4 w-4 mr-2" />
            View Cart
          </Button>
        </div>

        {/* Products Grid */}
        <div className={`grid gap-4 md:gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {filteredProducts.map((product, index) => (
            <Card 
              key={product.id} 
              className={`group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 overflow-hidden animate-scaleIn ${
                viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-full sm:w-48 flex-shrink-0' : ''}`}>
                {product.isOnSale && (
                  <div className="absolute top-2 md:top-3 left-2 md:left-3 z-10 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium animate-pulse-slow">
                    -{product.discount}%
                  </div>
                )}
                
                <img
                  src={product.image}
                  alt={product.name}
                  className={`object-cover group-hover:scale-110 transition-transform duration-500 ${
                    viewMode === 'list' ? 'w-full h-32 sm:h-full' : 'w-full h-32 md:h-48'
                  }`}
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

              <CardContent className={`p-3 md:p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
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
                    <span className="text-lg md:text-xl font-bold text-red-600">
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
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 md:mt-12 flex justify-center animate-fadeInUp">
          <div className="flex items-center space-x-1 md:space-x-2">
            <Button variant="outline" disabled size="sm" className="text-xs md:text-sm">Previous</Button>
            <Button variant="default" size="sm" className="text-xs md:text-sm">1</Button>
            <Button variant="outline" size="sm" className="text-xs md:text-sm">2</Button>
            <Button variant="outline" size="sm" className="text-xs md:text-sm">3</Button>
            <Button variant="outline" size="sm" className="text-xs md:text-sm">Next</Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Shop;