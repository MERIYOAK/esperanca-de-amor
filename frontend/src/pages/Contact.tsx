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
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-red-600 to-red-800 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fadeInUp">
              Entre em Contacto
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto animate-fadeInUp">
              Estamos aqui para ajudar! Entre em contacto connosco para qualquer dúvida ou sugestão
            </p>
          </div>
        </section>

        {/* Contact Info & Form Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div className="animate-slideInLeft">
                <h2 className="text-3xl font-bold text-foreground mb-8">
                  Informações de Contacto
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-6 bg-card rounded-lg shadow-card hover:shadow-glow transition-all duration-300 group">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <Phone className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Telefone</h3>
                      <a 
                        href="https://wa.me/244922706107" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-red-600 transition-colors duration-200 block"
                      >
                        +244 922 706 107
                      </a>
                      <p className="text-muted-foreground text-sm">(WhatsApp)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-6 bg-card rounded-lg shadow-card hover:shadow-glow transition-all duration-300 group">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <Mail className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Email</h3>
                      <p className="text-muted-foreground">info@esperancadeamor.ao</p>
                      <p className="text-muted-foreground">vendas@esperancadeamor.ao</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-6 bg-card rounded-lg shadow-card hover:shadow-glow transition-all duration-300 group">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <MapPin className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Endereço</h3>
                      <p className="text-muted-foreground">Rua da Esperança, 123</p>
                      <p className="text-muted-foreground">Luanda, Angola</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-6 bg-card rounded-lg shadow-card hover:shadow-glow transition-all duration-300 group">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <Clock className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Horário</h3>
                      <p className="text-muted-foreground">Segunda a Sábado: 7h00 - 20h00</p>
                      <p className="text-muted-foreground">Domingo: 8h00 - 18h00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="animate-slideInRight">
                <div className="bg-card p-8 rounded-lg shadow-card">
                  <h2 className="text-3xl font-bold text-foreground mb-6">
                    Envie-nos uma Mensagem
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Nome
                        </label>
                        <Input 
                          type="text" 
                          placeholder="Seu nome completo"
                          className="w-full"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Email
                        </label>
                        <Input 
                          type="email" 
                          placeholder="seu@email.com"
                          className="w-full"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Assunto
                      </label>
                      <Input 
                        type="text" 
                        placeholder="Como podemos ajudar?"
                        className="w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Mensagem
                      </label>
                      <Textarea 
                        placeholder="Escreva a sua mensagem aqui..."
                        className="w-full min-h-[120px]"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
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
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4 animate-fadeInUp">
                Perguntas Frequentes
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto animate-fadeInUp">
                Encontre respostas rápidas para as perguntas mais comuns
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="space-y-6">
                <div className="bg-background p-6 rounded-lg shadow-card animate-scaleIn">
                  <h3 className="font-semibold text-foreground mb-2">
                    Fazem entregas em toda Luanda?
                  </h3>
                  <p className="text-muted-foreground">
                    Sim, fazemos entregas em toda a cidade de Luanda. O prazo varia entre 
                    2-5 horas dependendo da localização.
                  </p>
                </div>
                <div className="bg-background p-6 rounded-lg shadow-card animate-scaleIn">
                  <h3 className="font-semibold text-foreground mb-2">
                    Quais são os métodos de pagamento aceites?
                  </h3>
                  <p className="text-muted-foreground">
                    Aceitamos dinheiro, transferência bancária, Multicaixa Express e 
                    cartões de débito/crédito.
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-background p-6 rounded-lg shadow-card animate-scaleIn">
                  <h3 className="font-semibold text-foreground mb-2">
                    Têm produtos frescos diariamente?
                  </h3>
                  <p className="text-muted-foreground">
                    Sim, recebemos produtos frescos diariamente, incluindo frutas, 
                    vegetais, carnes e lacticínios.
                  </p>
                </div>
                <div className="bg-background p-6 rounded-lg shadow-card animate-scaleIn">
                  <h3 className="font-semibold text-foreground mb-2">
                    Posso fazer encomendas por telefone?
                  </h3>
                  <p className="text-muted-foreground">
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