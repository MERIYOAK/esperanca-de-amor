import { ArrowRight, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';

const CategorySection = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState<number | null>(null);

  // Memoize categories to prevent unnecessary re-renders
  const categories = useMemo(() => [
    {
      id: 1,
      name: 'foodstuffs',
      displayName: 'Foodstuffs',
      description: 'Essential food items and groceries',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&crop=center',
      color: 'from-red-500 to-red-600',
      icon: '🍎'
    },
    {
      id: 2,
      name: 'household-items',
      displayName: 'Household Items',
      description: 'Home essentials and cleaning supplies',
      image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400&h=300&fit=crop&crop=center',
      color: 'from-blue-500 to-blue-600',
      icon: '🏠'
    },
    {
      id: 3,
      name: 'beverages',
      displayName: 'Beverages',
      description: 'Refreshing drinks and beverages',
      image: 'https://images.pexels.com/photos/3028500/pexels-photo-3028500.jpeg?w=400&h=300&fit=crop',
      color: 'from-green-500 to-green-600',
      icon: '🥤'
    },
    {
      id: 4,
      name: 'electronics',
      displayName: 'Electronics',
      description: 'Electronic devices and accessories',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop&crop=center',
      color: 'from-purple-500 to-purple-600',
      icon: '📱'
    },
    {
      id: 5,
      name: 'construction-materials',
      displayName: 'Construction Materials',
      description: 'Building and construction supplies',
      image: 'https://images.pexels.com/photos/259988/pexels-photo-259988.jpeg?w=400&h=300&fit=crop',
      color: 'from-orange-500 to-orange-600',
      icon: '🏗️'
    },
    {
      id: 6,
      name: 'plastics',
      displayName: 'Plastics',
      description: 'Plastic products and containers',
      image: 'https://images.pexels.com/photos/3962260/pexels-photo-3962260.jpeg?w=400&h=300&fit=crop',
      color: 'from-cyan-500 to-cyan-600',
      icon: '🥤'
    },
    {
      id: 7,
      name: 'cosmetics',
      displayName: 'Cosmetics',
      description: 'Beauty and personal care products',
      image: 'https://images.pexels.com/photos/3018845/pexels-photo-3018845.jpeg?w=400&h=300&fit=crop',
      color: 'from-pink-500 to-pink-600',
      icon: '💄'
    },
    {
      id: 8,
      name: 'powder-detergent',
      displayName: 'Powder Detergent',
      description: 'Laundry and cleaning powders',
      image: 'https://images.pexels.com/photos/5078583/pexels-photo-5078583.jpeg?w=400&h=300&fit=crop',
      color: 'from-indigo-500 to-indigo-600',
      icon: '🧼'
    },
    {
      id: 9,
      name: 'liquid-detergent',
      displayName: 'Liquid Detergent',
      description: 'Liquid cleaning and laundry products',
      image: 'https://images.pexels.com/photos/7351645/pexels-photo-7351645.jpeg?w=400&h=300&fit=crop',
      color: 'from-teal-500 to-teal-600',
      icon: '🧴'
    },
    {
      id: 10,
      name: 'juices',
      displayName: 'Juices',
      description: 'Fresh and packaged juices',
      image: 'https://images.pexels.com/photos/5837002/pexels-photo-5837002.jpeg?w=400&h=300&fit=crop',
      color: 'from-emerald-500 to-emerald-600',
      icon: '🧃'
    },
    {
      id: 11,
      name: 'dental-care',
      displayName: 'Dental Care',
      description: 'Oral hygiene and dental products',
      image: 'https://images.pexels.com/photos/4045700/pexels-photo-4045700.jpeg?w=400&h=300&fit=crop',
      color: 'from-amber-500 to-amber-600',
      icon: '🦷'
    },
    {
      id: 12,
      name: 'beef',
      displayName: 'Beef',
      description: 'Fresh and processed beef products',
      image: 'https://images.pexels.com/photos/65175/pexels-photo-65175.jpeg?w=400&h=300&fit=crop',
      color: 'from-gray-500 to-gray-600',
      icon: '🥩'
    }
  ], []);

  // Memoize carousel calculations
  const { slidesPerView, totalSlides } = useMemo(() => {
    const slidesPerView = 4;
    const totalSlides = Math.ceil(categories.length / slidesPerView);
    return { slidesPerView, totalSlides };
  }, [categories.length]);

  // Memoize navigation functions
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Memoize category click handler
  const handleCategoryClick = useCallback((categoryName: string) => {
    navigate(`/shop?category=${categoryName}`);
  }, [navigate]);

  // Memoize hover handlers
  const handleMouseEnter = useCallback((id: number) => {
    setIsHovered(id);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(null);
  }, []);

  // Optimized auto-advance with reduced frequency
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 8000); // Increased from 5000ms to 8000ms

    return () => clearInterval(interval);
  }, [totalSlides]);

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-slate-50 via-white to-slate-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-100 to-red-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-100 to-blue-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-8 md:mb-16 animate-fadeInUp">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold pb-2 md:pb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Shop by Category
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our curated collection of products organized for your convenience
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-105"
          >
            <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-105"
          >
            <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
          </button>

          {/* Categories Grid */}
          <div className="overflow-hidden py-4 md:py-8">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {Array.from({ length: totalSlides }, (_, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 px-2 md:px-4">
                    {categories
                      .slice(slideIndex * slidesPerView, (slideIndex + 1) * slidesPerView)
                      .map((category) => (
                        <div
                          key={category.id}
                          className="relative group/category cursor-pointer"
                          onMouseEnter={() => handleMouseEnter(category.id)}
                          onMouseLeave={handleMouseLeave}
                          onClick={() => handleCategoryClick(category.name)}
                        >
                          {/* Category Card */}
                          <div className="relative h-32 md:h-48 rounded-xl md:rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            {/* Background Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-10`}></div>
                            
                            {/* Image */}
                            <div className="relative h-full">
                              <img
                                src={category.image}
                                alt={category.displayName}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover/category:scale-105"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                            </div>

                            {/* Content Overlay */}
                            <div className="absolute inset-0 p-2 md:p-4 flex flex-col justify-between">
                              {/* Top Section */}
                              <div className="flex items-start justify-between">
                                <div className="text-xl md:text-3xl">{category.icon}</div>
                              </div>

                              {/* Bottom Section */}
                              <div className="space-y-1 md:space-y-2">
                                <h3 className="text-white font-bold text-sm md:text-lg leading-tight">
                                  {category.displayName}
                                </h3>
                                <p className="text-white/90 text-xs leading-relaxed hidden md:block">
                                  {category.description}
                                </p>
                                
                                {/* Animated Arrow */}
                                <div className="flex items-center text-white/80 group-hover/category:text-white transition-colors duration-200">
                                  <span className="text-xs font-medium">Explore</span>
                                  <ArrowRight className="w-2 h-2 md:w-3 md:h-3 ml-1 group-hover/category:translate-x-1 transition-transform duration-200" />
                                </div>
                              </div>
                            </div>

                            {/* Hover Effect Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover/category:opacity-15 transition-opacity duration-300`}></div>
                          </div>

                          {/* Floating Animation - Simplified */}
                          <div 
                            className={`absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-br ${category.color} opacity-0 group-hover/category:opacity-5 transition-opacity duration-300 -z-10 blur-lg`}
                          ></div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-4 md:mt-8 space-x-2">
            {Array.from({ length: totalSlides }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* View All Categories Button */}
        <div className="text-center mt-8 md:mt-12 animate-fadeInUp">
          <button
            onClick={() => navigate('/shop')}
            className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-full hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl text-sm md:text-base"
          >
            <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
            View All Categories
            <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;