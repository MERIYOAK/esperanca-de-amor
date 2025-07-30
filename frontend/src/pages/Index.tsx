import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import WeeklyOffers from '@/components/home/WeeklyOffers';
import CategorySection from '@/components/home/CategorySection';
import TestimonialSection from '@/components/home/TestimonialSection';
import AnnouncementSection from '@/components/home/AnnouncementSection';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <AnnouncementSection />
      <main>
        <HeroSection />
        <FeaturedProducts />
        <WeeklyOffers />
        <CategorySection />
        <TestimonialSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
