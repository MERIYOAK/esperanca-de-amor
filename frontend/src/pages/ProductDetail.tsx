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
  id: string; // Changed from number to string to handle MongoDB ObjectIds
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

  // Format category name for display
  const formatCategoryName = (category: string) => {
    if (!category) return 'Unknown Category';
    
    // Convert kebab-case to Title Case
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    if (id) {
      // Try to fetch from backend first
      const fetchProduct = async () => {
        try {
          // Use the ID directly for fetching
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/${id}`);
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
              navigate('/shop');
              toast({
                title: "Product not found",
                description: "The product you're looking for doesn't exist",
                variant: "destructive",
              });
              setIsLoading(false);
              return;
            }
            
            // Transform backend product to frontend format
            const transformedProduct: Product = {
              id: product._id, // Use the actual MongoDB ObjectId
              name: product.name,
              price: product.price,
              originalPrice: product.originalPrice,
              images: Array.isArray(product.images) 
                ? product.images.map((img: any) => img.url || img)
                : product.images?.[0]?.url 
                  ? [product.images[0].url] 
                  : ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop'],
              category: formatCategoryName(product.category),
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
            navigate('/shop');
            toast({
              title: "Product not found",
              description: "The product you're looking for doesn't exist",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Error fetching product:', error);
          navigate('/shop');
          toast({
            title: "Product not found",
            description: "The product you're looking for doesn't exist",
            variant: "destructive",
          });
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
      await addToCart(product.id, quantity);
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
      const wishlistItem = wishlistItems.find(item => item.product.id === product!.id);
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
        <main className="container mx-auto px-4 py-4 md:py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                <div className="space-y-3 md:space-y-4">
                  <div className="aspect-square bg-muted rounded-lg"></div>
                  <div className="flex space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-16 h-16 md:w-20 md:h-20 bg-muted rounded-lg"></div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3 md:space-y-4">
                  <div className="h-6 md:h-8 bg-muted rounded w-3/4"></div>
                  <div className="h-4 md:h-6 bg-muted rounded w-1/2"></div>
                  <div className="h-3 md:h-4 bg-muted rounded w-full"></div>
                  <div className="h-3 md:h-4 bg-muted rounded w-2/3"></div>
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
      <main className="container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6 md:mb-8">
            <ol className="flex items-center space-x-2 text-xs md:text-sm text-muted-foreground">
              <li>
                <button onClick={() => navigate('/shop')} className="hover:text-foreground">
                  Shop
                </button>
              </li>
              <li>/</li>
              <li>
                <button onClick={() => navigate('/shop')} className="hover:text-foreground">
                  {formatCategoryName(product.category)}
                </button>
              </li>
              <li>/</li>
              <li className="text-foreground truncate">{product.name}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
            {/* Product Images */}
            <div className="space-y-3 md:space-y-4">
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
                      className={`w-16 h-16 md:w-20 md:h-20 overflow-hidden rounded-lg border-2 transition-colors ${
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
            <div className="space-y-4 md:space-y-6">
              {/* Header */}
              <div>
                <div className="flex flex-wrap items-center space-x-2 mb-2">
                  <Badge variant="secondary" className="text-xs">{formatCategoryName(product.category)}</Badge>
                  {product.isOnSale && (
                    <Badge variant="destructive" className="text-xs">-{product.discount}% OFF</Badge>
                  )}
                </div>
                <h1 className="text-xl md:text-3xl font-bold text-foreground mb-2">{product.name}</h1>
                <p className="text-muted-foreground text-sm md:text-base">{product.shortDescription}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2">
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
                <span className="text-xs md:text-sm text-muted-foreground">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-2 md:space-x-4">
                <span className="text-2xl md:text-3xl font-bold text-primary">
                  {formatPrice(product.isOnSale && product.discount 
                    ? calculateSalePrice(product.price, product.discount)
                    : product.price
                  )}
                </span>
                {product.originalPrice && product.isOnSale && (
                  <span className="text-lg md:text-xl text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
                  product.stock > 0 ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-xs md:text-sm text-muted-foreground">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="space-y-3 md:space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <label className="text-xs md:text-sm font-medium">Quantity:</label>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-2 md:px-3 py-2 hover:bg-muted text-sm"
                      disabled={product.stock === 0}
                    >
                      -
                    </button>
                    <span className="px-3 md:px-4 py-2 min-w-[2rem] md:min-w-[3rem] text-center text-sm md:text-base">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-2 md:px-3 py-2 hover:bg-muted text-sm"
                      disabled={product.stock === 0}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
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
                              <div className="h-3 w-3 md:h-4 md:w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                              <span className="text-sm md:text-base">Adding...</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                              <span className="text-sm md:text-base">Add to Cart</span>
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
                          <Heart className={`h-3 w-3 md:h-4 md:w-4 ${isInWishlist(product!.id) ? "fill-current" : ""}`} />
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
                            <div className="h-3 w-3 md:h-4 md:w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Share2 className="h-3 w-3 md:h-4 md:w-4" />
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
              <div className="grid grid-cols-2 gap-3 md:gap-4 pt-4 md:pt-6 border-t">
                <div className="flex items-center space-x-2">
                  <Truck className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                  <span className="text-xs md:text-sm">Free shipping</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                  <span className="text-xs md:text-sm">Secure payment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RotateCcw className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                  <span className="text-xs md:text-sm">Easy returns</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                  <span className="text-xs md:text-sm">Quality guaranteed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-8 md:mt-12">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="description" className="text-xs md:text-sm">Description</TabsTrigger>
                <TabsTrigger value="specifications" className="text-xs md:text-sm">Specifications</TabsTrigger>
                <TabsTrigger value="reviews" className="text-xs md:text-sm">Reviews</TabsTrigger>
                <TabsTrigger value="shipping" className="text-xs md:text-sm">Shipping</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-4 md:mt-6">
                <Card>
                  <CardContent className="p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Product Description</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{product.description}</p>
                    
                    {product.tags && product.tags.length > 0 && (
                      <div className="mt-4 md:mt-6">
                        <h4 className="font-medium mb-2 text-sm md:text-base">Tags:</h4>
                        <div className="flex flex-wrap gap-2">
                          {product.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="specifications" className="mt-4 md:mt-6">
                <Card>
                  <CardContent className="p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Product Specifications</h3>
                    <div className="space-y-3 md:space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        <div>
                          <span className="font-medium text-sm md:text-base">Category:</span>
                          <p className="text-muted-foreground text-sm md:text-base">{formatCategoryName(product.category)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-sm md:text-base">Stock:</span>
                          <p className="text-muted-foreground text-sm md:text-base">{product.stock} units</p>
                        </div>
                        {product.weight && (
                          <div>
                            <span className="font-medium text-sm md:text-base">Weight:</span>
                            <p className="text-muted-foreground text-sm md:text-base">{product.weight} kg</p>
                          </div>
                        )}
                        {product.dimensions && (
                          <div>
                            <span className="font-medium text-sm md:text-base">Dimensions:</span>
                            <p className="text-muted-foreground text-sm md:text-base">
                              {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-4 md:mt-6">
                <Card>
                  <CardContent className="p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Customer Reviews</h3>
                    <div className="text-center py-6 md:py-8">
                      <p className="text-muted-foreground text-sm md:text-base">Reviews will be available soon!</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="shipping" className="mt-4 md:mt-6">
                <Card>
                  <CardContent className="p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Shipping Information</h3>
                    <div className="space-y-3 md:space-y-4">
                      <div>
                        <h4 className="font-medium mb-2 text-sm md:text-base">Delivery Options:</h4>
                        <ul className="space-y-1 md:space-y-2 text-xs md:text-sm text-muted-foreground">
                          <li>• Free standard shipping on orders over $50</li>
                          <li>• Express delivery available for additional cost</li>
                          <li>• Same-day delivery in select areas</li>
                        </ul>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2 text-sm md:text-base">Return Policy:</h4>
                        <ul className="space-y-1 md:space-y-2 text-xs md:text-sm text-muted-foreground">
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