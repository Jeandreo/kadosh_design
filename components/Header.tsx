
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';

interface HeaderProps {
  currentCategory: string;
  onSearch: (query: string, category: string) => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onNavigate: (page: string) => void;
  onSelectCategory: (cat: string) => void;
}

const SearchBar = ({ 
  searchInput, 
  setSearchInput, 
  searchFilter, 
  setSearchFilter, 
  handleSearch, 
  categories
}: {
  searchInput: string;
  setSearchInput: (v: string) => void;
  searchFilter: string;
  setSearchFilter: (t: string) => void;
  handleSearch: () => void;
  categories: any[];
}) => (
    <div className="flex items-center rounded-full bg-[rgba(255,255,255,0.05)] border border-white/5 focus-within:bg-[rgba(24,26,27,0.95)] focus-within:border-white/20 focus-within:shadow-xl transition-all w-full h-10 md:h-11 px-2 group hover:border-white/10 duration-300">
      
      <select 
        value={searchFilter}
        onChange={(e) => setSearchFilter(e.target.value)}
        className="bg-transparent border-none text-text-muted text-xs hover:text-white cursor-pointer transition-colors max-w-[90px] md:max-w-[120px] truncate outline-none pl-2 md:pl-3 font-normal"
      >
        {categories.map((cat) => (
          <option key={cat.id} value={cat.name} className="bg-surface text-white">{cat.name}</option>
        ))}
      </select>
      
      <div className="h-4 w-px bg-white/10 mx-2"></div>

      <div className="flex-1 relative h-full">
        <input 
          type="text" 
          placeholder="Busque por temas..."
          className="w-full h-full bg-transparent outline-none text-text-main placeholder-text-muted/60 text-xs md:text-sm font-light focus:text-white"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>
      
      <button 
        onClick={handleSearch}
        className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-text-muted hover:text-white transition-all rounded-full hover:bg-white/5 active:scale-95"
        title="Buscar"
      >
        <i className="fas fa-search text-xs md:text-sm"></i>
      </button>
    </div>
);

export const Header: React.FC<HeaderProps> = ({ 
    currentCategory, 
    onSearch, 
    onLoginClick, 
    onSignupClick, 
    onNavigate,
    onSelectCategory
}) => {
  const { user, logout, unreadCount, categories } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [searchFilter, setSearchFilter] = useState<string>('Destaques');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchFilter(currentCategory);
  }, [currentCategory]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isDrawerOpen]);

  // Header.tsx - Corrija a função handleSearch
  const handleSearch = async () => {
    onSearch(searchInput, searchFilter);
  };

  const handleLogoClick = () => {
    onNavigate('/');
    setSearchInput('');
    setIsDrawerOpen(false);
    // onSearch('', 'Destaques');
    // setSearchFilter('Destaques');
  };

  const handleCategoryClick = (category: string) => {
    onSelectCategory(category);
    setIsDrawerOpen(false);
  }

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    onNavigate('/');
  }

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-[12px] bg-[rgba(24,26,27,0.85)] shadow-[0_4px_30px_rgba(0,0,0,0.1)] border-b border-white/5 h-auto md:h-24 transition-all">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-full flex flex-col md:justify-center">
          
          <div className="flex items-center justify-between gap-4 md:gap-8 h-16 md:h-full">
            
            <div className="flex items-center gap-3 md:gap-4">
               <button 
                  onClick={() => setIsDrawerOpen(true)}
                  className="md:hidden text-text-muted hover:text-white transition-colors w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/5 active:scale-95 active:bg-white/10"
               >
                  <i className="fas fa-bars text-lg"></i>
               </button>

               <div className="flex flex-col cursor-pointer shrink-0 group items-start active:scale-95 transition-transform" onClick={handleLogoClick}>
                  <div className="flex items-baseline gap-1 text-white font-sans text-xl md:text-2xl">
                    <span className="font-bold tracking-tight group-hover:text-white/90">KADOSH</span>
                    <span className="text-secondary font-light tracking-wide group-hover:text-white transition-colors">DESIGN</span>
                  </div>
                  <span className="text-[10px] text-secondary/60 tracking-[0.2em] uppercase pl-0.5 group-hover:text-secondary transition-colors hidden sm:block">Artes para o Reino</span>
               </div>
            </div>

            <div className="hidden md:block flex-1 max-w-2xl">
              <SearchBar 
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                searchFilter={searchFilter}
                setSearchFilter={setSearchFilter}
                handleSearch={handleSearch}
                categories={categories}
              />
            </div>

            <div className="flex items-center gap-3 sm:gap-5 shrink-0">
              {user ? (
                  <div className="flex items-center gap-2 sm:gap-4">
                      {/* Notification Bell */}
                      <div className="relative" ref={notificationRef}>
                          <button 
                             onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                             className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full hover:bg-white/5 text-text-muted hover:text-white transition-colors relative active:scale-95"
                          >
                             <i className="far fa-bell text-lg"></i>
                             {unreadCount > 0 && (
                                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#181A1B]"></span>
                             )}
                          </button>
                          
                          <NotificationDropdown 
                             isOpen={isNotificationOpen} 
                             onClose={() => setIsNotificationOpen(false)} 
                          />
                      </div>

                      {/* Profile Menu */}
                      <div className="relative" ref={profileMenuRef}>
                          <button 
                              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                              className="flex items-center gap-3 text-white group active:scale-95 transition-transform"
                          >
                              <span className="hidden lg:block text-xs font-medium text-text-muted group-hover:text-white transition-colors">
                                  {user.name.split(' ')[0]}
                              </span>
                              <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-[#333] to-[#222] rounded-full flex items-center justify-center shadow-md border border-white/10 group-hover:border-secondary/50 transition-all overflow-hidden">
                                  <img 
                                    src={`https://ui-avatars.com/api/?name=${user.name}&background=random&color=fff&size=64`} 
                                    alt={user.name} 
                                    className="w-full h-full object-cover"
                                  />
                              </div>
                          </button>

                          {isProfileMenuOpen && (
                              <div className="absolute right-0 top-full mt-3 w-64 bg-[#202324] border border-white/5 rounded-xl shadow-2xl py-2 animate-[fadeIn_0.1s_ease-out] backdrop-blur-xl">
                                  <div className="px-4 py-3 border-b border-white/5 mb-2">
                                      <p className="text-white text-sm font-bold truncate">{user.name}</p>
                                      <p className="text-xs text-text-muted truncate mb-3">{user.email}</p>
                                      
                                      <div className="flex items-center justify-between gap-2">
                                          <span className="inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20 truncate">
                                              {user.plan === 'free' ? 'Plano Grátis' : user.plan === 'ministry' ? 'Ministério' : 'Premium'}
                                          </span>
                                          <div className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded border border-white/10 text-[10px] whitespace-nowrap" title="Cota diária de downloads">
                                              <i className="fas fa-cloud-download-alt text-text-muted"></i>
                                              <span className={`font-bold ${user.quotaUsed >= user.quotaTotal ? 'text-red-400' : 'text-white'}`}>
                                                  {user.quotaUsed}/{user.quotaTotal}
                                              </span>
                                          </div>
                                      </div>
                                  </div>
                                  {user.role === 'admin' && (
                                    <button onClick={() => { onNavigate('admin'); setIsProfileMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-text-muted hover:bg-white/5 hover:text-white transition-colors">
                                        <i className="fas fa-tachometer-alt w-5 text-center mr-2 text-green-400"></i> Painel Admin
                                    </button>
                                  )}
                                  <button onClick={() => { onNavigate('dashboard'); setIsProfileMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-text-muted hover:bg-white/5 hover:text-white transition-colors">
                                      <i className="far fa-user-circle w-5 text-center mr-2"></i> Perfil / Dashboard
                                  </button>
                                  <button onClick={() => { onNavigate('planos'); setIsProfileMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-text-muted hover:bg-white/5 hover:text-white transition-colors">
                                      <i className="fas fa-crown w-5 text-center mr-2 text-yellow-500/80"></i> Assinaturas
                                  </button>
                                  <div className="h-px bg-white/5 my-2"></div>
                                  <button 
                                      onClick={handleLogout}
                                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                  >
                                      <i className="fas fa-sign-out-alt w-5 text-center mr-2"></i> Sair
                                  </button>
                              </div>
                          )}
                      </div>
                  </div>
              ) : (
                  <>
                      <button 
                        onClick={() => onNavigate('planos')}
                        className="hidden lg:block text-text-muted hover:text-white font-normal text-[13px] transition-colors"
                      >
                        Planos
                      </button>
                      
                      <div className="hidden lg:block w-px h-4 bg-white/10"></div>

                      <button 
                        onClick={onSignupClick}
                        className="hidden sm:block text-text-muted hover:text-white px-4 md:px-5 py-1.5 md:py-2 rounded-full font-medium text-[12px] md:text-[13px] border border-white/10 hover:border-white/30 transition-all hover:bg-white/5 active:scale-95"
                      >
                        Cadastre-se
                      </button>
                      <button 
                        onClick={onLoginClick}
                        className="bg-primary/90 hover:bg-primary text-white px-5 md:px-6 py-1.5 md:py-2 rounded-full font-medium text-[12px] md:text-[13px] shadow-[0_4px_15px_rgba(87,96,99,0.2)] hover:shadow-[0_6px_20px_rgba(87,96,99,0.3)] transition-all transform hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
                      >
                        Entrar
                      </button>
                  </>
              )}
            </div>
          </div>

          <div className="md:hidden pb-3">
            <SearchBar 
              searchInput={searchInput}
              setSearchInput={setSearchInput}
              searchFilter={searchFilter}
              setSearchFilter={setSearchFilter}
              handleSearch={handleSearch}
              categories={categories}
            />
          </div>
        </div>
      </header>

      <div className={`fixed inset-0 z-[2000] md:hidden ${isDrawerOpen ? 'visible' : 'invisible'}`}>
          <div 
             className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0'}`}
             onClick={() => setIsDrawerOpen(false)}
          ></div>

          <div 
             className={`
                absolute top-0 left-0 h-full w-[85%] max-w-[320px] 
                bg-[#181A1B]/98 backdrop-blur-xl border-r border-white/5 shadow-[20px_0_50px_rgba(0,0,0,0.5)]
                flex flex-col transition-transform duration-300 ease-in-out
                ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}
             `}
          >
              <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
                  <div className="flex flex-col" onClick={handleLogoClick}>
                      <div className="flex items-baseline gap-1 text-white font-sans text-xl">
                        <span className="font-bold tracking-tight">KADOSH</span>
                        <span className="text-secondary font-light tracking-wide">DESIGN</span>
                      </div>
                  </div>
                  <button 
                     onClick={() => setIsDrawerOpen(false)}
                     className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-text-muted hover:text-white hover:bg-white/10 transition-colors active:scale-95"
                  >
                      <i className="fas fa-times text-lg"></i>
                  </button>
              </div>

              <div className="flex-1 overflow-y-auto py-8 px-6">
                 <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-6">Categorias</h3>
                 <nav className="flex flex-col gap-2">
                    {categories.map((category) => (
                        <button 
                           key={category.id}
                           onClick={() => handleCategoryClick(category.name)}
                           className={`
                              w-full text-left py-3 px-4 rounded-xl text-base transition-colors flex items-center justify-between group active:scale-[0.98]
                              ${currentCategory === category.name ? 'bg-white/10 text-white font-bold' : 'text-text-muted hover:text-white hover:bg-white/5'}
                           `}
                        >
                           {category.name}
                           <i className={`fas fa-chevron-right text-xs opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300`}></i>
                        </button>
                    ))}
                 </nav>
                 
                 <div className="my-8 border-t border-white/5"></div>
                 
                 <nav className="flex flex-col gap-2">
                     <button onClick={() => { onNavigate('planos'); setIsDrawerOpen(false); }} className="text-left py-2 text-text-muted hover:text-white active:translate-x-1 transition-transform">Planos</button>
                     <button onClick={() => { onNavigate('sobre'); setIsDrawerOpen(false); }} className="text-left py-2 text-text-muted hover:text-white active:translate-x-1 transition-transform">Sobre Nós</button>
                     <button onClick={() => { onNavigate('contato'); setIsDrawerOpen(false); }} className="text-left py-2 text-text-muted hover:text-white active:translate-x-1 transition-transform">Contato</button>
                 </nav>
              </div>

              <div className="p-6 border-t border-white/5 bg-black/20 shrink-0 safe-area-bottom">
                  {!user ? (
                      <div className="grid grid-cols-2 gap-4">
                          <button 
                             onClick={() => { onLoginClick(); setIsDrawerOpen(false); }}
                             className="w-full py-3 rounded-lg border border-white/10 text-white font-medium hover:bg-white/5 transition-colors active:scale-95 text-sm"
                          >
                             Entrar
                          </button>
                          <button 
                             onClick={() => { onSignupClick(); setIsDrawerOpen(false); }}
                             className="w-full py-3 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/20 active:scale-95 text-sm"
                          >
                             Assinar
                          </button>
                      </div>
                  ) : (
                      <button 
                         onClick={() => { onNavigate('dashboard'); setIsDrawerOpen(false); }}
                         className="w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium flex items-center justify-center gap-3 border border-white/5 active:scale-95"
                      >
                         <i className="fas fa-user-circle"></i> Minha Conta
                      </button>
                  )}
              </div>
          </div>
      </div>
    </>
  );
};
