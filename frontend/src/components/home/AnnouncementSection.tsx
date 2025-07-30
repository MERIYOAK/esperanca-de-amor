import { X, Gift, Truck, Heart, Percent, Clock, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';

const announcements = [
  {
    icon: Gift,
    text: "Frete Grátis em compras acima de R$ 150",
    color: "from-emerald-600 to-emerald-700"
  },
  {
    icon: Truck,
    text: "Entrega em até 7 dias úteis para todo o Brasil",
    color: "from-blue-600 to-blue-700"
  },
  {
    icon: Percent,
    text: "10% OFF na primeira compra - Use: BEMVINDO10",
    color: "from-purple-600 to-purple-700"
  },
  {
    icon: Heart,
    text: "Produtos com até 50% de desconto na Black Week",
    color: "from-red-600 to-red-700"
  },
  {
    icon: Clock,
    text: "Promoção relâmpago: 30% OFF em produtos selecionados",
    color: "from-orange-600 to-orange-700"
  },
  {
    icon: ShoppingBag,
    text: "Compre 2 leve 3 em toda linha de acessórios",
    color: "from-indigo-600 to-indigo-700"
  }
];

const AnnouncementSection = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const currentAnnouncement = announcements[currentIndex];
  const Icon = currentAnnouncement.icon;

  return (
    <div className={`bg-gradient-to-r ${currentAnnouncement.color} text-white relative overflow-hidden transition-all duration-500`}>
      <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
      <div className="container mx-auto px-4 py-3 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center flex-1">
            <div className="flex items-center space-x-3 animate-fade-in">
              <Icon className="h-5 w-5 animate-pulse" />
              <span className="text-sm md:text-base font-semibold text-center">
                {currentAnnouncement.text}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors ml-4"
            aria-label="Fechar anúncio"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex justify-center mt-2 space-x-1">
          {announcements.map((_, index) => (
            <div
              key={index}
              className={`h-1 w-6 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementSection;