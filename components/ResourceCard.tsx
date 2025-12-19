
import React, { useState, useEffect, useRef } from 'react';
import { DesignResource } from '../types';

interface ResourceCardProps {
  resource: DesignResource;
  onClick?: () => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onClick }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // Estado para animação de scroll
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer para efeito "Surgir ao Rolar"
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Quando o elemento entra na tela (mesmo que só um pouquinho)
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Para de observar após aparecer a primeira vez
        }
      },
      {
        threshold: 0.1, // 10% do elemento visível dispara a animação
        rootMargin: '50px' // Carrega um pouco antes de entrar na tela
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Define altura do esqueleto baseada na orientação para reduzir layout shift
  const getSkeletonHeight = () => {
      if (resource.orientation === 'Landscape') return 'min-h-[160px]';
      if (resource.orientation === 'Square') return 'aspect-square';
      return 'min-h-[300px]'; // Portrait default
  };

  return (
    <div 
      ref={cardRef}
      className={`
        group bg-surface rounded-lg border border-border hover:border-secondary/50 
        shadow-lg hover:shadow-2xl hover:shadow-secondary/5 cursor-pointer break-inside-avoid mb-4 md:mb-6 relative overflow-hidden
        transform transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
      `}
      onClick={onClick}
    >
        {/* 
            Image Container 
            - REMOVED static min-h-[200px]. 
            - Added conditional height class: Only applies min-height while loading. 
            - Once loaded, it becomes strict wrapper (h-auto) to eliminate gaps.
        */}
        <div className={`relative w-full bg-background overflow-hidden ${!isImageLoaded ? getSkeletonHeight() : ''}`}>
            <img 
                src={resource.imageUrl} 
                alt={resource.title} 
                onLoad={() => setIsImageLoaded(true)}
                className={`
                    w-full h-auto block
                    transform group-hover:scale-105 group-hover:brightness-110
                    transition-all duration-700 ease-in-out
                    ${isImageLoaded ? 'opacity-100' : 'opacity-0'}
                `}
                loading="lazy"
                width="600"
                height="800"
            />
            
            {/* Skeleton Loader enquanto imagem carrega */}
            {!isImageLoaded && (
                <div className="absolute inset-0 bg-surface animate-pulse flex items-center justify-center h-full w-full">
                    <i className="fas fa-image text-white/10 text-3xl"></i>
                </div>
            )}
            
            {/* EFEITO DE LUZ DIFUSA SOFISTICADA (Sophisticated Diffuse Light) */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out pointer-events-none">
                {/* Gradiente sutil simulando reflexo de luz vindo do topo direito */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 mix-blend-overlay"></div>
                {/* Brilho extra suave */}
                <div className="absolute inset-0 bg-white/5 mix-blend-soft-light"></div>
            </div>
            
            {/* Sombra interna sutil na base para dar profundidade sem poluir */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"></div>

            {/* Badge Premium Minimalista (Ícone de Coroa Amarelo) */}
            {resource.premium && (
                 <div className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/5 shadow-lg z-10 pointer-events-none group-hover:bg-black/60 transition-colors">
                     <i className="fas fa-crown text-yellow-500 text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"></i>
                 </div>
            )}
        </div>
    </div>
  );
};
