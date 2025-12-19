
import React from 'react';

interface PricingProps {
  onCheckout: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ onCheckout }) => {
  return (
    <section className="py-12 md:py-20 animate-[fadeIn_0.5s_ease-out]">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* 1. HERO SECTION */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight font-sans">
            Escolha o plano que <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">impulsionará</span> <br />
            seu ministério.
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto text-lg font-light leading-relaxed">
            Tenha acesso a milhares de arquivos editáveis com cotas diárias que se adaptam à realidade da sua igreja.
          </p>
        </div>

        {/* 2. PRICING GRID (Glassmorphism) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20 items-center">
          
          {/* Card 1: Voluntário */}
          <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-white/5 rounded-2xl p-8 flex flex-col h-full hover:bg-[rgba(255,255,255,0.05)] transition-all duration-300">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-text-muted mb-2 uppercase tracking-widest">Voluntário</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-sm text-text-muted">R$</span>
                <span className="text-4xl font-extrabold text-white">29,90</span>
                <span className="text-sm text-text-muted">/mês</span>
              </div>
              <p className="text-sm text-text-muted mt-3 font-light">Ideal para demandas pontuais e rápidas.</p>
            </div>
            
            <div className="py-4 mb-6 border-y border-white/5">
                <div className="flex items-center gap-3 text-white font-bold text-lg">
                    <i className="fas fa-file-download text-text-muted"></i>
                    <span>3 Downloads <span className="text-xs font-normal text-text-muted inline-block ml-1">/ dia</span></span>
                </div>
                <p className="text-[10px] text-text-muted mt-1 pl-7 opacity-60">Aprox. 90 downloads/mês</p>
            </div>
            
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-text-muted">
                <i className="fas fa-check text-green-500/70 mt-1"></i>
                <span>Acesso a Arquivos Premium</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-text-muted">
                <i className="fas fa-check text-green-500/70 mt-1"></i>
                <span>Licença de Uso Comercial</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-text-muted">
                <i className="fas fa-check text-green-500/70 mt-1"></i>
                <span>Suporte via E-mail</span>
              </li>
            </ul>

            <button 
                onClick={onCheckout}
                className="w-full bg-transparent border border-white/20 text-white font-semibold py-3.5 rounded-lg hover:border-white hover:bg-white/5 transition-all"
            >
              Começar Agora
            </button>
          </div>

          {/* Card 2: Ministério (HIGHLIGHT) */}
          <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-md border border-primary/40 rounded-2xl p-8 flex flex-col h-full shadow-[0_10px_40px_rgba(0,0,0,0.3)] transform md:scale-105 relative z-10">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg border border-white/10">
                Mais Popular
             </div>
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-widest flex items-center gap-2">
                Ministério <i className="fas fa-church text-primary text-sm"></i>
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-sm text-text-muted">R$</span>
                <span className="text-5xl font-extrabold text-white">49,90</span>
                <span className="text-sm text-text-muted">/mês</span>
              </div>
              <p className="text-sm text-text-muted mt-3 font-light">Para igrejas que comunicam todos os dias.</p>
            </div>

            <div className="py-5 mb-6 border-y border-white/10 bg-white/5 -mx-8 px-8">
                <div className="flex items-center gap-3 text-white font-bold text-xl">
                    <i className="fas fa-layer-group text-primary"></i>
                    <span>7 Downloads <span className="text-xs font-normal text-text-muted inline-block ml-1">/ dia</span></span>
                </div>
                 <p className="text-[10px] text-text-muted mt-1 pl-8 opacity-60">Aprox. 210 downloads/mês</p>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-white font-medium">
                <i className="fas fa-check text-primary mt-1"></i>
                <span>Acesso Prioritário a Lançamentos</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white">
                <i className="fas fa-check text-primary mt-1"></i>
                <span>Suporte Rápido via WhatsApp</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white">
                <i className="fas fa-check text-primary mt-1"></i>
                <span>Acesso a Pedidos de Artes</span>
              </li>
            </ul>

            <button 
                onClick={onCheckout}
                className="w-full bg-primary text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all transform active:scale-[0.98]"
            >
              Assinar Mensal
            </button>
          </div>

          {/* Card 3: Kadosh Design Premium (Annual) */}
          <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-amber-400/30 rounded-2xl p-8 flex flex-col h-full hover:shadow-[0_0_20px_rgba(251,191,36,0.05)] transition-all duration-300 relative">
            <div className="absolute top-4 right-4 text-amber-400 opacity-20">
                <i className="fas fa-crown text-6xl"></i>
            </div>
            
            <div className="mb-6 relative">
              <span className="inline-block bg-amber-400/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded mb-2 border border-amber-400/20">
                  Melhor Custo-Benefício
              </span>
              <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-widest">Kadosh Design Premium</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-sm text-text-muted">R$</span>
                <span className="text-4xl font-extrabold text-white">299,99</span>
                <span className="text-sm text-text-muted">/ano</span>
              </div>
              <p className="text-sm text-green-400 mt-2 font-medium">
                Economize R$ 298,80
              </p>
              <p className="text-xs text-text-muted mt-2 font-light">
                 Equivalente a <strong>R$ 25,00/mês</strong> com o poder do plano Ministério.
              </p>
            </div>
            
             <div className="py-4 mb-6 border-y border-white/5">
                <div className="flex items-center gap-3 text-amber-400 font-bold text-lg">
                    <i className="fas fa-infinity"></i>
                    <span>7 Downloads <span className="text-xs font-normal text-text-muted inline-block ml-1">/ dia</span></span>
                </div>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-white">
                 <i className="fas fa-check text-amber-400 mt-1"></i>
                <span>Todos benefícios do Plano Ministério</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white">
                 <i className="fas fa-check text-amber-400 mt-1"></i>
                <span>Pagamento Único (Sem mensalidade)</span>
              </li>
               <li className="flex items-start gap-3 text-sm text-white">
                 <i className="fas fa-check text-amber-400 mt-1"></i>
                <span>Parcelamento em até 12x</span>
              </li>
            </ul>

            <button 
                onClick={onCheckout}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold py-3.5 rounded-lg shadow-[0_4px_15px_rgba(245,158,11,0.2)] transition-all transform active:scale-[0.98]"
            >
              Garantir Oferta Anual
            </button>
          </div>

        </div>

        {/* 3. FAQ SECTION (Simplified) */}
        <div className="max-w-3xl mx-auto text-center border-t border-white/5 pt-12">
            <h3 className="text-xl font-bold text-white mb-8">Dúvidas Comuns</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="bg-surface/50 p-4 rounded-lg">
                    <h4 className="font-bold text-white text-sm mb-2">A cota é acumulativa?</h4>
                    <p className="text-xs text-text-muted">Não. A cota renova diariamente à meia-noite. Downloads não utilizados não acumulam.</p>
                </div>
                <div className="bg-surface/50 p-4 rounded-lg">
                     <h4 className="font-bold text-white text-sm mb-2">Tem fidelidade?</h4>
                    <p className="text-xs text-text-muted">Nos planos mensais (Voluntário e Ministério) não há fidelidade. Cancele quando quiser.</p>
                </div>
            </div>
             <div className="mt-8">
                <p className="text-text-muted text-sm">
                    Ainda com dúvidas? <a href="#" className="text-primary hover:underline">Fale conosco no WhatsApp.</a>
                </p>
            </div>
        </div>

      </div>
    </section>
  );
};
