import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, Users, HelpCircle } from 'lucide-react';

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with backend
    alert('Mensagem enviada! Entraremos em contacto em breve.');
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-800 py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
              alt="Contact Background" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 via-red-700/85 to-red-800/90"></div>
          </div>
          
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          
          <div className="container mx-auto px-4 text-center relative z-10 pt-16 sm:pt-20">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Entre em Contacto
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 md:mb-8 animate-fadeInUp leading-tight">
                Estamos Aqui para <span className="text-yellow-300">Ajudar</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto animate-fadeInUp leading-relaxed px-2 sm:px-0">
                Entre em contacto connosco para qualquer dúvida, sugestão ou encomenda
              </p>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6">
                <div className="flex items-center text-white/80">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-red-300 mr-2" />
                  <span className="text-xs sm:text-sm">+244 922 706 107</span>
                </div>
                <div className="flex items-center text-white/80">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-red-300 mr-2" />
                  <span className="text-xs sm:text-sm">info@esperancadeamor.ao</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info & Form Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
              {/* Contact Information */}
              <div className="animate-slideInLeft">
                <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-red-100 text-red-700 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Informações de Contacto
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-6 sm:mb-8 leading-tight">
                  Fale <span className="text-red-600">Connosco</span>
                </h2>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-100">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Telefone</h3>
                      <a 
                        href="https://wa.me/244922706107" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-red-600 transition-colors duration-200 block text-sm sm:text-base"
                      >
                        +244 922 706 107
                      </a>
                      <p className="text-muted-foreground text-xs sm:text-sm">(WhatsApp)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-100">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Email</h3>
                      <p className="text-muted-foreground text-sm sm:text-base">info@esperancadeamor.ao</p>
                      <p className="text-muted-foreground text-sm sm:text-base">vendas@esperancadeamor.ao</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-100">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Endereço</h3>
                      <p className="text-muted-foreground text-sm sm:text-base">Rua da Esperança, 123</p>
                      <p className="text-muted-foreground text-sm sm:text-base">Luanda, Angola</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-100">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Horário</h3>
                      <p className="text-muted-foreground text-sm sm:text-base">Segunda a Sábado: 7h00 - 20h00</p>
                      <p className="text-muted-foreground text-sm sm:text-base">Domingo: 8h00 - 18h00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="animate-slideInRight">
                <div className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-xl border border-gray-100">
                  <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                    <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Envie-nos uma Mensagem
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
                    Fale <span className="text-blue-600">Connosco</span>
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
                          Nome
                        </label>
                        <Input 
                          type="text" 
                          placeholder="Seu nome completo"
                          className="w-full text-sm sm:text-base h-10 sm:h-12"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
                          Email
                        </label>
                        <Input 
                          type="email" 
                          placeholder="seu@email.com"
                          className="w-full text-sm sm:text-base h-10 sm:h-12"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
                        Assunto
                      </label>
                      <Input 
                        type="text" 
                        placeholder="Como podemos ajudar?"
                        className="w-full text-sm sm:text-base h-10 sm:h-12"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
                        Mensagem
                      </label>
                      <Textarea 
                        placeholder="Escreva a sua mensagem aqui..."
                        className="w-full min-h-[120px] sm:min-h-[140px] text-sm sm:text-base resize-none"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm sm:text-base h-10 sm:h-12 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Enviar Mensagem
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Perguntas Frequentes
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6 animate-fadeInUp">
                <span className="text-green-600">FAQ</span> - Perguntas Frequentes
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto animate-fadeInUp text-sm sm:text-base md:text-lg px-2 sm:px-0">
                Encontre respostas rápidas para as perguntas mais comuns
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-scaleIn border border-gray-100">
                  <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base md:text-lg">
                    Fazem entregas em toda Luanda?
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                    Sim, fazemos entregas em toda a cidade de Luanda. O prazo varia entre 
                    2-5 horas dependendo da localização.
                  </p>
                </div>
                <div className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-scaleIn border border-gray-100">
                  <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base md:text-lg">
                    Quais são os métodos de pagamento aceites?
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                    Aceitamos dinheiro, transferência bancária, Multicaixa Express e 
                    cartões de débito/crédito.
                  </p>
                </div>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-scaleIn border border-gray-100">
                  <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base md:text-lg">
                    Têm produtos frescos diariamente?
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                    Sim, recebemos produtos frescos diariamente, incluindo frutas, 
                    vegetais, carnes e lacticínios.
                  </p>
                </div>
                <div className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-scaleIn border border-gray-100">
                  <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base md:text-lg">
                    Posso fazer encomendas por telefone?
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                    Claro! Pode ligar-nos durante o horário de funcionamento para 
                    fazer a sua encomenda.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map/Additional Info Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
              <div className="animate-slideInLeft">
                <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Nossa Localização
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
                  <span className="text-purple-600">Encontre-nos</span> em Luanda
                </h2>
                <p className="text-muted-foreground mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base md:text-lg">
                  Estamos estrategicamente localizados no coração de Luanda, facilitando 
                  o acesso de todas as famílias aos nossos produtos. Visite-nos ou 
                  entre em contacto para mais informações.
                </p>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-100">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Endereço Principal</h4>
                      <p className="text-muted-foreground text-sm sm:text-base">Rua da Esperança, 123, Luanda - Angola</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-100">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Estacionamento</h4>
                      <p className="text-muted-foreground text-sm sm:text-base">Estacionamento gratuito disponível</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="animate-slideInRight">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80" 
                    alt="Nossa Localização" 
                    className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl sm:rounded-2xl"></div>
                  <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 bg-white/90 backdrop-blur-sm rounded-lg p-3 sm:p-4 shadow-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      <span className="font-semibold text-xs sm:text-sm">Luanda, Angola</span>
                    </div>
                  </div>
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