// components/HomePage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { CategoryNav } from '../../components/CategoryNav';
import { Hero } from '../../components/Hero';
import { ResourceCard } from '../../components/ResourceCard';
import { SkeletonCard } from '../../components/SkeletonCard';
import { Pagination } from '../../components/Pagination';
import { FilterSidebar } from '../../components/FilterSidebar';
import { ResourceType, DesignResource } from '../../types';
import { getResources } from '../../services/resourceService';

interface HomePageProps {
  activeCategory: ResourceType;
  setActiveCategory: (category: ResourceType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSidebarVisible: boolean;
  setIsSidebarVisible: (visible: boolean) => void;
  selectedFormats: string[];
  setSelectedFormats: (formats: string[]) => void;
  selectedOrientations: string[];
  setSelectedOrientations: (orientations: string[]) => void;
  selectedPrice: 'all' | 'premium' | 'free';
  setSelectedPrice: (price: 'all' | 'premium' | 'free') => void;
  sortOption: 'recent' | 'oldest' | 'popular';
  setSortOption: (option: 'recent' | 'oldest' | 'popular') => void;
  allResources: DesignResource[];
  setAllResources: (resources: DesignResource[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  gridPage: number;
  setGridPage: (page: number) => void;
  handleResourceClick: (resource: DesignResource) => void;
  handleSearch: (query: string, category: ResourceType) => void;
}

export function HomePage({
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  isSidebarVisible,
  setIsSidebarVisible,
  selectedFormats,
  setSelectedFormats,
  selectedOrientations,
  setSelectedOrientations,
  selectedPrice,
  setSelectedPrice,
  sortOption,
  setSortOption,
  allResources,
  setAllResources,
  isLoading,
  setIsLoading,
  gridPage,
  setGridPage,
  handleResourceClick,
  handleSearch
}: HomePageProps) {
  
  useEffect(() => {
    const loadResources = async () => {
      try {
        setIsLoading(true);
        const data = await getResources();
        setAllResources(data);
      } catch (e) {
        console.error('Erro ao carregar recursos', e);
      } finally {
        setIsLoading(false);
      }
    };
  
    loadResources();
  }, []);

  const setFilter = (categoryName: ResourceType) => {
    setActiveCategory(categoryName);
    const content = document.getElementById('content-area');
    if (content) {
      requestAnimationFrame(() => {
        // content.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  };

  useEffect(() => {
    setGridPage(1);
  }, [activeCategory, searchQuery, selectedFormats, selectedOrientations, selectedPrice, sortOption]);

  const filteredResources = useMemo(() => {
    let result = allResources.filter(resource => {
      if (activeCategory !== ResourceType.DESTAQUES && !resource.categories.includes(activeCategory)) {
        return false;
      }
      if (searchQuery) {
        const queryLower = searchQuery.toLowerCase();
        const titleMatch = resource.title.toLowerCase().includes(queryLower);
        const tagMatch = resource.tags.some(tag => tag.toLowerCase().includes(queryLower));
        const hiddenMatch = resource.searchTerms && resource.searchTerms.toLowerCase().includes(queryLower);
        
        if (!(titleMatch || tagMatch || hiddenMatch)) return false;
      }

      const hasActiveFilters = selectedFormats.length > 0 || selectedOrientations.length > 0 || selectedPrice !== 'all';
      
      if (hasActiveFilters) {
        if (selectedFormats.length > 0 && !selectedFormats.includes(resource.format)) return false;
        if (selectedOrientations.length > 0 && !selectedOrientations.includes(resource.orientation)) return false;
        if (selectedPrice === 'premium' && !resource.premium) return false;
        if (selectedPrice === 'free' && resource.premium) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      if (activeCategory === ResourceType.DESTAQUES) {
        const aIsFlyer = a.categories.includes(ResourceType.FLYERS);
        const bIsFlyer = b.categories.includes(ResourceType.FLYERS);
        
        if (aIsFlyer && !bIsFlyer) return -1;
        if (!aIsFlyer && bIsFlyer) return 1;
      }

      switch (sortOption) {
        case 'popular':
          return b.downloads - a.downloads;
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'recent':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

    return result;
  }, [activeCategory, searchQuery, allResources, selectedFormats, selectedOrientations, selectedPrice, sortOption]);

  const ITEMS_PER_PAGE = 24;
  const totalPages = Math.ceil(filteredResources.length / ITEMS_PER_PAGE);
  const paginatedResources = filteredResources.slice(
    (gridPage - 1) * ITEMS_PER_PAGE,
    gridPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setGridPage(page);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleClearFilters = () => {
    setSelectedFormats([]);
    setSelectedOrientations([]);
    setSelectedPrice('all');
    setIsSidebarVisible(false);
    setSearchQuery('');
  };

  const handleFormatChange = (format: string) => {
    setSelectedFormats(prev => 
      prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]
    );
  };

  const handleOrientationChange = (orientation: string) => {
    setSelectedOrientations(prev => 
      prev.includes(orientation) ? prev.filter(o => o !== orientation) : [...prev, orientation]
    );
  };

  const handlePriceChange = (price: 'all' | 'premium' | 'free') => {
    setSelectedPrice(price);
  };

  return (
    <>
      <CategoryNav activeCategory={activeCategory} onSelectCategory={setFilter} />

      {activeCategory === ResourceType.DESTAQUES && !searchQuery && (
        <Hero onQuickAccess={setFilter} />
      )}

      <div className="flex flex-col md:flex-row container mx-auto px-3 md:px-4 max-w-7xl pt-6 md:pt-12 pb-8 md:pb-12 gap-5 md:gap-8">
        
        <FilterSidebar 
          isVisible={isSidebarVisible}
          selectedFormats={selectedFormats}
          selectedOrientations={selectedOrientations}
          selectedPrice={selectedPrice}
          onFormatChange={handleFormatChange}
          onOrientationChange={handleOrientationChange}
          onPriceChange={handlePriceChange}
          onClearFilters={handleClearFilters}
          onClose={() => setIsSidebarVisible(false)} 
        />

        <main id="content-area" className="flex-1">
          <div className="flex flex-col gap-4 mb-6 md:mb-8 border-b border-border pb-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  {searchQuery ? `Resultados para "${searchQuery}"` : activeCategory}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsSidebarVisible(true)}
                  className="md:hidden flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-secondary hover:bg-white/10 hover:text-white transition-colors"
                >
                  <i className="fas fa-filter"></i> Filtros
                </button>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <i className="fas fa-sort-amount-down text-text-muted text-xs"></i>
                  </div>
                  <select 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as 'recent' | 'oldest' | 'popular')}
                    className="bg-surface border border-white/10 text-white text-xs sm:text-sm rounded-lg pl-8 pr-8 py-2 outline-none focus:border-secondary appearance-none cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <option value="recent">Mais Recentes</option>
                    <option value="popular">Mais Populares</option>
                    <option value="oldest">Mais Antigas</option>
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <i className="fas fa-chevron-down text-text-muted text-[10px]"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="main-grid px-0">
              {Array.from({ length: 8 }).map((_, idx) => (
                <SkeletonCard key={idx} />
              ))}
            </div>
          ) : paginatedResources.length > 0 ? (
            <>
              <div className="main-grid px-0">
                {paginatedResources.map(resource => (
                  <ResourceCard 
                    key={resource.id} 
                    resource={resource} 
                    onClick={() => handleResourceClick(resource)}
                  />
                ))}
              </div>
              
              <Pagination 
                currentPage={gridPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            </>
          ) : (
            <div className="text-center py-12 md:py-20 bg-surface rounded-xl border border-border border-dashed animate-[fadeIn_0.5s_ease-out]">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted text-3xl border border-border">
                <i className="fas fa-search"></i>
              </div>
              <h3 className="text-xl font-bold text-text-main mb-2">Nenhuma arte encontrada</h3>
              <p className="text-text-muted">Tente ajustar seus filtros ou buscar por outros termos.</p>
              <button 
                onClick={() => { 
                  setSearchQuery(''); 
                  setActiveCategory(ResourceType.DESTAQUES); 
                  handleClearFilters(); 
                }}
                className="mt-6 text-secondary font-semibold hover:text-white transition-colors"
              >
                Limpar Filtros e Busca
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}