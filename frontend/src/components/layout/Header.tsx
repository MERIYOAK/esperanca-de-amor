import { useState, useEffect, useRef } from 'react';
import { Menu, X, ShoppingCart, User, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import UserMenu from '@/components/ui/UserMenu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [imageError, setImageError] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, isLoading } = useAuth();
  const { cartItems } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Calculate cart count
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset image error when user changes
  useEffect(() => {
    setImageError(false);
  }, [user]);

  // Close user menu when user logs out
  useEffect(() => {
    if (!user) {
      setIsUserMenuOpen(false);
      setImageError(false);
      // Reset image error with a small delay to ensure proper state update
      setTimeout(() => setImageError(false), 100);
    }
  }, [user, imageError, isLoading]);

  // Generate user initials
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsSearching(true);
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setTimeout(() => setIsSearching(false), 500);
    }
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsSearching(true);
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setTimeout(() => setIsSearching(false), 500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchTerm.trim()) {
        setIsSearching(true);
        navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
        setSearchTerm('');
        setTimeout(() => setIsSearching(false), 500);
      }
    }
  };

  const handleCartClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      toast({
        title: "Authentication required",
        description: "Please log in to view your cart",
        variant: "destructive",
      });
      navigate('/login');
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      toast({
        title: "Authentication required",
        description: "Please log in to view your wishlist",
        variant: "destructive",
      });
      navigate('/login');
    }
  };

  // Handle Google OAuth errors globally
  useEffect(() => {
    const handleGoogleOAuthError = (event: any) => {
      if (event.detail && event.detail.error) {
        console.error('Google OAuth Error:', event.detail.error);
        
        let errorMessage = 'Authentication failed. Please try again.';
        
        if (event.detail.error.includes('origin is not allowed')) {
          errorMessage = 'Domain not authorized. Please check Google Cloud Console configuration.';
        } else if (event.detail.error.includes('403')) {
          errorMessage = 'Access denied. Please check your Google OAuth configuration.';
        }
        
        toast({
          title: 'Google OAuth Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    };

    // Listen for Google OAuth errors
    window.addEventListener('google-oauth-error', handleGoogleOAuthError);
    
    return () => {
      window.removeEventListener('google-oauth-error', handleGoogleOAuthError);
    };
  }, [toast]);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              <h1 className="text-2xl font-bold text-red-600 hover:text-red-700 transition-colors duration-200">
                Esperança de Amor
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-foreground hover:text-primary transition-colors duration-200 relative group"
              >
                {item.name}
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center relative">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search products..."
                className="w-64 pr-10"
                value={searchTerm}
                onChange={handleSearchInput}
                onKeyPress={handleKeyPress}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={handleSearchClick}
                disabled={isSearching}
              >
                {isSearching ? (
                  <div className="h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Search className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-secondary hover:scale-105 transition-all duration-200 relative overflow-hidden"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                disabled={isLoading}
                title={user ? `Logged in as ${user.name}` : 'User menu'}
              >
                {isLoading ? (
                  <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                ) : user && user.name && user.avatar && !imageError ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover border border-border transition-transform duration-200 hover:scale-110"
                    onError={() => setImageError(true)}
                  />
                ) : user && user.name ? (
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center border border-border transition-transform duration-200 hover:scale-110">
                    {getUserInitials(user.name)}
                  </div>
                ) : (
                  <User className="h-6 w-6" />
                )}
              </Button>
              <UserMenu 
                isOpen={isUserMenuOpen} 
                onClose={() => setIsUserMenuOpen(false)} 
              />
            </div>

            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative hover:bg-secondary hover:scale-105 transition-all duration-200" onClick={handleCartClick}>
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 animate-fadeInUp">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-foreground hover:text-primary transition-colors duration-200 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-border">
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pr-10"
                    value={searchTerm}
                    onChange={handleSearchInput}
                    onKeyPress={handleKeyPress}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={handleSearchClick}
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <div className="h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Search className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </form>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;