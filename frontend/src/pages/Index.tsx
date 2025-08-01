import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import WeeklyOffers from '@/components/home/WeeklyOffers';
import CategorySection from '@/components/home/CategorySection';
import TestimonialSection from '@/components/home/TestimonialSection';
import AnnouncementSection from '@/components/home/AnnouncementSection';
import NewsletterAnnouncements from '@/components/home/NewsletterAnnouncements';
import NewsletterCTA from '@/components/home/NewsletterCTA';
import NewsletterSubscription from '@/components/NewsletterSubscription';

const Index = () => {
  return (
    <div className="min-h-screen bg-transparent">
      <Header />
      <div className="relative z-30">
        <AnnouncementSection />
      </div>
      <main>
        <HeroSection />
        <FeaturedProducts />
        <NewsletterAnnouncements />
        <WeeklyOffers />
        <NewsletterCTA />
        <CategorySection />
        <TestimonialSection />
        <NewsletterSubscription />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
