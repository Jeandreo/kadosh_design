
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  return (
    <footer className="bg-surface border-t border-border pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Section 1: About */}
          <div>
            <div 
              className="flex flex-col mb-6 cursor-pointer" 
              onClick={() => onNavigate('/')}
            >
              <div className="text-2xl font-extrabold text-white tracking-wider font-sans">
                KADOSH <span className="text-secondary font-light">DESIGN</span>
              </div>
            </div>
            <p className="text-text-muted text-sm leading-relaxed mb-6">
              Missão: Facilitar o acesso a artes e materiais gráficos cristãos com qualidade e agilidade.
              Servindo o Reino com excelência visual.
            </p>
          </div>

          {/* Section 2: Company */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Empresa</h4>
            <ul className="space-y-3 text-sm text-text-muted">
              <li><button onClick={() => onNavigate('sobre')} className="hover:text-primary transition-colors text-left">Sobre Nós</button></li>
              <li><button onClick={() => onNavigate('contato')} className="hover:text-primary transition-colors text-left">Entre em Contato</button></li>
              <li><button onClick={() => onNavigate('planos')} className="hover:text-primary transition-colors text-left">Planos de Assinatura</button></li>
              <li><button onClick={() => onNavigate('contato')} className="hover:text-primary transition-colors text-left">Trabalhe Conosco</button></li>
            </ul>
          </div>

          {/* Section 3: Terms */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Termos</h4>
            <ul className="space-y-3 text-sm text-text-muted">
              <li><button onClick={() => onNavigate('termos')} className="hover:text-primary transition-colors text-left">Termos de Serviço</button></li>
              <li><button onClick={() => onNavigate('termos')} className="hover:text-primary transition-colors text-left">Política de Privacidade</button></li>
              <li><button onClick={() => onNavigate('termos')} className="hover:text-primary transition-colors text-left">Licença de Uso</button></li>
              <li><button onClick={() => onNavigate('termos')} className="hover:text-primary transition-colors text-left">Política de Reembolso</button></li>
            </ul>
          </div>

          {/* Section 4: Connect */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Conecte-se</h4>
            <div className="flex gap-4 mb-6">
              <a 
                href="https://www.instagram.com/hd_designer.ofc/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-text-muted hover:bg-gradient-to-tr hover:from-purple-600 hover:to-orange-500 hover:text-white transition-all duration-300"
              >
                <i className="fab fa-instagram text-lg"></i>
              </a>
              <a 
                href="https://wa.me/5531986022600" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-text-muted hover:bg-green-600 hover:text-white transition-all duration-300"
              >
                <i className="fab fa-whatsapp text-lg"></i>
              </a>
              <a 
                href="mailto:kadosh.suporteonline@gmail.com" 
                className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-all duration-300"
              >
                <i className="far fa-envelope text-lg"></i>
              </a>
            </div>
            <div className="text-sm text-text-muted">
              <p className="mb-1"><i className="fas fa-map-marker-alt mr-2 text-primary"></i>Divinópolis - MG</p>
              <p><i className="fas fa-phone mr-2 text-primary"></i>(31) 98602-2600</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-muted text-center md:text-left">
          <p>&copy; {new Date().getFullYear()} Kadosh Design. Todos os direitos reservados.</p>
          <div className="flex flex-col md:flex-row items-center gap-4">
              <p>CNPJ: 53.283.247/0001-29 - HUDSON SOARES DA SILVA</p>
              {user?.role === 'admin' && (
                <button 
                  onClick={() => onNavigate('admin')} 
                  className="text-text-muted hover:text-white transition-colors underline"
                >
                  Painel Administrativo
                </button>
              )}
          </div>
        </div>
      </div>
    </footer>
  );
};
