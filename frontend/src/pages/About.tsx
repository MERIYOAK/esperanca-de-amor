import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Heart, Users, Award, MapPin } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-red-600 to-red-800 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fadeInUp">
              Sobre Esperança de Amor
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto animate-fadeInUp">
              Mais de uma década servindo as famílias de Luanda com produtos de qualidade e preços justos
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="animate-slideInLeft">
                <h2 className="text-3xl font-bold text-foreground mb-6">Nossa História</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Fundada em 2010, a Esperança de Amor nasceu do sonho de uma família angolana de 
                  proporcionar acesso fácil a produtos alimentares de qualidade para todas as famílias 
                  de Luanda. O que começou como uma pequena mercearia familiar transformou-se numa 
                  das principais referências em distribuição de alimentos na capital.
                </p>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Hoje, orgulhamo-nos de servir milhares de clientes com uma vasta gama de produtos 
                  locais e importados, sempre mantendo o nosso compromisso com a qualidade, 
                  preços justos e atendimento familiar que nos caracteriza desde o início.
                </p>
                <div className="flex items-center gap-4 text-red-600">
                  <Heart className="w-6 h-6" />
                  <span className="font-semibold">Feito com amor para Angola</span>
                </div>
              </div>
              <div className="animate-slideInRight">
                <div className="bg-card rounded-lg p-8 shadow-card">
                  <div className="grid grid-cols-2 gap-6 text-center">
                    <div>
                      <div className="text-3xl font-bold text-red-600 mb-2">15+</div>
                      <div className="text-muted-foreground">Anos de Experiência</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-red-600 mb-2">10K+</div>
                      <div className="text-muted-foreground">Clientes Satisfeitos</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-red-600 mb-2">500+</div>
                      <div className="text-muted-foreground">Produtos Disponíveis</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-red-600 mb-2">24/7</div>
                      <div className="text-muted-foreground">Atendimento Online</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-red-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4 animate-fadeInUp">
                Nossos Valores
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto animate-fadeInUp">
                Os princípios que guiam o nosso trabalho diário e o nosso compromisso com a comunidade
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-background rounded-lg shadow-card hover:shadow-glow transition-all duration-300 animate-scaleIn group">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                  <Award className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Qualidade</h3>
                <p className="text-muted-foreground">
                  Selecionamos cuidadosamente cada produto para garantir a melhor qualidade 
                  para as suas famílias.
                </p>
              </div>
              <div className="text-center p-6 bg-background rounded-lg shadow-card hover:shadow-glow transition-all duration-300 animate-scaleIn group">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                  <Users className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Comunidade</h3>
                <p className="text-muted-foreground">
                  Somos parte da comunidade angolana e trabalhamos para o desenvolvimento 
                  de todos.
                </p>
              </div>
              <div className="text-center p-6 bg-background rounded-lg shadow-card hover:shadow-glow transition-all duration-300 animate-scaleIn group">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                  <Heart className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Amor</h3>
                <p className="text-muted-foreground">
                  Cada produto é escolhido com amor e carinho, pensando no bem-estar 
                  das famílias.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="animate-slideInLeft">
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  <MapPin className="w-8 h-8 text-primary inline mr-2" />
                  Localização
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Estamos estrategicamente localizados no coração de Luanda, facilitando 
                  o acesso de todas as famílias aos nossos produtos. Nossa localização 
                  permite-nos servir melhor a comunidade e manter preços competitivos 
                  através de uma logística eficiente.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-foreground">Endereço Principal</h4>
                      <p className="text-muted-foreground">Rua da Esperança, 123, Luanda - Angola</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-foreground">Horário de Funcionamento</h4>
                      <p className="text-muted-foreground">Segunda a Sábado: 7h00 - 20h00</p>
                      <p className="text-muted-foreground">Domingo: 8h00 - 18h00</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="animate-slideInRight">
                <div className="bg-muted/30 rounded-lg h-80 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Mapa em breve</p>
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