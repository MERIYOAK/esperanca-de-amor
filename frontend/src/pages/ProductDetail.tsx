import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  description: string;
  shortDescription: string;
  rating: number;
  reviewCount: number;
  stock: number;
  isOnSale?: boolean;
  discount?: number;
  tags: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, wishlistItems, refreshWishlist } = useWishlist();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Demo products data (same as in CartContext)
  const demoProducts: Record<string, Product> = {
    "1": {
      id: 1,
      name: "Fresh Avocados",
      price: 2500,
      originalPrice: 3000,
      images: [
        "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&h=600&fit=crop&crop=left",
        "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&h=600&fit=crop&crop=right"
      ],
      category: "Fresh Fruits",
      description: "Premium fresh avocados sourced from local farms. These avocados are perfectly ripe and ready to eat. Rich in healthy fats and nutrients, perfect for salads, smoothies, or as a healthy snack.",
      shortDescription: "Premium fresh avocados sourced from local farms",
      rating: 4.8,
      reviewCount: 124,
      stock: 50,
      isOnSale: true,
      discount: 17,
      tags: ["Organic", "Fresh", "Local"],
      weight: 0.2,
      dimensions: { length: 8, width: 6, height: 4 }
    },
    "2": {
      id: 2,
      name: "Premium Coffee Beans",
      price: 8500,
      images: [
        "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=600&fit=crop&crop=left",
        "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=600&fit=crop&crop=right"
      ],
      category: "Beverages",
      description: "Premium coffee beans from high-altitude regions. These beans are carefully selected and roasted to perfection, delivering a rich, aromatic coffee experience. Perfect for coffee enthusiasts who appreciate quality.",
      shortDescription: "Premium coffee beans from high-altitude regions",
      rating: 4.9,
      reviewCount: 89,
      stock: 30,
      isOnSale: false,
      tags: ["Premium", "Organic", "Single Origin"],
      weight: 0.5,
      dimensions: { length: 15, width: 10, height: 8 }
    },
    "3": {
      id: 3,
      name: "Organic Honey",
      price: 4200,
      images: [
        "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=600&fit=crop&crop=left",
        "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=600&fit=crop&crop=right"
      ],
      category: "Organic",
      description: "Pure organic honey harvested from local beehives. This natural sweetener is rich in antioxidants and has numerous health benefits. Perfect for tea, baking, or as a natural sweetener.",
      shortDescription: "Pure organic honey harvested from local beehives",
      rating: 4.7,
      reviewCount: 156,
      stock: 75,
      isOnSale: false,
      tags: ["Organic", "Natural", "Local"],
      weight: 0.5,
      dimensions: { length: 12, width: 8, height: 6 }
    },
    "4": {
      id: 4,
      name: "Fresh Fish Selection",
      price: 6800,
      originalPrice: 7500,
      images: [
        "https://images.unsplash.com/photo-1544943910-4ca6073dd0b4?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1544943910-4ca6073dd0b4?w=600&h=600&fit=crop&crop=left",
        "https://images.unsplash.com/photo-1544943910-4ca6073dd0b4?w=600&h=600&fit=crop&crop=right"
      ],
      category: "Seafood",
      description: "Fresh fish selection caught daily from local waters. These fish are sustainably caught and delivered fresh to ensure the best quality and taste. Perfect for healthy meals.",
      shortDescription: "Fresh fish selection caught daily from local waters",
      rating: 4.6,
      reviewCount: 92,
      stock: 25,
      isOnSale: true,
      discount: 9,
      tags: ["Fresh", "Sustainable", "Local"],
      weight: 1.0,
      dimensions: { length: 25, width: 15, height: 8 }
    },
    "5": {
      id: 5,
      name: "Local Palm Oil",
      price: 3500,
      images: [
        "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&h=600&fit=crop&crop=left",
        "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&h=600&fit=crop&crop=right"
      ],
      category: "Cooking Oils",
      description: "Traditional local palm oil produced using traditional methods. This oil is rich in nutrients and perfect for cooking traditional dishes. Supports local farmers and traditional production methods.",
      shortDescription: "Traditional local palm oil produced using traditional methods",
      rating: 4.8,
      reviewCount: 67,
      stock: 40,
      isOnSale: false,
      tags: ["Traditional", "Local", "Natural"],
      weight: 1.0,
      dimensions: { length: 18, width: 12, height: 10 }
    },
    "6": {
      id: 6,
      name: "Imported Wine",
      price: 12000,
      originalPrice: 15000,
      images: [
        "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&h=600&fit=crop&crop=left",
        "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&h=600&fit=crop&crop=right"
      ],
      category: "Alcoholic Beverages",
      description: "Premium imported wine from renowned vineyards. This wine offers a sophisticated taste profile with rich flavors and aromas. Perfect for special occasions and wine enthusiasts.",
      shortDescription: "Premium imported wine from renowned vineyards",
      rating: 4.5,
      reviewCount: 45,
      stock: 15,
      isOnSale: true,
      discount: 20,
      tags: ["Premium", "Imported", "Wine"],
      weight: 0.75,
      dimensions: { length: 30, width: 8, height: 8 }
    },
    "7": {
      id: 7,
      name: "Fresh Pineapple",
      price: 1800,
      images: [
        "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&h=600&fit=crop&crop=left",
        "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&h=600&fit=crop&crop=right"
      ],
      category: "Fresh Fruits",
      description: "Sweet and juicy fresh pineapples grown in tropical regions. These pineapples are perfectly ripe and ready to eat. Rich in vitamin C and perfect for smoothies, desserts, or as a healthy snack.",
      shortDescription: "Sweet and juicy fresh pineapples grown in tropical regions",
      rating: 4.7,
      reviewCount: 203,
      stock: 60,
      isOnSale: false,
      tags: ["Fresh", "Tropical", "Sweet"],
      weight: 1.5,
      dimensions: { length: 20, width: 15, height: 12 }
    },
    "8": {
      id: 8,
      name: "Imported Cheese",
      price: 5500,
      originalPrice: 6200,
      images: [
        "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&h=600&fit=crop&crop=left",
        "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&h=600&fit=crop&crop=right"
      ],
      category: "Dairy",
      description: "Premium imported cheese with rich flavors and creamy texture. This cheese is aged to perfection and offers a sophisticated taste experience. Perfect for cheese boards, cooking, or as a gourmet ingredient.",
      shortDescription: "Premium imported cheese with rich flavors and creamy texture",
      rating: 4.6,
      reviewCount: 78,
      stock: 35,
      isOnSale: true,
      discount: 11,
      tags: ["Premium", "Imported", "Aged"],
      weight: 0.25,
      dimensions: { length: 12, width: 8, height: 4 }
    }
  };

  useEffect(() => {
    if (id) {
      // Try to fetch from backend first
      const fetchProduct = async () => {
        try {
          // Convert demo ID to real MongoDB ObjectId
          const productIdMapping: Record<string, string> = {
            "1": "68894b07c48ce012657b2617", // Fresh Avocados
            "2": "68894b07c48ce012657b261a", // Premium Coffee Beans
            "3": "68894b07c48ce012657b261d", // Organic Honey
            "4": "68894b08c48ce012657b2620", // Fresh Fish Selection
            "5": "68894b08c48ce012657b2623", // Local Palm Oil
            "6": "68894b08c48ce012657b2626", // Imported Wine
            "7": "68894b08c48ce012657b2629", // Fresh Pineapple
            "8": "68894b08c48ce012657b262c"  // Imported Cheese
          };

          const realProductId = productIdMapping[id];
          if (!realProductId) {
            // Fallback to demo products if mapping not found
            const foundProduct = demoProducts[id];
            if (foundProduct) {
              setProduct(foundProduct);
            } else {
              navigate('/shop');
              toast({
                title: "Product not found",
                description: "The product you're looking for doesn't exist",
                variant: "destructive",
              });
            }
            setIsLoading(false);
            return;
          }

          const response = await fetch(`http://localhost:5000/api/products/${realProductId}`);
          if (response.ok) {
            const data = await response.json();
            
            // Handle different possible response structures
            let product = data.data;
            if (data.data && data.data.product) {
              // If the product is wrapped in a product property (backend getProduct)
              product = data.data.product;
            } else if (data.product) {
              // If the product is directly in data.product
              product = data.product;
            }
            
            // Validate that we have a valid product
            if (!product || !product.name) {
              console.error('Invalid product data received:', product);
              console.error('Full response data:', data);
              // Fallback to demo products if backend fails
              const foundProduct = demoProducts[id];
              if (foundProduct) {
                setProduct(foundProduct);
              } else {
                navigate('/shop');
                toast({
                  title: "Product not found",
                  description: "The product you're looking for doesn't exist",
                  variant: "destructive",
                });
              }
              setIsLoading(false);
              return;
            }
            
            // Transform backend product to frontend format
            const transformedProduct: Product = {
              id: parseInt(id), // Keep the numeric ID for compatibility
              name: product.name,
              price: product.price,
              originalPrice: product.originalPrice,
              images: Array.isArray(product.images) 
                ? product.images.map((img: any) => img.url || img)
                : product.images?.[0]?.url 
                  ? [product.images[0].url] 
                  : ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop'],
              category: product.category?.name || 'Unknown Category',
              description: product.description,
              shortDescription: product.shortDescription,
              rating: product.rating,
              reviewCount: product.reviewCount,
              stock: product.stock,
              isOnSale: product.isOnSale,
              discount: product.discount,
              tags: product.tags || []
            };
            
            setProduct(transformedProduct);
          } else {
            // Fallback to demo products if backend fails
            const foundProduct = demoProducts[id];
            if (foundProduct) {
              setProduct(foundProduct);
            } else {
              navigate('/shop');
              toast({
                title: "Product not found",
                description: "The product you're looking for doesn't exist",
                variant: "destructive",
              });
            }
          }
        } catch (error) {
          console.error('Error fetching product:', error);
          // Fallback to demo products
          const foundProduct = demoProducts[id];
          if (foundProduct) {
            setProduct(foundProduct);
          } else {
            navigate('/shop');
            toast({
              title: "Product not found",
              description: "The product you're looking for doesn't exist",
              variant: "destructive",
            });
          }
        } finally {
          setIsLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id, navigate, toast]);

  const handleAddToCart = async () => {
    if (!product) return;

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

    setIsAddingToCart(true);
    try {
      await addToCart(product.id.toString(), quantity);
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
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price / 100);
  };

  const calculateSalePrice = (price: number, discount: number) => {
    return price - (price * discount / 100);
  };

  const handleWishlist = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items to your wishlist",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (isInWishlist(product!.id)) {
      // Find the wishlist item ID
      const wishlistItem = wishlistItems.find(item => 
        item.product.id === product!.id || 
        item.product.id.toString() === product!.id.toString()
      );
      if (wishlistItem) {
        removeFromWishlist(wishlistItem.id);
      } else {
        // If we can't find the item but isInWishlist says it's there, refresh the wishlist
        refreshWishlist();
      }
    } else {
      addToWishlist(product!);
    }
  };

  const handleShare = async () => {
    if (!product) return;

    setIsSharing(true);
    try {
      const shareData = {
        title: product.name,
        text: product.shortDescription,
        url: window.location.href,
      };

      // Try native sharing first (mobile devices)
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully",
          description: "Product has been shared",
        });
      } else {
        // Fallback to copying link to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied",
          description: "Product link has been copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to copying link
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied",
          description: "Product link has been copied to clipboard",
        });
      } catch (clipboardError) {
        toast({
          title: "Share failed",
          description: "Unable to share or copy link",
          variant: "destructive",
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="aspect-square bg-muted rounded-lg"></div>
                  <div className="flex space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-20 h-20 bg-muted rounded-lg"></div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li>
                <button onClick={() => navigate('/shop')} className="hover:text-foreground">
                  Shop
                </button>
              </li>
              <li>/</li>
              <li>
                <button onClick={() => navigate('/shop')} className="hover:text-foreground">
                  {product.category}
                </button>
              </li>
              <li>/</li>
              <li className="text-foreground">{product.name}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg border">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 overflow-hidden rounded-lg border-2 transition-colors ${
                        selectedImage === index
                          ? 'border-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="secondary">{product.category}</Badge>
                  {product.isOnSale && (
                    <Badge variant="destructive">-{product.discount}% OFF</Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
                <p className="text-muted-foreground">{product.shortDescription}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2">
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
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.isOnSale && product.discount 
                    ? calculateSalePrice(product.price, product.discount)
                    : product.price
                  )}
                </span>
                {product.originalPrice && product.isOnSale && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  product.stock > 0 ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-muted-foreground">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium">Quantity:</label>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-muted"
                      disabled={product.stock === 0}
                    >
                      -
                    </button>
                    <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-2 hover:bg-muted"
                      disabled={product.stock === 0}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleAddToCart}
                          disabled={product.stock === 0 || isAddingToCart}
                          className="flex-1"
                          size="lg"
                        >
                          {isAddingToCart ? (
                            <div className="flex items-center">
                              <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                              Adding...
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Add to Cart
                            </div>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add to Cart</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant={isInWishlist(product!.id) ? "default" : "outline"} 
                          size="lg"
                          onClick={handleWishlist}
                          disabled={!user}
                          className={isInWishlist(product!.id) ? "bg-red-500 hover:bg-red-600" : ""}
                        >
                          <Heart className={`h-4 w-4 ${isInWishlist(product!.id) ? "fill-current" : ""}`} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isInWishlist(product!.id) ? "Remove from Wishlist" : "Add to Wishlist"}</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="lg"
                          onClick={handleShare}
                          disabled={isSharing}
                        >
                          {isSharing ? (
                            <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Share2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share Product</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t">
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Free shipping</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Secure payment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RotateCcw className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Easy returns</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Quality guaranteed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-12">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="shipping">Shipping</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Product Description</h3>
                    <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                    
                    {product.tags && product.tags.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-medium mb-2">Tags:</h4>
                        <div className="flex flex-wrap gap-2">
                          {product.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="specifications" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Product Specifications</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium">Category:</span>
                          <p className="text-muted-foreground">{product.category}</p>
                        </div>
                        <div>
                          <span className="font-medium">Stock:</span>
                          <p className="text-muted-foreground">{product.stock} units</p>
                        </div>
                        {product.weight && (
                          <div>
                            <span className="font-medium">Weight:</span>
                            <p className="text-muted-foreground">{product.weight} kg</p>
                          </div>
                        )}
                        {product.dimensions && (
                          <div>
                            <span className="font-medium">Dimensions:</span>
                            <p className="text-muted-foreground">
                              {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Reviews will be available soon!</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="shipping" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Delivery Options:</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• Free standard shipping on orders over $50</li>
                          <li>• Express delivery available for additional cost</li>
                          <li>• Same-day delivery in select areas</li>
                        </ul>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Return Policy:</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• 30-day return policy</li>
                          <li>• Free returns for defective items</li>
                          <li>• Contact customer service for returns</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail; 