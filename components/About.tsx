
import React from 'react';

export const About: React.FC = () => {
  return (
    <section className="py-16 md:py-24 animate-[fadeIn_0.3s_ease-out]">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* HERO HEADER */}
        <div className="text-center mb-16">
           <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 font-sans tracking-tight">
             Quem Somos
           </h1>
           <div className="h-1 w-24 bg-primary mx-auto rounded-full"></div>
        </div>

        {/* HISTORY SECTION - Centralized Reading Layout */}
        <div className="mb-20 space-y-6 text-lg text-text-muted leading-relaxed font-light text-justify md:text-center">
            <p>
              A <strong>Kadosh Design</strong> nasceu do sonho de unir excelência técnica e propósito espiritual. Fundada por <strong>Hudson Soares da Silva</strong>, a empresa carrega em seu DNA mais de <strong>10 anos de experiência</strong> no mercado de design gráfico.
            </p>
            <p>
              Percebendo a carência de materiais visuais de alta qualidade voltados especificamente para o público cristão, decidimos criar uma solução que fosse, ao mesmo tempo, acessível e profissional. Não vendemos apenas arquivos; entregamos ferramentas para que igrejas e ministérios possam comunicar o Evangelho com a dignidade e a beleza que Ele merece.
            </p>
        </div>

        {/* MISSION & VISION - Visual Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="bg-[rgba(255,255,255,0.03)] border border-white/5 p-10 rounded-2xl relative overflow-hidden group hover:border-primary/30 transition-colors">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
               <i className="fas fa-bullseye text-8xl text-white"></i>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Nossa Missão</h3>
            <p className="text-text-muted relative z-10 leading-relaxed">
              Potencializar o processo criativo de designers e igrejas, facilitando o acesso a artes de alta performance com agilidade e compromisso bíblico.
            </p>
          </div>

          <div className="bg-[rgba(255,255,255,0.03)] border border-white/5 p-10 rounded-2xl relative overflow-hidden group hover:border-secondary/30 transition-colors">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
               <i className="fas fa-globe-americas text-8xl text-white"></i>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Nossa Visão</h3>
            <p className="text-text-muted relative z-10 leading-relaxed">
              Ser a maior e mais relevante biblioteca digital de recursos criativos cristãos do Brasil, estabelecendo um novo padrão de qualidade visual para o Reino.
            </p>
          </div>
        </div>

        {/* VALUES GRID - 4 Pillars */}
        <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-white mb-8">Nossos Pilares</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { icon: 'fa-gem', title: 'Qualidade', desc: 'Excelência técnica em cada arquivo PSD.' },
                    { icon: 'fa-bolt', title: 'Agilidade', desc: 'Downloads rápidos para otimizar seu tempo.' },
                    { icon: 'fa-hand-holding-heart', title: 'Acessibilidade', desc: 'Preços justos para todas as realidades.' },
                    { icon: 'fa-balance-scale', title: 'Ética Cristã', desc: 'Transparência, honestidade e temor.' }
                ].map((val, idx) => (
                    <div key={idx} className="bg-surface p-6 rounded-xl border border-border hover:-translate-y-1 transition-transform duration-300">
                        <div className="w-12 h-12 mx-auto bg-background rounded-full flex items-center justify-center mb-4 border border-white/5 shadow-inner">
                            <i className={`fas ${val.icon} text-secondary text-lg`}></i>
                        </div>
                        <h4 className="font-bold text-white mb-2">{val.title}</h4>
                        <p className="text-xs text-text-muted leading-relaxed">{val.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
};
