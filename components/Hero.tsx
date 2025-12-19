
import React, { useState, useEffect, useCallback } from 'react';
import { ResourceType } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface HeroProps {
  onQuickAccess: (categoryName: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onQuickAccess }) => {
  const { banners, categories } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // If no banners (should happen rarely due to default), show nothing or skeleton
  const activeBanners = banners && banners.length > 0 ? banners : [];

  const nextSlide = useCallback(() => {
    if (activeBanners.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
  }, [activeBanners.length]);

  const prevSlide = () => {
    if (activeBanners.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  // Auto-rotate logic
  useEffect(() => {
    if (isPaused || activeBanners.length === 0) return;
    
    const timer = setInterval(() => {
      nextSlide();
    }, 5000); // 5 seconds

    return () => clearInterval(timer);
  }, [isPaused, nextSlide, activeBanners.length]);

  // Reset pause timer on interaction
  const handleManualInteraction = (action: () => void) => {
    setIsPaused(true);
    action();
    // Resume after 10 seconds of inactivity
    setTimeout(() => setIsPaused(false), 10000);
  };

  // Helper to map category names to icons dynamically
  const getCategoryIcon = (name: string) => {
      const n = name.toLowerCase();
      if (n.includes('flyer')) return 'fa-layer-group';
      if (n.includes('post') || n.includes('social') || n.includes('insta')) return 'fa-hashtag';
      if (n.includes('culto') || n.includes('santa')) return 'fa-church';
      if (n.includes('data') || n.includes('feriado') || n.includes('natal')) return 'fa-calendar-star';
      if (n.includes('convite')) return 'fa-envelope-open-text';
      if (n.includes('banner')) return 'fa-image';
      if (n.includes('asset') || n.includes('textura') || n.includes('element')) return 'fa-shapes';
      if (n.includes('yout') || n.includes('thumb') || n.includes('video')) return 'fa-video';
      if (n.includes('eb') || n.includes('escola') || n.includes('ensino')) return 'fa-book-open';
      return 'fa-folder-open'; // Default icon
  };

  // We show up to 4 quick access buttons based on available categories
  // Skipping 'Destaques' if it exists as it's the default view
  const quickAccessCategories = categories
    .filter(c => c.name !== 'Destaques')
    .slice(0, 4);

  if (activeBanners.length === 0) return null;

  return (
    <section className="relative border-b border-border bg-background group">
      
      {/* SLIDER CONTAINER - Adjusted height for mobile consistency */}
      <div className="relative h-[55vh] md:h-[500px] w-full overflow-hidden">
        
        {/* Slides */}
        {activeBanners.map((slide, index) => (
          <div 
            key={slide.id}
            className={`
              absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out
              ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}
            `}
          >
            {/* Background Image */}
            <div className="absolute inset-0 bg-black">
              <img 
                src={slide.image} 
                alt={slide.title} 
                className="w-full h-full object-cover opacity-60" 
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent"></div>
            </div>

            {/* Slide Content */}
            <div className="relative z-20 h-full max-w-7xl mx-auto px-4 md:px-6 flex flex-col justify-center items-start pb-10 md:pb-0">
              <div className="max-w-2xl animate-[fadeIn_0.8s_ease-out]">
                <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-3 md:mb-4 tracking-tight leading-tight drop-shadow-lg">
                  {slide.title}
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-text-muted mb-6 md:mb-8 leading-relaxed drop-shadow-md max-w-md md:max-w-none">
                  {slide.subtitle}
                </p>
                <button 
                  onClick={() => onQuickAccess(slide.category)}
                  className="bg-secondary text-surface hover:bg-white hover:text-primary font-bold py-2.5 px-6 md:py-3 md:px-8 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-secondary/20 flex items-center gap-2 text-sm md:text-base"
                >
                  {slide.cta} <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows - Hidden on mobile for cleaner look */}
        {activeBanners.length > 1 && (
            <>
            <button 
            onClick={() => handleManualInteraction(prevSlide)}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/30 border border-white/10 text-white hover:bg-secondary hover:text-surface transition-all items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 duration-300 active:scale-95"
            >
            <i className="fas fa-chevron-left"></i>
            </button>
            
            <button 
            onClick={() => handleManualInteraction(nextSlide)}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/30 border border-white/10 text-white hover:bg-secondary hover:text-surface transition-all items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 duration-300 active:scale-95"
            >
            <i className="fas fa-chevron-right"></i>
            </button>
            </>
        )}

        {/* Indicators / Dots */}
        {activeBanners.length > 1 && (
            <div className="absolute bottom-16 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
            {activeBanners.map((_, idx) => (
                <button
                key={idx}
                onClick={() => handleManualInteraction(() => setCurrentSlide(idx))}
                className={`
                    h-1.5 md:h-2 rounded-full transition-all duration-300
                    ${idx === currentSlide ? 'bg-secondary w-6 md:w-8' : 'bg-white/30 w-1.5 md:w-2 hover:bg-white/60'}
                `}
                ></button>
            ))}
            </div>
        )}
      </div>

      {/* Quick Access Strip */}
      <div className="bg-surface/50 border-t border-white/5 backdrop-blur-md relative z-20 -mt-10 md:-mt-16 mx-3 md:mx-auto max-w-5xl rounded-xl shadow-2xl p-2 md:p-6 transform translate-y-4 md:translate-y-8">
         <div className={`grid grid-cols-2 md:grid-cols-${Math.min(quickAccessCategories.length, 4)} gap-2 md:gap-4`}>
          {quickAccessCategories.map((cat) => (
            <button 
              key={cat.id}
              onClick={() => onQuickAccess(cat.name)}
              className="flex items-center justify-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-white/5 transition-all group active:scale-95 active:bg-white/10"
            >
              <i className={`fas ${getCategoryIcon(cat.name)} text-lg md:text-xl text-secondary group-hover:text-white transition-colors`}></i>
              <span className="font-semibold text-text-muted text-xs md:text-sm group-hover:text-white truncate">{cat.name}</span>
            </button>
          ))}
          {quickAccessCategories.length === 0 && (
             <div className="col-span-2 text-center text-text-muted text-xs">
                Adicione categorias no painel admin para ver atalhos aqui.
             </div>
          )}
        </div>
      </div>
      
      {/* Spacer */}
      <div className="h-8 md:h-12 bg-background"></div>
    </section>
  );
};
