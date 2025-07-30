import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const CategorySection = () => {
  const categories = [
    {
      id: 1,
      name: 'Fresh Fruits & Vegetables',
      description: 'Locally sourced fresh produce',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=200&fit=crop',
      productCount: 45,
      color: 'bg-green-500'
    },
    {
      id: 2,
      name: 'Beverages & Drinks',
      description: 'Refreshing drinks and beverages',
      image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=200&fit=crop',
      productCount: 32,
      color: 'bg-blue-500'
    },
    {
      id: 3,
      name: 'Meat & Seafood',
      description: 'Fresh meat and seafood selection',
      image: 'https://images.unsplash.com/photo-1544943910-4ca6073dd0b4?w=300&h=200&fit=crop',
      productCount: 28,
      color: 'bg-red-500'
    },
    {
      id: 4,
      name: 'Dairy Products',
      description: 'Fresh milk, cheese, and dairy',
      image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300&h=200&fit=crop',
      productCount: 22,
      color: 'bg-yellow-500'
    },
    {
      id: 5,
      name: 'Pantry Essentials',
      description: 'Rice, oil, spices, and more',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop',
      productCount: 56,
      color: 'bg-orange-500'
    },
    {
      id: 6,
      name: 'Imported Goods',
      description: 'Quality imported products',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop',
      productCount: 38,
      color: 'bg-purple-500'
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fadeInUp">
          <h2 className="text-4xl font-bold mb-4">Shop by Category</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse our wide selection of products organized by categories for easy shopping.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Card 
              key={category.id} 
              className={`group cursor-pointer hover:shadow-glow transition-all duration-300 hover:-translate-y-2 overflow-hidden animate-scaleIn`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/70 transition-all duration-300"></div>
                
                {/* Product count badge */}
                <div className="absolute top-3 right-3 bg-background/90 text-foreground px-2 py-1 rounded-full text-xs font-medium">
                  {category.productCount} items
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-4 h-4 rounded-full ${category.color}`}></div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </div>
                
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-200">
                  {category.name}
                </h3>
                
                <p className="text-muted-foreground text-sm">
                  {category.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;