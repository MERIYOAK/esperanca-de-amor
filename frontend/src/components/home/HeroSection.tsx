import { ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-hero overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left animate-slideInLeft">
            <div className="flex items-center justify-center lg:justify-start mb-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="ml-2 text-background/90">Trusted by 1000+ customers</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-background mb-6 leading-tight">
              Your Local
              <span className="block text-primary-light">Food & Beverage</span>
              Store in Luanda
            </h1>
            
            <p className="text-xl text-background/90 mb-8 max-w-lg">
              Discover fresh foodstuffs, quality drinks, and imported products delivered right to your doorstep.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="bg-background text-foreground hover:bg-background/90 hover:scale-105 transition-all duration-200 group">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
              <Button variant="outline" size="lg" className="border-background text-background hover:bg-background hover:text-foreground hover:scale-105 transition-all duration-200">
                View Weekly Offers
              </Button>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative animate-slideInRight">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-background/20 to-transparent rounded-3xl"></div>
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=600&fit=crop"
                alt="Fresh groceries and products"
                className="w-full h-[500px] object-cover rounded-3xl shadow-2xl"
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
    </section>
  );
};

export default HeroSection;