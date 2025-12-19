
import React from 'react';

interface NotFoundProps {
  onNavigateHome: () => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onNavigateHome }) => {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[70vh] p-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="text-center max-w-lg">
        <h1 className="text-9xl font-extrabold text-[#202324] select-none relative">
            404
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl text-white font-sans tracking-widest">
                KADOSH
            </span>
        </h1>
        
        <h2 className="text-2xl font-bold text-white mt-4 mb-2">Página não encontrada</h2>
        <p className="text-[#9AA0A6] mb-8">
            Parece que a arte que você procura não está neste reino digital. Verifique o endereço ou volte para a galeria.
        </p>

        <button 
            onClick={onNavigateHome}
            className="bg-[#576063] hover:bg-white hover:text-[#181A1B] text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg hover:shadow-white/10 flex items-center gap-2 mx-auto"
        >
            <i className="fas fa-arrow-left"></i> Voltar para Home
        </button>
      </div>
    </div>
  );
};
