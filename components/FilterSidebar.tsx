
import React from 'react';

interface FilterSidebarProps {
  isVisible: boolean;
  selectedFormats: string[];
  selectedOrientations: string[];
  selectedPrice: 'all' | 'premium' | 'free';
  onFormatChange: (format: string) => void;
  onOrientationChange: (orientation: string) => void;
  onPriceChange: (price: 'all' | 'premium' | 'free') => void;
  onClearFilters: () => void;
  onClose?: () => void; // New prop for mobile UX
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isVisible,
  selectedFormats,
  selectedOrientations,
  selectedPrice,
  onFormatChange,
  onOrientationChange,
  onPriceChange,
  onClearFilters,
  onClose
}) => {
  // Nota: No mobile, renderizamos o componente mesmo se !isVisible para fazer a animação de slide,
  // controlando a visibilidade via CSS classes. No desktop, mantemos o comportamento padrão.
  
  return (
    <>
      {/* Mobile Backdrop (Parte direita livre que fecha o menu) */}
      <div 
        className={`
            fixed inset-0 z-[45] bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300
            ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
        `}
        onClick={onClose}
      ></div>

      {/* Sidebar Container */}
      <aside 
        className={`
            fixed inset-y-0 left-0 z-[50] w-[80%] max-w-[300px] bg-[#181A1B] border-r border-white/5 
            transform transition-transform duration-300 ease-in-out shadow-[10px_0_30px_rgba(0,0,0,0.5)]
            md:sticky md:top-24 md:h-[calc(100vh-96px)] md:w-64 md:translate-x-0 md:shadow-none md:z-30 md:block
            ${isVisible ? 'translate-x-0' : '-translate-x-full md:hidden'}
            overflow-y-auto p-6
        `}
      >
        
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-bold text-lg"><i className="fas fa-filter text-secondary mr-2"></i> Filtros</h3>
          <div className="flex items-center gap-4">
              <button 
                  onClick={onClearFilters}
                  className="text-xs text-secondary hover:text-white transition-colors underline decoration-secondary/30"
              >
                  Limpar
              </button>
              {/* Mobile Close Button */}
              <button 
                  onClick={onClose}
                  className="md:hidden w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                  <i className="fas fa-times"></i>
              </button>
          </div>
        </div>

        {/* 1. PREÇO */}
        <div className="mb-8">
          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Preço</h4>
          <div className="space-y-2">
              <label className="flex items-center gap-3 text-sm text-white cursor-pointer group">
                  <input 
                      type="radio" 
                      name="price"
                      checked={selectedPrice === 'all'}
                      onChange={() => onPriceChange('all')}
                      className="w-4 h-4 bg-background border border-white/20 checked:bg-primary checked:border-primary focus:ring-0 text-primary transition-all"
                  />
                  <span className="group-hover:text-primary transition-colors">Todos</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-white cursor-pointer group">
                  <input 
                      type="radio" 
                      name="price"
                      checked={selectedPrice === 'premium'}
                      onChange={() => onPriceChange('premium')}
                      className="w-4 h-4 bg-background border border-white/20 checked:bg-yellow-500 checked:border-yellow-500 focus:ring-0 text-yellow-500 transition-all"
                  />
                  <span className="group-hover:text-yellow-500 transition-colors flex items-center gap-2">
                      Premium <i className="fas fa-crown text-[10px] text-yellow-500"></i>
                  </span>
              </label>
              <label className="flex items-center gap-3 text-sm text-white cursor-pointer group">
                  <input 
                      type="radio" 
                      name="price"
                      checked={selectedPrice === 'free'}
                      onChange={() => onPriceChange('free')}
                      className="w-4 h-4 bg-background border border-white/20 checked:bg-green-500 checked:border-green-500 focus:ring-0 text-green-500 transition-all"
                  />
                  <span className="group-hover:text-green-500 transition-colors">Gratuito</span>
              </label>
          </div>
        </div>

        <div className="h-px bg-white/5 mb-6"></div>

        {/* 2. FORMATO */}
        <div className="mb-8">
          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Formato</h4>
          <div className="space-y-2">
              {['PSD', 'CANVA', 'PNG', 'JPG', 'VETOR'].map(format => (
                  <label key={format} className="flex items-center gap-3 text-sm text-white cursor-pointer group">
                      <input 
                          type="checkbox"
                          checked={selectedFormats.includes(format)}
                          onChange={() => onFormatChange(format)}
                          className="w-4 h-4 rounded bg-background border border-white/20 checked:bg-secondary checked:border-secondary focus:ring-0 text-secondary transition-all"
                      />
                      <span className="group-hover:text-secondary transition-colors">{format}</span>
                  </label>
              ))}
          </div>
        </div>

        <div className="h-px bg-white/5 mb-6"></div>

        {/* 3. ORIENTAÇÃO */}
        <div className="mb-8">
          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Orientação</h4>
          <div className="space-y-2">
              {[
                  { id: 'Portrait', label: 'Vertical', icon: 'fa-arrows-alt-v' },
                  { id: 'Landscape', label: 'Horizontal', icon: 'fa-arrows-alt-h' },
                  { id: 'Square', label: 'Quadrada', icon: 'fa-square' }
              ].map(orientation => (
                  <label key={orientation.id} className="flex items-center gap-3 text-sm text-white cursor-pointer group">
                      <input 
                          type="checkbox"
                          checked={selectedOrientations.includes(orientation.id)}
                          onChange={() => onOrientationChange(orientation.id)}
                          className="w-4 h-4 rounded bg-background border border-white/20 checked:bg-secondary checked:border-secondary focus:ring-0 text-secondary transition-all"
                      />
                      <i className={`fas ${orientation.icon} text-text-muted text-xs w-4 text-center`}></i>
                      <span className="group-hover:text-secondary transition-colors">{orientation.label}</span>
                  </label>
              ))}
          </div>
        </div>

      </aside>
    </>
  );
};
