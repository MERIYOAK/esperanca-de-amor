import { ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [backgroundImageIndex, setBackgroundImageIndex] = useState(5); // Start with last image (index 5)
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState('slide-in-right');
  const navigate = useNavigate();

  // Array of 6 images from Unsplash
  const images = [
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1702685873594-6977fc2552c6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHJldGFpbCUyMGJ1c2luZXNzfGVufDB8fDB8fHww?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1568871391149-449702439177?q=80&w=1216&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1521566652839-697aa473761a?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1534723452862-4c874018d66d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&h=600&fit=crop"
  ];

  // Animation types that cycle through
  const animationTypes = [
    'animate-slide-in-right',
    'animate-zoom-in-rotate', 
    'animate-bounce-in',
    'animate-fade-in-scale',
    'animate-slide-in-right',
    'animate-zoom-in-rotate'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      // Change image after a brief delay to allow for transition
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
        setBackgroundImageIndex((prev) => (prev + 1) % images.length);
        setCurrentAnimation(animationTypes[(currentImageIndex + 1) % animationTypes.length]);
        setIsTransitioning(false);
      }, 300);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [images.length, currentImageIndex, animationTypes]);

  return (
    <section 
      className="relative min-h-[90vh] flex items-center overflow-hidden transition-all duration-1000 pb-6 md:pb-0 pt-6 md:pt-0"
      style={{
        backgroundImage: `url(${images[backgroundImageIndex]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Mobile Layout: Image First, Text Second */}
        <div className="lg:hidden flex flex-col gap-8 items-center">
          {/* Mobile: Image at Top */}
          <div className="relative animate-slideInRight w-full max-w-md">
            <div className="relative">
              <img
                src={images[currentImageIndex]}
                alt="Fresh groceries and products"
                className={`w-full h-80 object-cover rounded-2xl shadow-2xl transition-all duration-1000 ease-in-out ${
                  isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                } ${currentAnimation}`}
                key={currentImageIndex}
              />
              
              {/* Floating Cards */}
              <div className="absolute -top-2 -right-2 bg-background p-3 rounded-xl shadow-lg animate-pulse-slow">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span className="text-sm font-medium">Fresh Daily</span>
                </div>
              </div>
              
              <div className="absolute -bottom-2 -left-2 bg-background p-3 rounded-xl shadow-lg animate-pulse-slow">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-sm font-medium">Best Prices</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: Text Content Below */}
          <div className="text-center animate-slideInLeft relative w-full">
            {/* Decorative background elements */}
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-tr from-yellow-400/30 to-orange-400/30 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            
            {/* Enhanced rating section */}
            <div className="flex items-center justify-center mb-6 relative">
              <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                ))}
                <span className="ml-2 text-background font-medium text-sm">Trusted by 1000+ customers</span>
              </div>
            </div>
            
            {/* Enhanced title with gradient and effects */}
            <div className="relative mb-8">
              <h1 className="text-4xl lg:text-6xl font-bold text-background mb-6 leading-tight relative">
                <span className="block">Your Local</span>
                <span className="block bg-gradient-to-r from-primary-light via-yellow-400 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] pb-2">
                  Food & Beverage
                </span>
                <span className="block">Store in Luanda</span>
              </h1>
              
              {/* Decorative line under title */}
              <div className="w-24 h-1 bg-gradient-to-r from-primary-light to-accent rounded-full mt-4 mx-auto"></div>
            </div>
            
            {/* Enhanced description */}
            <div className="relative mb-8">
              <p className="text-xl text-background/90 mb-8 max-w-lg mx-auto leading-relaxed">
                Discover fresh foodstuffs, quality drinks, and imported products delivered right to your doorstep.
              </p>
              
              {/* Feature highlights */}
              <div className="flex flex-wrap gap-4 mb-8 justify-center">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-background font-medium">Fresh Daily</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <span className="text-sm text-background font-medium">Fast Delivery</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <span className="text-sm text-background font-medium">Best Prices</span>
                </div>
              </div>
            </div>
            
            {/* Enhanced buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
              <button 
                onClick={() => navigate('/shop')}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-11 px-8 bg-gradient-to-r from-red-600 via-red-500 to-red-700 text-white transition-all duration-300 group shadow-lg border border-red-400/30 hover:shadow-[0_0_20px_rgba(220,38,38,0.6)] hover:shadow-red-500/50"
              >
                <span className="relative z-10">Shop Now</span>
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200" />
              </button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/offers')}
                className="border-2 border-background text-background hover:text-foreground hover:scale-105 transition-all duration-300 backdrop-blur-sm bg-white/10 hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:border-white/50 group"
              >
                <span className="relative z-10">View Weekly Offers</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </div>
            
            {/* Floating decorative elements */}
            <div className="absolute top-1/2 -right-8 w-4 h-4 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-1/4 -left-4 w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>

        {/* Desktop Layout: Text Left, Image Right (unchanged) */}
        <div className="hidden lg:grid grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-left animate-slideInLeft relative">
            {/* Decorative background elements */}
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-tr from-yellow-400/30 to-orange-400/30 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            
            {/* Enhanced rating section */}
            <div className="flex items-center justify-start mb-6 relative">
              <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                ))}
                <span className="ml-2 text-background font-medium text-sm">Trusted by 1000+ customers</span>
              </div>
            </div>
            
            {/* Enhanced title with gradient and effects */}
            <div className="relative mb-8">
              <h1 className="text-4xl lg:text-6xl font-bold text-background mb-6 leading-tight relative">
                <span className="block">Your Local</span>
                <span className="block bg-gradient-to-r from-primary-light via-yellow-400 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] pb-2">
                  Food & Beverage
                </span>
                <span className="block">Store in Luanda</span>
              </h1>
              
              {/* Decorative line under title */}
              <div className="w-24 h-1 bg-gradient-to-r from-primary-light to-accent rounded-full mt-4"></div>
            </div>
            
            {/* Enhanced description */}
            <div className="relative mb-8">
              <p className="text-xl text-background/90 mb-8 max-w-lg leading-relaxed">
                Discover fresh foodstuffs, quality drinks, and imported products delivered right to your doorstep.
              </p>
              
              {/* Feature highlights */}
              <div className="flex flex-wrap gap-4 mb-8 justify-start">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-background font-medium">Fresh Daily</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <span className="text-sm text-background font-medium">Fast Delivery</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <span className="text-sm text-background font-medium">Best Prices</span>
                </div>
              </div>
            </div>
            
            {/* Enhanced buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-start relative">
              <button 
                onClick={() => navigate('/shop')}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-11 px-8 bg-gradient-to-r from-red-600 via-red-500 to-red-700 text-white transition-all duration-300 group shadow-lg border border-red-400/30 hover:shadow-[0_0_20px_rgba(220,38,38,0.6)] hover:shadow-red-500/50"
              >
                <span className="relative z-10">Shop Now</span>
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200" />
              </button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/offers')}
                className="border-2 border-background text-background hover:text-foreground hover:scale-105 transition-all duration-300 backdrop-blur-sm bg-white/10 hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:border-white/50 group"
              >
                <span className="relative z-10">View Weekly Offers</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </div>
            
            {/* Floating decorative elements */}
            <div className="absolute top-1/2 -right-8 w-4 h-4 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-1/4 -left-4 w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Right Content - Dynamic Hero Image */}
          <div className="relative animate-slideInRight">
            <div className="relative">
              <img
                src={images[currentImageIndex]}
                alt="Fresh groceries and products"
                className={`w-full h-[500px] object-cover rounded-3xl shadow-2xl transition-all duration-1000 ease-in-out ${
                  isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                } ${currentAnimation}`}
                key={currentImageIndex}
              />
              
              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 bg-background p-4 rounded-2xl shadow-lg animate-pulse-slow">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span className="text-sm font-medium">Fresh Daily</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-background p-4 rounded-2xl shadow-lg animate-pulse-slow">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-sm font-medium">Best Prices</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-background/10 rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-background/10 rounded-full animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-background/10 rounded-full animate-pulse-slow"></div>
      </div>

      {/* Fading border effect at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[50px] bg-gradient-to-t from-background via-background/80 to-transparent"></div>
    </section>
  );
};

export default HeroSection;