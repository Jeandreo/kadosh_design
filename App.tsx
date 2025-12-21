
import React, { useState, useMemo, useEffect, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { Hero } from './components/Hero';
import { ResourceCard } from './components/ResourceCard';
import { SkeletonCard } from './components/SkeletonCard';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { Pagination } from './components/Pagination';
import { FilterSidebar } from './components/FilterSidebar';
import { ResourceType, DesignResource } from './types';
import { useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getResources } from './services/resourceService';
import './styles/admin.css';


const Pricing         = lazy(() => import('./components/Pricing').then(module => ({ default: module.Pricing })));
const About           = lazy(() => import('./components/About').then(module => ({ default: module.About })));
const Contact         = lazy(() => import('./components/Contact').then(module => ({ default: module.Contact })));
const AdminDashboard  = lazy(() => import('./components/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const UserDashboard   = lazy(() => import('./components/UserDashboard').then(module => ({ default: module.UserDashboard })));
const Terms           = lazy(() => import('./components/Terms').then(module => ({ default: module.Terms })));
const CheckoutModal   = lazy(() => import('./components/CheckoutModal').then(module => ({ default: module.CheckoutModal })));
const AuthModal       = lazy(() => import('./components/AuthModal').then(module => ({ default: module.AuthModal })));
const ProductModal    = lazy(() => import('./components/ProductModal').then(module => ({ default: module.ProductModal }))); 
const NotFound        = lazy(() => import('./components/NotFound').then(module => ({ default: module.NotFound })));

type Page = 'home' | 'pricing' | 'about' | 'contact' | 'admin' | 'user-dashboard' | 'terms' | '404';
type SortOption = 'recent' | 'oldest' | 'popular';

const ITEMS_PER_PAGE = 24;

const LoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center min-h-[60vh] animate-[fadeIn_0.2s_ease-out]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-white/10 border-t-secondary rounded-full animate-spin"></div>
      <p className="text-text-muted text-sm font-medium tracking-wide animate-pulse">Carregando...</p>
    </div>
  </div>
);

function App() {
  const { user } = useAuth(); 

  const [currentPageState, setCurrentPageState] = useState<Page>(() => {
    const savedPage = localStorage.getItem('lastPage');
    if (savedPage === 'details') return 'home';
    return (savedPage as Page) || 'home';
  });

  const [activeCategory, setActiveCategory] = useState<ResourceType>(ResourceType.DESTAQUES);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedOrientations, setSelectedOrientations] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<'all' | 'premium' | 'free'>('all');
  
  const [sortOption, setSortOption] = useState<SortOption>('recent');

  const [allResources, setAllResources] = useState<DesignResource[]>([]);

  const [selectedResource, setSelectedResource] = useState<DesignResource | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  
  const [gridPage, setGridPage] = useState(1);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  useEffect(() => {
    const loadResources = async () => {
      try {
        setIsLoading(true);
        const data = await getResources(); // BACKEND REAL
        setAllResources(data);
      } catch (e) {
        console.error('Erro ao carregar recursos', e);
      } finally {
        setIsLoading(false);
      }
    };
  
    loadResources();
  }, []);

  useEffect(() => {
    localStorage.setItem('lastPage', currentPageState);
  }, [currentPageState]);

  useEffect(() => {
    const baseTitle = "Kadosh Design";
    switch(currentPageState) {
        case 'home': document.title = `${baseTitle} | Biblioteca Digital de Artes Cristãs`; break;
        case 'pricing': document.title = `${baseTitle} | Planos e Assinaturas`; break;
        case 'about': document.title = `${baseTitle} | Sobre Nós`; break;
        case 'contact': document.title = `${baseTitle} | Fale Conosco`; break;
        case 'terms': document.title = `${baseTitle} | Termos de Uso`; break;
        case 'user-dashboard': document.title = `${baseTitle} | Área do Membro`; break;
        case 'admin': document.title = `${baseTitle} | Painel Administrativo`; break;
        case '404': document.title = `Página não encontrada | ${baseTitle}`; break;
        default: document.title = baseTitle;
    }
  }, [currentPageState]);

  const setFilter = (categoryName: ResourceType) => {
    setActiveCategory(categoryName);
    if (currentPageState !== 'home') setCurrentPageState('home');
    const content = document.getElementById('content-area');
    if (content) {
      requestAnimationFrame(() => {
          content.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  };

  useEffect(() => {
    setGridPage(1);
  }, [activeCategory, searchQuery, selectedFormats, selectedOrientations, selectedPrice, sortOption]);

  const handleNavigate = (page: string) => {
    setCurrentPageState(page as Page);
    window.scrollTo(0, 0);
    
    if (page === 'home') {
      getResources().then(setAllResources);
    }
  };

  const handleLoginClick = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const handleSignupClick = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
      setIsAuthModalOpen(false);
      if (user?.role === 'admin') {
         handleNavigate('admin');
      } else {
         handleNavigate('home'); 
      }
  };

  const handleResourceClick = (resource: DesignResource) => {
    setSelectedResource(resource);
  };

  const handleOpenCheckout = () => {
    if (!user) {
        setAuthModalMode('signup');
        setIsAuthModalOpen(true);
    } else {
        setIsCheckoutModalOpen(true); 
    }
  };

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

  const handleSearch = (query: string, category: ResourceType) => {
    setSearchQuery(query);
    setActiveCategory(category); 
    
    if (currentPageState !== 'home') setCurrentPageState('home');
    const content = document.getElementById('content-area');
    if (content) content.scrollIntoView({ behavior: 'smooth' });

    if (query && query.trim().length > 0) {
      setIsSidebarVisible(true);
    }
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

  if (currentPageState === 'admin') {
      return (
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
           <AdminDashboard />
           <div className="fixed bottom-4 right-4 z-50">
               <button onClick={() => handleNavigate('home')} className="bg-surface border border-border text-white px-4 py-2 rounded shadow-lg text-xs">
                   Voltar ao Site
               </button>
           </div>
          </Suspense>
        </ErrorBoundary>
      );
  }

  if (currentPageState === 'user-dashboard') {
    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <UserDashboard onNavigate={handleNavigate} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background flex flex-col font-sans text-text-main relative">
        <Header 
          currentCategory={activeCategory} 
          onSearch={handleSearch}
          onLoginClick={handleLoginClick}
          onSignupClick={handleSignupClick}
          onNavigate={handleNavigate}
          onSelectCategory={setFilter}
        />
        
        {currentPageState === 'home' && (
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
                                    onChange={(e) => setSortOption(e.target.value as SortOption)}
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
                              onClick={() => { setSearchQuery(''); setActiveCategory(ResourceType.DESTAQUES); handleClearFilters(); }}
                              className="mt-6 text-secondary font-semibold hover:text-white transition-colors"
                          >
                              Limpar Filtros e Busca
                          </button>
                      </div>
                  )}
                </main>
            </div>
          </>
        )}

        {currentPageState === 'pricing' && (
          <Suspense fallback={<LoadingFallback />}>
            <main className="flex-1">
              <Pricing onCheckout={handleOpenCheckout} />
            </main>
          </Suspense>
        )}

        {currentPageState === 'about' && (
          <Suspense fallback={<LoadingFallback />}>
            <main className="flex-1">
              <About />
            </main>
          </Suspense>
        )}

        {currentPageState === 'contact' && (
          <Suspense fallback={<LoadingFallback />}>
            <main className="flex-1">
              <Contact />
            </main>
          </Suspense>
        )}

        {currentPageState === 'terms' && (
          <Suspense fallback={<LoadingFallback />}>
            <main className="flex-1">
              <Terms />
            </main>
          </Suspense>
        )}

        {currentPageState === '404' && (
            <Suspense fallback={<LoadingFallback />}>
                <NotFound onNavigateHome={() => handleNavigate('home')} />
            </Suspense>
        )}

        <Footer onNavigate={handleNavigate} />
        <ScrollToTop />

        <Suspense fallback={null}>
          <AuthModal 
            isOpen={isAuthModalOpen} 
            initialMode={authModalMode}
            onClose={() => setIsAuthModalOpen(false)}
            onSuccess={handleAuthSuccess}
          />
        </Suspense>

        <Suspense fallback={null}>
          <CheckoutModal 
            isOpen={isCheckoutModalOpen}
            onClose={() => setIsCheckoutModalOpen(false)}
            onNavigate={handleNavigate}
          />
        </Suspense>

        <Suspense fallback={null}>
            <ProductModal 
                resource={selectedResource}
                onClose={() => setSelectedResource(null)}
                onCheckout={handleOpenCheckout}
            />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

export default App;
