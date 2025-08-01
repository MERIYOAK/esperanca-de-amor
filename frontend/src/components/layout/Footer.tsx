import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="animate-slideInLeft">
            <h3 className="text-xl font-bold mb-4 text-primary-light">Esperança de Amor</h3>
            <p className="text-background/80 mb-4">
              Your trusted local store for foodstuffs, drinks, and quality products in Luanda, Angola.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="hover:bg-primary hover:scale-110 transition-all duration-200">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary hover:scale-110 transition-all duration-200">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary hover:scale-110 transition-all duration-200">
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="animate-fadeInUp">
            <h4 className="text-lg font-semibold mb-4 text-primary-light">Quick Links</h4>
            <ul className="space-y-2">
              {['Home', 'Shop', 'About Us', 'Contact', 'Privacy Policy', 'Terms of Service'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-background/80 hover:text-primary-light transition-colors duration-200">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="animate-fadeInUp">
            <h4 className="text-lg font-semibold mb-4 text-primary-light">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primary-light" />
                <span className="text-background/80">Luanda, Angola</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary-light" />
                <a 
                  href="https://wa.me/244922706107" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-background/80 hover:text-primary-light transition-colors duration-200"
                >
                  +244 922 706 107
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary-light" />
                <span className="text-background/80">info@esperancadeamor.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 mt-12 pt-8 text-center">
          <p className="text-background/60">
            © {currentYear} Esperança de Amor. All rights reserved.
          </p>
          <p className="text-background/60 mt-2">
            Developed by{' '}
            <a 
              href="https://meronvault.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-light hover:text-primary transition-colors duration-200 font-semibold animate-glow"
              style={{
                animation: 'glow 2s ease-in-out infinite alternate',
                textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor'
              }}
            >
              MERONI
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;