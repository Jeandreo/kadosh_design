
import React, { useState, useEffect } from 'react';
import { Toast } from './Toast';
import { useAuth } from '../contexts/AuthContext';
import { getResources } from '../services/resourceService';
import { DesignResource } from '../types';
import { getMyDownloadsRequest } from '../services/downloadService';
import { CONFIG } from '../config';

interface UserDashboardProps {
  onNavigate: (page: string) => void;
}

type Tab = 'overview' | 'subscription' | 'history' | 'settings' | 'favorites';

export const UserDashboard: React.FC<UserDashboardProps> = ({ onNavigate }) => {
  const { user, logout, cancelSubscription, updateProfile, registerDownload } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [downloadsHistory, setDownloadsHistory] = useState<{ resourceId: string; downloadedAt: string }[]>([]);
  const [favoritesList, setFavoritesList] = useState<DesignResource[]>([]);
  const [allResources, setAllResources] = useState<DesignResource[]>([]);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
  
    const token = localStorage.getItem('auth_token');
    if (!token) return;
  
    getMyDownloadsRequest(token)
      .then(setDownloadsHistory)
      .catch(err => {
        console.error(err);
      });
  }, [user]);
  
  

  useEffect(() => {
      const loadRes = async () => {
          const res = await getResources();
          setAllResources(res);
      };
      loadRes();
  }, []);

  useEffect(() => {
      if (activeTab === 'favorites' && user?.favorites && allResources.length > 0) {
          const favs = allResources.filter(r => user.favorites.includes(r.id));
          setFavoritesList(favs);
      }
      if (activeTab === 'settings' && user) {
          setEditName(user.name);
          setEditEmail(user.email);
      }
  }, [activeTab, user, allResources]);

  useEffect(() => {
      // Bloqueia scroll quando menu mobile está aberto
      if (isMobileMenuOpen) {
          document.body.style.overflow = 'hidden';
      } else {
          document.body.style.overflow = 'auto';
      }
      return () => { document.body.style.overflow = 'auto'; };
  }, [isMobileMenuOpen]);

  if (!user) return null;

  const getPlanName = (p: string) => {
      switch(p) {
          case 'free': return 'Visitante (Sem Plano)';
          case 'volunteer': return 'Voluntário';
          case 'ministry': return 'Ministério';
          case 'premium_annual': return 'Kadosh Design Premium';
          default: return p;
      }
  };

  const getPlanPrice = (p: string) => {
      switch(p) {
          case 'free': return '0,00';
          case 'volunteer': return '29,90';
          case 'ministry': return '49,90';
          case 'premium_annual': return '299,99';
          default: return '0,00';
      }
  };

  const menuItems: { id: Tab; label: string; icon: string }[] = [
      { id: 'overview', label: 'Visão Geral', icon: 'fa-chart-pie' },
      { id: 'favorites', label: 'Favoritos', icon: 'fa-heart' },
      { id: 'subscription', label: 'Assinatura', icon: 'fa-crown' },
      { id: 'history', label: 'Histórico', icon: 'fa-history' },
      { id: 'settings', label: 'Configurações', icon: 'fa-cog' },
  ];

  const isPremium = user.plan !== 'free';

  const handleCancelSubscription = async () => {
      await cancelSubscription();
      setToastMessage("Sua renovação automática foi cancelada. Seu plano continua ativo até o fim do período.");
      setToastType('info');
      setShowToast(true);
      setIsCancelModalOpen(false);
  };

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      setIsSaving(true);
      await updateProfile(editName, editEmail);
  
      setToastMessage("Dados atualizados com sucesso!");
      setToastType('success');
    } catch (err: any) {
      setToastMessage(err.message || 'Erro ao atualizar perfil');
      setToastType('error');
    } finally {
      setIsSaving(false);
      setShowToast(true);
    }
  };
  

  const handleRedownload = async (resourceId: string, title: string) => {
      const result = await registerDownload(resourceId);

      if (!result.success) {
          setToastMessage(result.message);
          setToastType('error');
          setShowToast(true);
          return;
      }

      if (result.message) {
          setToastMessage(result.message);
          setToastType(result.message.includes('Limite') ? 'error' : 'success');
          setShowToast(true);
      }
      
      const resource = allResources.find(r => r.id === resourceId);
      
      const link = document.createElement("a");
      if (resource && resource.downloadUrl) {
          link.href = resource.downloadUrl;
          link.setAttribute('download', '');
          link.target = "_blank";
      } else {
          const content = `Download Kadosh Design\nArquivo: ${title}\nData: ${new Date().toLocaleString()}`;
          link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
      }
      
      link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

    // Process History: Link IDs to Resource Data
    const historyItems = downloadsHistory.map(item => {
        const res = allResources.find(r => r.id === item.resourceId);
        return {
        resourceId: item.resourceId,
        title: res ? res.title : 'Recurso Removido',
        thumb: res ? res.imageUrl : 'https://via.placeholder.com/50',
        format: res ? res.format : 'UNK',
        formattedDate: new Date(item.downloadedAt).toLocaleString('pt-BR'),
        };
    });
  

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-white mb-2">Olá, {user.name.split(' ')[0]}.</h2>
              <p className="text-text-muted">
                  {isPremium 
                    ? "A paz do Senhor. Aqui está o resumo da sua assinatura." 
                    : "Você ainda não faz parte do clube. Assine para desbloquear recursos."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className={`backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden ${isPremium ? 'bg-surface/50' : 'bg-surface/20'}`}>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <i className={`fas ${isPremium ? 'fa-crown text-primary' : 'fa-user text-text-muted'} text-6xl`}></i>
                </div>
                <h3 className="text-text-muted text-xs font-bold uppercase tracking-wider mb-4">Status da Conta</h3>
                <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xl md:text-2xl font-bold truncate ${isPremium ? 'text-white' : 'text-text-muted'}`}>
                        {getPlanName(user.plan)}
                    </span>
                    {user.autoRenew === false && isPremium ? (
                        <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/20">Cancelado</span>
                    ) : isPremium ? (
                         <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded border border-green-500/20">Ativo</span>
                    ) : null}
                </div>
                <p className="text-xs text-text-muted">
                    {user.autoRenew === false ? `Acesso até ${user.renewalDate}` : (isPremium ? "Renovação automática." : "Junte-se à equipe Kadosh.")}
                </p>
              </div>

              <div className="bg-surface/50 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                <h3 className="text-text-muted text-xs font-bold uppercase tracking-wider mb-4">Cota Diária</h3>
                <div className="flex justify-between items-end mb-2">
                    <span className="text-2xl font-bold text-white">{user.quotaUsed}/{user.quotaTotal}</span>
                    <span className="text-xs text-text-muted mb-1">Downloads</span>
                </div>
                <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-primary rounded-full transition-all duration-1000" 
                        style={{ width: `${Math.min((user.quotaUsed / user.quotaTotal) * 100, 100)}%` }}
                    ></div>
                </div>
              </div>

              <div className="bg-surface/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                    <h3 className="text-text-muted text-xs font-bold uppercase tracking-wider mb-4">
                        {isPremium ? "Assinatura" : "Torne-se VIP"}
                    </h3>
                    <div className="flex items-center gap-3 mb-2">
                         <span className="text-lg font-bold text-white">{user.renewalDate}</span>
                    </div>
                </div>
                {!isPremium && (
                    <button 
                        onClick={() => onNavigate('pricing')}
                        className="text-xs bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded transition-colors text-center shadow-lg shadow-primary/20"
                    >
                        Ver Planos
                    </button>
                )}
              </div>
            </div>

            <div className="mb-8">
                <div className="flex justify-between items-end mb-6">
                    <h3 className="text-xl font-bold text-white">Últimos Downloads</h3>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className="text-sm text-secondary hover:text-white transition-colors"
                    >
                        Ver todos
                    </button>
                </div>
                <div className="bg-surface/30 border border-white/5 rounded-xl overflow-hidden">
                    {historyItems.length > 0 ? historyItems.slice(0, 3).map((item, idx) => (
                        <div key={idx} className={`flex items-center p-4 gap-4 ${idx !== 2 ? 'border-b border-white/5' : ''} hover:bg-white/5 transition-colors`}>
                            <img src={item.thumb} alt="" className="w-10 h-10 rounded object-cover bg-black/20" />
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-white truncate">{item.title}</h4>
                                <span className="text-[10px] text-text-muted">{item.formattedDate}</span>
                            </div>
                            <div className="text-xs text-text-muted px-3 py-1 bg-background rounded border border-white/5 shrink-0">{item.format}</div>
                            <button 
                                onClick={() => handleRedownload(item.resourceId, item.title)}
                                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-text-muted hover:text-white hover:bg-primary transition-colors active:scale-95 shrink-0"
                            >
                                <i className="fas fa-download text-xs"></i>
                            </button>
                        </div>
                    )) : (
                        <div className="p-8 text-center text-text-muted text-sm">Nenhum download recente.</div>
                    )}
                </div>
            </div>
          </div>
        );

      case 'history':
        return (
           <div className="animate-[fadeIn_0.3s_ease-out]">
             <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Histórico de Downloads</h2>
              <p className="text-text-muted">Acesse novamente todos os arquivos que você já baixou.</p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 p-5 rounded-lg mb-8 flex flex-col md:flex-row items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0 border border-yellow-500/20">
                    <i className="fas fa-exclamation-triangle text-yellow-500 text-lg"></i>
                </div>
                <div>
                    <h4 className="text-yellow-500 font-bold text-sm mb-2 uppercase tracking-wide">Política de Cota Rigorosa</h4>
                    <p className="text-sm text-text-muted leading-relaxed">
                        • Re-download de arquivos baixados <strong>hoje</strong> é grátis.<br/>
                        • Arquivos de dias anteriores consomem cota normalmente.<br/>
                        • Se a cota acabar, <strong>todos</strong> os downloads são bloqueados até amanhã.
                    </p>
                </div>
            </div>
            
            <div className="bg-surface/30 border border-white/5 rounded-xl overflow-hidden">
                 <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 bg-white/5 border-b border-white/5 text-xs font-bold text-text-muted uppercase tracking-wider">
                     <div className="w-12">Preview</div>
                     <div>Arquivo</div>
                     <div className="hidden md:block">Data</div>
                     <div className="text-right">Ação</div>
                 </div>
                 <div className="divide-y divide-white/5">
                     {historyItems.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 items-center hover:bg-white/5 transition-colors">
                            <img src={item.thumb} alt="" className="w-12 h-12 rounded object-cover bg-black/20 border border-white/10" />
                            <div className="min-w-0">
                                <h4 className="text-sm font-medium text-white mb-1 truncate pr-2">{item.title}</h4>
                                <div className="flex items-center gap-2">
                                     <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/20">{item.format}</span>
                                     <span className="text-[10px] text-text-muted md:hidden">{item.formattedDate}</span>
                                </div>
                            </div>
                            <div className="text-sm text-text-muted hidden md:block">{item.formattedDate}</div>
                            <div className="text-right">
                                <button 
                                    onClick={() => handleRedownload(item.resourceId, item.title)}
                                    className="text-xs font-medium text-white bg-white/10 hover:bg-secondary hover:text-black border border-white/10 px-4 py-2 rounded-lg transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap"
                                >
                                    <i className="fas fa-download"></i> <span className="hidden sm:inline">Baixar</span>
                                </button>
                            </div>
                        </div>
                     ))}
                 </div>
            </div>
           </div>
        );
        
      case 'settings':
         return (
            <div className="animate-[fadeIn_0.3s_ease-out]">
                 <div className="mb-8"><h2 className="text-2xl font-bold text-white mb-2">Meus Dados</h2></div>
                 <div className="bg-surface/30 border border-white/5 rounded-xl p-8 max-w-2xl">
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Nome</label>
                            <input type="text" value={editName} onChange={e=>setEditName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary" />
                        </div>
                        <div>
                             <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">E-mail</label>
                             <input type="email" value={editEmail} onChange={e=>setEditEmail(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary" />
                        </div>
                        <button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-lg shadow-lg">
                            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </form>
                </div>
            </div>
         );

      case 'favorites':
         return (
             <div className="animate-[fadeIn_0.3s_ease-out]">
                 <div className="mb-8"><h2 className="text-2xl font-bold text-white">Favoritos</h2></div>
                 {favoritesList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favoritesList.map(r => (
                            <div key={r.id} className="bg-surface rounded-lg border border-border p-4 hover:border-white/20 transition-colors">
                                <div className="aspect-[4/5] w-full bg-black/20 rounded mb-4 overflow-hidden relative group">
                                    <img src={r.imageUrl} className="w-full h-full object-cover" alt={r.title} />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                         <button onClick={() => onNavigate('home')} className="bg-white text-black px-4 py-2 rounded-full font-bold text-xs transform scale-95 group-hover:scale-100 transition-transform">Ver Arte</button>
                                    </div>
                                </div>
                                <h4 className="text-white font-bold text-sm truncate">{r.title}</h4>
                                <p className="text-xs text-text-muted">{r.author}</p>
                            </div>
                        ))}
                    </div>
                 ) : (
                     <p className="text-text-muted">Você ainda não tem favoritos.</p>
                 )}
             </div>
         );

      case 'subscription':
         return (
            <div className="animate-[fadeIn_0.3s_ease-out]">
                <div className="mb-8"><h2 className="text-2xl font-bold text-white">Assinatura</h2></div>
                <div className="bg-surface/30 border border-white/5 rounded-xl p-8 max-w-2xl">
                     <h3 className="text-3xl font-extrabold text-white mb-2">{getPlanName(user.plan)}</h3>
                     <p className="text-text-muted mb-6">Status: <span className={user.autoRenew !== false ? "text-green-500" : "text-red-500"}>{user.autoRenew !== false ? "Ativo" : "Cancelado"}</span></p>
                     
                     <div className="bg-white/5 rounded-lg p-4 mb-6">
                         <div className="flex justify-between text-sm mb-2">
                             <span className="text-text-muted">Renovação/Expiração:</span>
                             <span className="text-white font-medium">{user.renewalDate}</span>
                         </div>
                         <div className="flex justify-between text-sm">
                             <span className="text-text-muted">Valor:</span>
                             <span className="text-white font-medium">R$ {getPlanPrice(user.plan)}</span>
                         </div>
                     </div>

                     {user.autoRenew === false && <p className="text-red-400 font-bold mb-4 text-sm bg-red-500/10 p-3 rounded border border-red-500/20">Sua assinatura foi cancelada e não será renovada automaticamente.</p>}
                     
                     {user.autoRenew !== false && isPremium && (
                         <button onClick={()=>setIsCancelModalOpen(true)} className="text-red-400 border border-red-500/30 hover:bg-red-500/10 px-6 py-3 rounded-lg text-sm font-medium transition-colors">Cancelar Assinatura</button>
                     )}
                     {!isPremium && (
                         <button onClick={()=>onNavigate('pricing')} className="bg-primary text-white font-bold px-6 py-3 rounded-lg shadow-lg">Fazer Upgrade</button>
                     )}
                </div>
            </div>
         );

      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-text-main font-sans">
      {/* Sidebar Desktop */}
      <aside className="w-[280px] bg-[rgba(24,26,27,0.95)] border-r border-white/5 fixed h-full flex flex-col z-20 hidden lg:flex backdrop-blur-md">
        <div className="h-24 flex items-center px-8 border-b border-white/5 cursor-pointer" onClick={() => onNavigate('home')}>
             <span className="font-bold text-white text-xl">KADOSH <span className="font-light text-secondary">DESIGN</span></span>
        </div>
        <nav className="flex-1 py-4 px-4 space-y-2">
            {menuItems.map((item) => (
                <button 
                    key={item.id} 
                    onClick={() => setActiveTab(item.id)} 
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === item.id ? 'bg-primary text-white font-medium shadow-lg shadow-primary/20' : 'text-text-muted hover:bg-white/5 hover:text-white'}`}
                >
                    <i className={`fas ${item.icon} w-5 text-center`}></i>
                    {item.label}
                </button>
            ))}
        </nav>
        <div className="p-4 border-t border-white/5">
            <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-sm flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 rounded-lg w-full transition-colors">
                <i className="fas fa-sign-out-alt"></i> Sair
            </button>
        </div>
      </aside>

      {/* Header Mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-[#181A1B]/95 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-30 transition-all">
           <div className="flex items-center gap-3">
               <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 text-text-muted hover:text-white active:scale-95 transition-all"
               >
                   <i className="fas fa-bars text-xl"></i>
               </button>
               
               {/* User Profile Info */}
               <div className="flex items-center gap-3 pl-2 border-l border-white/10">
                   <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10">
                        <img 
                            src={`https://ui-avatars.com/api/?name=${user.name}&background=random&color=fff&size=128`} 
                            alt={user.name} 
                            className="w-full h-full object-cover"
                        />
                   </div>
                   <div className="flex flex-col">
                       <span className="text-sm font-bold text-white leading-none mb-0.5">{user.name.split(' ')[0]}</span>
                       <span className="text-[10px] text-text-muted leading-none uppercase tracking-wide">
                            {user.plan === 'free' ? 'Visitante' : 'Membro'}
                       </span>
                   </div>
               </div>
           </div>
           
           <button 
              onClick={() => onNavigate('home')}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 text-text-muted hover:text-white hover:bg-white/10 transition-colors active:scale-95"
           >
                <i className="fas fa-times text-lg"></i>
           </button>
      </div>

      {/* Mobile Drawer (Menu Retrátil) */}
      <div className={`fixed inset-0 z-[100] lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
           <div className={`absolute top-0 left-0 bottom-0 w-[85%] max-w-[300px] bg-[#181A1B] border-r border-white/10 shadow-2xl p-6 transform transition-transform duration-300 ease-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between mb-8">
                     <div className="flex flex-col">
                        <span className="font-bold text-white text-xl tracking-tight">KADOSH</span>
                        <span className="text-[10px] text-text-muted uppercase tracking-wider">Painel do Usuário</span>
                     </div>
                     <button onClick={() => setIsMobileMenuOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-text-muted hover:text-white"><i className="fas fa-times"></i></button>
                </div>
                
                <nav className="flex-1 space-y-2 overflow-y-auto">
                    {menuItems.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all active:scale-[0.98] ${activeTab === item.id ? 'bg-primary text-white font-medium shadow-lg shadow-primary/20' : 'text-text-muted hover:bg-white/5 hover:text-white'}`}
                        >
                            <i className={`fas ${item.icon} w-5 text-center text-lg`}></i>
                            <span className="text-sm">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="mt-6 pt-6 border-t border-white/5">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium active:scale-[0.98]">
                        <i className="fas fa-sign-out-alt w-5 text-center text-lg"></i>
                        <span className="text-sm">Sair da Conta</span>
                    </button>
                </div>
           </div>
      </div>

      <main className="flex-1 lg:ml-[280px] p-6 pt-28 md:p-10 lg:pt-10 overflow-y-auto">
        {renderContent()}
        {isCancelModalOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                 <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsCancelModalOpen(false)}></div>
                 <div className="relative bg-surface p-6 rounded-xl border border-white/10 max-w-sm w-full text-center shadow-2xl animate-[scaleIn_0.2s_ease-out]">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-heart-broken text-2xl text-red-500"></i>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Cancelar Renovação?</h3>
                    <p className="text-text-muted mb-6 text-sm">Seu acesso e benefícios continuarão ativos até o fim do período já pago. Tem certeza?</p>
                    <div className="flex gap-3">
                        <button onClick={() => setIsCancelModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors">Voltar</button>
                        <button onClick={handleCancelSubscription} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold shadow-lg shadow-red-600/20 transition-colors" type="button">Confirmar Cancelamento</button>
                    </div>
                 </div>
            </div>
        )}
        <Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} type={toastType} />
      </main>
    </div>
  );
};
