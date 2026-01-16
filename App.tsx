// App.tsx (versão simplificada)
import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAuth } from './contexts/AuthContext';
import { HomePage } from './backend/pages/HomePage';
import { ResourceType, DesignResource, Plan } from './types';
import './styles/admin.css';

// Componentes lazy
const Pricing = lazy(() => import('./components/Pricing').then(m => ({ default: m.Pricing })));
const About = lazy(() => import('./components/About').then(m => ({ default: m.About })));
const Contact = lazy(() => import('./components/Contact').then(m => ({ default: m.Contact })));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const UserDashboard = lazy(() => import('./components/UserDashboard').then(m => ({ default: m.UserDashboard })));
const Terms = lazy(() => import('./components/Terms').then(m => ({ default: m.Terms })));
const CheckoutModal = lazy(() => import('./components/CheckoutModal').then(m => ({ default: m.CheckoutModal })));
const AuthModal = lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const ProductModal = lazy(() => import('./components/ProductModal').then(m => ({ default: m.ProductModal })));
const NotFound = lazy(() => import('./components/NotFound').then(m => ({ default: m.NotFound })));

const LoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-white/10 border-t-secondary rounded-full animate-spin"></div>
      <p className="text-text-muted text-sm">Carregando...</p>
    </div>
  </div>
);

function App() {
  const { user } = useAuth();

  // Estados que pertencem à Home
  const [activeCategory, setActiveCategory] = useState<ResourceType>(ResourceType.DESTAQUES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedOrientations, setSelectedOrientations] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<'all' | 'premium' | 'free'>('all');
  const [sortOption, setSortOption] = useState<'recent' | 'oldest' | 'popular'>('recent');
  const [allResources, setAllResources] = useState<DesignResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gridPage, setGridPage] = useState(1);

  // Estados globais
  const [selectedResource, setSelectedResource] = useState<DesignResource | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const handleResourceClick = (resource: DesignResource) => {
    setSelectedResource(resource);
  };

  const handleSearch = (query: string, category: ResourceType) => {
    setSearchQuery(query);
    setActiveCategory(category);
    const content = document.getElementById('content-area');
    // if (content) content.scrollIntoView({ behavior: 'smooth' });
    if (query && query.trim().length > 0) {
      setIsSidebarVisible(true);
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
  };

  const handleOpenCheckout = (plan: Plan) => {
    if (!user) {
      setAuthModalMode('signup');
      setIsAuthModalOpen(true);
    } else {
      setSelectedPlan(plan);
      setIsCheckoutModalOpen(true);
    }
  };

  const handleNavigate = (path: string) => {
    window.location.href = path; // Ou use useNavigate do React Router
  };

  return (
    <Router>
      <ErrorBoundary>
        <div className="min-h-screen bg-background flex flex-col font-sans text-text-main relative">
          <Header 
            currentCategory={activeCategory} 
            onSearch={handleSearch}
            onLoginClick={handleLoginClick}
            onSignupClick={handleSignupClick}
            onNavigate={handleNavigate}
            onSelectCategory={setActiveCategory}
          />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={
                <HomePage
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  isSidebarVisible={isSidebarVisible}
                  setIsSidebarVisible={setIsSidebarVisible}
                  selectedFormats={selectedFormats}
                  setSelectedFormats={setSelectedFormats}
                  selectedOrientations={selectedOrientations}
                  setSelectedOrientations={setSelectedOrientations}
                  selectedPrice={selectedPrice}
                  setSelectedPrice={setSelectedPrice}
                  sortOption={sortOption}
                  setSortOption={setSortOption}
                  allResources={allResources}
                  setAllResources={setAllResources}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  gridPage={gridPage}
                  setGridPage={setGridPage}
                  handleResourceClick={handleResourceClick}
                  handleSearch={handleSearch}
                />
              } />
              
              <Route path="/planos" element={
                <Suspense fallback={<LoadingFallback />}>
                  <Pricing onCheckout={handleOpenCheckout} />
                </Suspense>
              } />
              
              <Route path="/sobre" element={
                <Suspense fallback={<LoadingFallback />}>
                  <About />
                </Suspense>
              } />
              
              <Route path="/contato" element={
                <Suspense fallback={<LoadingFallback />}>
                  <Contact />
                </Suspense>
              } />
              
              <Route path="/termos" element={
                <Suspense fallback={<LoadingFallback />}>
                  <Terms />
                </Suspense>
              } />
              
              <Route path="/admin" element={
                user?.role === 'admin' ? (
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminDashboard />
                  </Suspense>
                ) : (
                  <div>Sem permissão</div>
                )
              } />
              
              <Route path="/dashboard" element={
                user ? (
                  <Suspense fallback={<LoadingFallback />}>
                    <UserDashboard />
                  </Suspense>
                ) : (
                  <div>Faça login primeiro</div>
                )
              } />
              
              <Route path="*" element={
                <Suspense fallback={<LoadingFallback />}>
                  <NotFound />
                </Suspense>
              } />
            </Routes>
          </main>

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
              plan={selectedPlan}
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
    </Router>
  );
}

export default App;