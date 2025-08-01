import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with backend
    alert('Mensagem enviada! Entraremos em contacto em breve.');
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16 md:pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-red-600 to-red-800 py-12 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-white mb-4 md:mb-6 animate-fadeInUp">
              Entre em Contacto
            </h1>
            <p className="text-base md:text-xl text-white/90 max-w-3xl mx-auto animate-fadeInUp">
              Estamos aqui para ajudar! Entre em contacto connosco para qualquer dúvida ou sugestão
            </p>
          </div>
        </section>

        {/* Contact Info & Form Section */}
        <section className="py-12 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
              {/* Contact Information */}
              <div className="animate-slideInLeft">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 md:mb-8">
                  Informações de Contacto
                </h2>
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-start gap-3 md:gap-4 p-4 md:p-6 bg-card rounded-lg shadow-card hover:shadow-glow transition-all duration-300 group">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors flex-shrink-0">
                      <Phone className="w-4 h-4 md:w-6 md:h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 text-sm md:text-base">Telefone</h3>
                      <a 
                        href="https://wa.me/244922706107" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-red-600 transition-colors duration-200 block text-sm md:text-base"
                      >
                        +244 922 706 107
                      </a>
                      <p className="text-muted-foreground text-xs md:text-sm">(WhatsApp)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 md:gap-4 p-4 md:p-6 bg-card rounded-lg shadow-card hover:shadow-glow transition-all duration-300 group">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors flex-shrink-0">
                      <Mail className="w-4 h-4 md:w-6 md:h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 text-sm md:text-base">Email</h3>
                      <p className="text-muted-foreground text-sm md:text-base">info@esperancadeamor.ao</p>
                      <p className="text-muted-foreground text-sm md:text-base">vendas@esperancadeamor.ao</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 md:gap-4 p-4 md:p-6 bg-card rounded-lg shadow-card hover:shadow-glow transition-all duration-300 group">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors flex-shrink-0">
                      <MapPin className="w-4 h-4 md:w-6 md:h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 text-sm md:text-base">Endereço</h3>
                      <p className="text-muted-foreground text-sm md:text-base">Rua da Esperança, 123</p>
                      <p className="text-muted-foreground text-sm md:text-base">Luanda, Angola</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 md:gap-4 p-4 md:p-6 bg-card rounded-lg shadow-card hover:shadow-glow transition-all duration-300 group">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors flex-shrink-0">
                      <Clock className="w-4 h-4 md:w-6 md:h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 text-sm md:text-base">Horário</h3>
                      <p className="text-muted-foreground text-sm md:text-base">Segunda a Sábado: 7h00 - 20h00</p>
                      <p className="text-muted-foreground text-sm md:text-base">Domingo: 8h00 - 18h00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="animate-slideInRight">
                <div className="bg-card p-4 md:p-8 rounded-lg shadow-card">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 md:mb-6">
                    Envie-nos uma Mensagem
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-foreground mb-2">
                          Nome
                        </label>
                        <Input 
                          type="text" 
                          placeholder="Seu nome completo"
                          className="w-full text-sm md:text-base"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-foreground mb-2">
                          Email
                        </label>
                        <Input 
                          type="email" 
                          placeholder="seu@email.com"
                          className="w-full text-sm md:text-base"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-foreground mb-2">
                        Assunto
                      </label>
                      <Input 
                        type="text" 
                        placeholder="Como podemos ajudar?"
                        className="w-full text-sm md:text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-foreground mb-2">
                        Mensagem
                      </label>
                      <Textarea 
                        placeholder="Escreva a sua mensagem aqui..."
                        className="w-full min-h-[100px] md:min-h-[120px] text-sm md:text-base"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-red-600 hover:bg-red-700 text-white text-sm md:text-base"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensagem
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 md:py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 md:mb-4 animate-fadeInUp">
                Perguntas Frequentes
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto animate-fadeInUp text-sm md:text-base">
                Encontre respostas rápidas para as perguntas mais comuns
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
              <div className="space-y-4 md:space-y-6">
                <div className="bg-background p-4 md:p-6 rounded-lg shadow-card animate-scaleIn">
                  <h3 className="font-semibold text-foreground mb-2 text-sm md:text-base">
                    Fazem entregas em toda Luanda?
                  </h3>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Sim, fazemos entregas em toda a cidade de Luanda. O prazo varia entre 
                    2-5 horas dependendo da localização.
                  </p>
                </div>
                <div className="bg-background p-4 md:p-6 rounded-lg shadow-card animate-scaleIn">
                  <h3 className="font-semibold text-foreground mb-2 text-sm md:text-base">
                    Quais são os métodos de pagamento aceites?
                  </h3>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Aceitamos dinheiro, transferência bancária, Multicaixa Express e 
                    cartões de débito/crédito.
                  </p>
                </div>
              </div>
              <div className="space-y-4 md:space-y-6">
                <div className="bg-background p-4 md:p-6 rounded-lg shadow-card animate-scaleIn">
                  <h3 className="font-semibold text-foreground mb-2 text-sm md:text-base">
                    Têm produtos frescos diariamente?
                  </h3>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Sim, recebemos produtos frescos diariamente, incluindo frutas, 
                    vegetais, carnes e lacticínios.
                  </p>
                </div>
                <div className="bg-background p-4 md:p-6 rounded-lg shadow-card animate-scaleIn">
                  <h3 className="font-semibold text-foreground mb-2 text-sm md:text-base">
                    Posso fazer encomendas por telefone?
                  </h3>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Claro! Pode ligar-nos durante o horário de funcionamento para 
                    fazer a sua encomenda.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;