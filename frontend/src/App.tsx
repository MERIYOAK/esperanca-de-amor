import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { useEffect, useRef } from "react";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Offers from "./pages/Offers";
import OfferDetail from "./pages/OfferDetail";
import AnnouncementDetail from "./pages/AnnouncementDetail";
import ConfirmSubscription from "./pages/ConfirmSubscription";
import Unsubscribe from "./pages/Unsubscribe";
import NotFound from "./pages/NotFound";
import "./utils/envTest"; // Import to run environment variable test
import "./utils/googleOAuthTest"; // Import to run Google OAuth test

const queryClient = new QueryClient();

// Scroll restoration hook
const useScrollRestoration = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const scrollPositions = useRef<Map<string, number>>(new Map());
  const isInitialMount = useRef(true);

  useEffect(() => {
    const currentPath = location.pathname + location.search;

    // Save current scroll position before navigation
    if (!isInitialMount.current) {
      scrollPositions.current.set(currentPath, window.scrollY);
    }

    // Handle scroll restoration
    if (navigationType === 'POP') {
      // Back/forward navigation - restore scroll position
      const savedPosition = scrollPositions.current.get(currentPath);
      if (savedPosition !== undefined) {
        // Use requestAnimationFrame for smooth restoration
        requestAnimationFrame(() => {
          window.scrollTo({
            top: savedPosition,
            behavior: 'instant' // Use instant for restoration to avoid animation
          });
        });
      } else {
        // No saved position, scroll to top
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    } else {
      // New navigation - scroll to top
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    isInitialMount.current = false;
  }, [location, navigationType]);

  // Save scroll position on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentPath = location.pathname + location.search;
      scrollPositions.current.set(currentPath, window.scrollY);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [location]);

  // Save scroll position on route change
  useEffect(() => {
    const handleScroll = () => {
      const currentPath = location.pathname + location.search;
      scrollPositions.current.set(currentPath, window.scrollY);
    };

    // Throttle scroll events for performance
    let timeoutId: NodeJS.Timeout;
    const throttledScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      clearTimeout(timeoutId);
    };
  }, [location]);
};

// Scroll restoration component
const ScrollRestoration = () => {
  useScrollRestoration();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollRestoration />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/offers" element={<Offers />} />
                <Route path="/offer/:id" element={<OfferDetail />} />
                <Route path="/announcement/:id" element={<AnnouncementDetail />} />
                <Route path="/confirm-subscription/:token" element={<ConfirmSubscription />} />
                <Route path="/unsubscribe" element={<Unsubscribe />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
