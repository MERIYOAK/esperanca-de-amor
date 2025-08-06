import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Heart, Users, Award, MapPin, Star, ShoppingBag, Truck, Shield } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-800 py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
              alt="Esperança de Amor Background" 
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
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 md:mb-8 animate-fadeInUp leading-tight">
                Sobre <span className="text-yellow-300">Esperança de Amor</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto animate-fadeInUp leading-relaxed px-2 sm:px-0">
                Mais de uma década servindo as famílias de Luanda com produtos de qualidade e preços justos
              </p>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center text-white/80">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 mr-2" />
                  <span className="text-xs sm:text-sm">15+ Anos de Experiência</span>
                </div>
                <div className="flex items-center text-white/80">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-300 mr-2" />
                  <span className="text-xs sm:text-sm">Feito com Amor</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
              <div className="animate-slideInLeft space-y-4 sm:space-y-6">
                <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-red-100 text-red-700 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Nossa História
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
                  Uma Jornada de <span className="text-red-600">Amor e Dedicação</span>
                </h2>
                <div className="space-y-3 sm:space-y-4 text-muted-foreground leading-relaxed text-sm sm:text-base">
                  <p>
                    Fundada em 2010, a Esperança de Amor nasceu do sonho de uma família angolana de 
                    proporcionar acesso fácil a produtos alimentares de qualidade para todas as famílias 
                    de Luanda. O que começou como uma pequena mercearia familiar transformou-se numa 
                    das principais referências em distribuição de alimentos na capital.
                  </p>
                  <p>
                    Hoje, orgulhamo-nos de servir milhares de clientes com uma vasta gama de produtos 
                    locais e importados, sempre mantendo o nosso compromisso com a qualidade, 
                    preços justos e atendimento familiar que nos caracteriza desde o início.
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 text-red-600 pt-3 sm:pt-4">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="font-semibold text-sm sm:text-base">Feito com amor para Angola</span>
                </div>
              </div>
              <div className="animate-slideInRight">
                <div className="relative">
                  {/* Main Image */}
                  <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl">
                    <img 
                      src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                      alt="Esperança de Amor Store" 
                      className="w-full h-64 sm:h-80 md:h-96 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                  
                  {/* Stats Card Overlay */}
                  <div className="absolute -bottom-4 sm:-bottom-6 md:-bottom-8 -right-2 sm:-right-4 md:-right-8 bg-white rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl p-3 sm:p-4 md:p-6 border border-gray-100 max-w-[calc(100vw-2rem)] sm:max-w-none">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 text-center">
                      <div>
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 mb-1 sm:mb-2">15+</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Anos de Experiência</div>
                      </div>
                      <div>
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 mb-1 sm:mb-2">10K+</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Clientes Satisfeitos</div>
                      </div>
                      <div>
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 mb-1 sm:mb-2">500+</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Produtos Disponíveis</div>
                      </div>
                      <div>
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 mb-1 sm:mb-2">24/7</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Atendimento Online</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-red-50 via-white to-red-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-red-100 text-red-700 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Nossos Valores
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6 animate-fadeInUp">
                Os Princípios que <span className="text-red-600">Nos Guiam</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto animate-fadeInUp text-sm sm:text-base md:text-lg px-2 sm:px-0">
                Os princípios que guiam o nosso trabalho diário e o nosso compromisso com a comunidade
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="text-center p-6 sm:p-8 bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-scaleIn group border border-gray-100">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <Award className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">Qualidade</h3>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  Selecionamos cuidadosamente cada produto para garantir a melhor qualidade 
                  para as suas famílias.
                </p>
              </div>
              <div className="text-center p-6 sm:p-8 bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-scaleIn group border border-gray-100">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">Comunidade</h3>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  Somos parte da comunidade angolana e trabalhamos para o desenvolvimento 
                  de todos.
                </p>
              </div>
              <div className="text-center p-6 sm:p-8 bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-scaleIn group border border-gray-100">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">Amor</h3>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  Cada produto é escolhido com amor e carinho, pensando no bem-estar 
                  das famílias.
                </p>
              </div>
              <div className="text-center p-6 sm:p-8 bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-scaleIn group border border-gray-100">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">Confiança</h3>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  Construímos relacionamentos duradouros baseados na confiança e 
                  transparência.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team/Service Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
              <div className="animate-slideInLeft">
                <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                  <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Nossos Serviços
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
                  Serviços <span className="text-blue-600">Personalizados</span>
                </h2>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">Entrega Rápida</h3>
                      <p className="text-muted-foreground text-sm sm:text-base">Entrega no mesmo dia para pedidos feitos até às 14h00</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">Garantia de Qualidade</h3>
                      <p className="text-muted-foreground text-sm sm:text-base">Todos os produtos são verificados antes da entrega</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">Atendimento Personalizado</h3>
                      <p className="text-muted-foreground text-sm sm:text-base">Equipe dedicada para atender às suas necessidades</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="animate-slideInRight">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                    alt="Nossa Equipe" 
                    className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl sm:rounded-2xl"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
              <div className="animate-slideInLeft">
                <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Localização
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
                  <span className="text-green-600">Encontre-nos</span> em Luanda
                </h2>
                <p className="text-muted-foreground mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base md:text-lg">
                  Estamos estrategicamente localizados no coração de Luanda, facilitando 
                  o acesso de todas as famílias aos nossos produtos. Nossa localização 
                  permite-nos servir melhor a comunidade e manter preços competitivos 
                  através de uma logística eficiente.
                </p>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-100">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Endereço Principal</h4>
                      <p className="text-muted-foreground text-sm sm:text-base">Rua da Esperança, 123, Luanda - Angola</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-100">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Horário de Funcionamento</h4>
                      <p className="text-muted-foreground text-sm sm:text-base">Segunda a Sábado: 7h00 - 20h00</p>
                      <p className="text-muted-foreground text-sm sm:text-base">Domingo: 8h00 - 18h00</p>
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
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
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

export default About;