import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const TestimonialSection = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Maria Santos',
      location: 'Luanda, Angola',
      rating: 5,
      text: 'Esperança de Amor has the freshest products in the city. Their service is exceptional and delivery is always on time!',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2e5c91d?w=80&h=80&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'João Pedro',
      location: 'Luanda, Angola',
      rating: 5,
      text: 'The quality of their imported goods is outstanding. I always find what I need here, and the prices are very competitive.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Ana Cristina',
      location: 'Luanda, Angola',
      rating: 5,
      text: 'Weekly offers are amazing! I save so much money shopping here. The staff is friendly and always helpful.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face'
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fadeInUp">
          <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our satisfied customers have to say about us.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.id} 
              className={`group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 animate-fadeInUp`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <CardContent className="p-6 relative">
                <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />
                
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonial.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <p className="text-muted-foreground italic">
                  "{testimonial.text}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;