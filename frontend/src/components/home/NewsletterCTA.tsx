import React from 'react';
import { Button } from '@/components/ui/button';
import { Mail, ArrowDown, Sparkles } from 'lucide-react';

const NewsletterCTA = () => {
  const scrollToNewsletter = () => {
    const newsletterSection = document.querySelector('[data-newsletter-section]');
    if (newsletterSection) {
      newsletterSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="py-12 md:py-16 bg-gradient-to-r from-red-50 to-red-100">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Decorative elements */}
          <div className="flex justify-center mb-4 md:mb-6">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full px-4 md:px-6 py-2 shadow-lg">
              <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm font-medium">Stay Connected</span>
            </div>
          </div>

          {/* Main content */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
              Don't Miss Out on Exclusive Offers!
            </h2>
            <p className="text-sm md:text-lg text-gray-600 mb-4 md:mb-6 max-w-2xl mx-auto">
              Be the first to know about new products, special promotions, and exciting deals. 
              Join our newsletter community and get exclusive access to our best offers.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Mail className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Weekly Updates</h3>
              <p className="text-gray-600 text-xs md:text-sm">
                Get the latest product arrivals and store news delivered to your inbox.
              </p>
            </div>
            
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Exclusive Offers</h3>
              <p className="text-gray-600 text-xs md:text-sm">
                Access to subscriber-only discounts and special promotions.
              </p>
            </div>
            
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <ArrowDown className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Early Access</h3>
              <p className="text-gray-600 text-xs md:text-sm">
                Be the first to know about new products and limited-time deals.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
            <Button 
              onClick={scrollToNewsletter}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-2 md:py-3 px-6 md:px-8 text-sm md:text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] group relative overflow-hidden"
            >
              <Mail className="h-4 w-4 md:h-5 md:w-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
              <span className="relative z-10">Subscribe Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-700/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
            
            <Button 
              onClick={scrollToNewsletter}
              variant="outline"
              className="border-2 border-red-600 text-red-600 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 hover:text-white hover:scale-105 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all duration-300 group relative overflow-hidden font-semibold py-2 md:py-3 px-6 md:px-8 text-sm md:text-lg"
            >
              <ArrowDown className="h-4 w-4 md:h-5 md:w-5 mr-2 group-hover:translate-y-1 transition-transform duration-300" />
              <span className="relative z-10">Learn More</span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-700/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
          </div>

          {/* Additional info */}
          <div className="mt-4 md:mt-6 text-gray-500 text-xs md:text-sm">
            <p>Join thousands of satisfied customers who stay updated with our newsletter.</p>
            <p className="mt-1">No spam, unsubscribe anytime. Your privacy is important to us.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterCTA; 