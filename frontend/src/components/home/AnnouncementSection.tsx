import { X, Gift, Truck, Heart, Percent, Clock, ShoppingBag, Star, Tag, Award } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PromoBanner {
  _id: string;
  text: string;
  icon: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
  startDate: string;
  endDate: string;
}

const PromoBanner = () => {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Icon mapping
  const iconMap: { [key: string]: any } = {
    Gift,
    Truck,
    Heart,
    Percent,
    Clock,
    ShoppingBag,
    Star,
    Tag,
    Award
  };

  // Fetch active promo banners from backend
  useEffect(() => {
    const fetchPromoBanners = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/api/public/promo-banners/active');
        
        if (response.ok) {
          const data = await response.json();
          const fetchedBanners = data.data?.banners || [];
          console.log('Fetched banners:', fetchedBanners);
          setBanners(fetchedBanners);
        } else {
          console.error('Failed to fetch promo banners');
          setBanners([]);
        }
      } catch (error) {
        console.error('Error fetching promo banners:', error);
        setBanners([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromoBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) {
      console.log('No banner rotation needed - only', banners.length, 'banner(s)');
      return;
    }

    console.log('Setting up banner rotation with', banners.length, 'banners');
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const newIndex = (prev + 1) % banners.length;
        console.log('Banner index changed from', prev, 'to', newIndex);
        return newIndex;
      });
    }, 4000);

    return () => {
      console.log('Clearing banner rotation interval');
      clearInterval(interval);
    };
  }, [banners.length]);

  // Don't render if loading or no banners
  if (isLoading) {
    console.log('PromoBanner loading...');
    return null;
  }

  if (banners.length === 0) {
    console.log('PromoBanner not rendering: no banners available');
    return null;
  }

  const currentBanner = banners[currentIndex];
  
  // Safety check for currentBanner
  if (!currentBanner) {
    console.error('Current banner is undefined:', { currentIndex, banners });
    return null;
  }

  const Icon = iconMap[currentBanner.icon] || Gift;
  
  // Ensure color is properly formatted
  const bannerColor = currentBanner.color || 'from-red-600 to-red-700';
  
  // Convert Tailwind class names to actual CSS gradients
  const getBannerBackground = (color: string) => {
    switch (color) {
      case 'from-red-600 to-red-700':
        return 'linear-gradient(to right, #dc2626, #b91c1c)';
      case 'from-orange-600 to-orange-700':
        return 'linear-gradient(to right, #ea580c, #c2410c)';
      case 'from-yellow-600 to-yellow-700':
        return 'linear-gradient(to right, #ca8a04, #a16207)';
      case 'from-green-600 to-green-700':
        return 'linear-gradient(to right, #16a34a, #15803d)';
      case 'from-blue-600 to-blue-700':
        return 'linear-gradient(to right, #2563eb, #1d4ed8)';
      case 'from-indigo-600 to-indigo-700':
        return 'linear-gradient(to right, #4f46e5, #4338ca)';
      case 'from-purple-600 to-purple-700':
        return 'linear-gradient(to right, #9333ea, #7c3aed)';
      default:
        return 'linear-gradient(to right, #dc2626, #b91c1c)'; // default red
    }
  };
  
  console.log('Rendering banner:', { 
    text: currentBanner.text, 
    color: bannerColor, 
    icon: currentBanner.icon,
    index: currentIndex,
    totalBanners: banners.length 
  });

  return (
    <div 
      className="promo-banner-container text-white relative overflow-hidden transition-all duration-500 z-40"
      style={{ 
        minHeight: '40px',
        position: 'relative',
        zIndex: 40,
        background: getBannerBackground(bannerColor)
      }}
    >
      {/* Shimmering dimming effect */}
      <div 
        className="promo-banner-shimmer"
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%, transparent 100%)',
          animation: 'shimmer 3s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 1
        }}
      ></div>
      
      {/* Subtle dimming overlay */}
      <div 
        className="promo-banner-dimming"
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'rgba(0,0,0,0.1)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      ></div>
      
      {/* Glowing star effect - reduced intensity */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_5px_rgba(255,255,255,0.4)] animate-glowing-star"></div>
        <div className="absolute top-1/3 left-0 w-2 h-2 bg-white rounded-full shadow-[0_0_8px_4px_rgba(255,255,255,0.3)] animate-glowing-star" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-2/3 left-0 w-2 h-2 bg-white rounded-full shadow-[0_0_12px_6px_rgba(255,255,255,0.3)] animate-glowing-star" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="container mx-auto px-4 py-1 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center flex-1">
            <div className="flex items-center space-x-3">
              <Icon className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-semibold text-center truncate max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl">
                {currentBanner.text}
              </span>
            </div>
          </div>
        </div>
        {banners.length > 1 && (
          <div className="flex justify-center mt-1 space-x-1">
            {banners.map((_, index) => (
              <div
                key={index}
                className={`h-1 w-4 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PromoBanner;