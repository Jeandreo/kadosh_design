
import React, { useState } from 'react';
import { DesignResource } from '../types';
import { DownloadProgressModal } from './DownloadProgressModal';
import { Toast } from './Toast';
import { useAuth } from '../contexts/AuthContext';

interface ProductDetailsProps {
  resource: DesignResource;
  onBack: () => void;
  onCheckout: () => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ resource, onBack, onCheckout }) => {
  const { user, registerDownload, toggleFavorite } = useAuth();
  
  // Simulation State
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState('');
  
  // Toast State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const isFavorite = user?.favorites?.includes(resource.id);

  // SEO JSON-LD Construction
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": resource.title,
    "image": resource.imageUrl,
    "description": `Arquivo PSD editável para igreja: ${resource.tags.join(', ')}.`,
    "brand": {
      "@type": "Brand",
      "name": "Kadosh Design"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "BRL",
      "price": resource.premium ? "49.90" : "0.00",
      "availability": "https://schema.org/InStock"
    }
  };

  const handleAction = (type: 'download' | 'canva') => {
    // 1. Auth Check
    if (!user) {
        onCheckout();
        return;
    }

    // 2. Plan Check (Premium vs Free)
    if (resource.premium && user.plan === 'free') {
        setToastMessage("Este recurso é exclusivo para assinantes VIP.");
        setToastType('info');
        setShowToast(true);
        setTimeout(() => onCheckout(), 1500); 
        return;
    }

    // 3. Centralized Quota & History Logic
    const result = registerDownload(resource.id);

    if (!result.success) {
        setToastMessage(result.message);
        setToastType('error');
        setShowToast(true);
        return;
    }

    // Success Message (Quota info)
    if (result.message) {
         // Only show info toast if it's not a modal flow (Canva opens immediately)
         // For download, the modal shows progress, so toast is secondary
         if (type === 'canva') {
             setToastMessage(result.message);
             setToastType('success');
             setShowToast(true);
         }
    }

    // 4. Execution
    if (type === 'download') {
        startDownloadSimulation(result.message);
    } else if (type === 'canva') {
        if (resource.canvaUrl) {
            window.open(resource.canvaUrl, '_blank');
        } else {
             setToastMessage("Link do Canva não disponível.");
             setToastType('error');
             setShowToast(true);
        }
    }
  };

  const startDownloadSimulation = (successMsg: string) => {
    setIsDownloadModalOpen(true);
    setDownloadProgress(0);
    setDownloadStatus("Verificando permissões de conta...");

    setTimeout(() => {
        setDownloadProgress(25);
        setDownloadStatus("Conectando ao servidor seguro...");
    }, 800);

    setTimeout(() => {
        setDownloadProgress(60);
        setDownloadStatus("Compactando arquivos (PSD + Assets)...");
    }, 1800);

    setTimeout(() => {
        setDownloadProgress(85);
        setDownloadStatus("Gerando link de download único...");
    }, 2800);

    setTimeout(() => {
        setDownloadProgress(100);
        setDownloadStatus("Iniciando transferência...");
        completeDownload(successMsg);
    }, 3500);
  };

  const completeDownload = (successMsg: string) => {
     setTimeout(() => {
         setIsDownloadModalOpen(false);
         
         if (resource.downloadUrl) {
             const link = document.createElement("a");
             link.href = resource.downloadUrl;
             link.setAttribute('download', ''); 
             link.target = "_blank"; 
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);
         } else {
             const link = document.createElement("a");
             const content = `Obrigado por baixar na Kadosh Design!\n\nArquivo: ${resource.title}\nLicença: ${resource.premium ? 'Premium' : 'Livre'}\nData: ${new Date().toLocaleString()}\n\nLembre-se: Você tem uma cota diária de downloads.`;
             link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
             link.download = `${resource.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.zip`;
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);
         }

         setToastMessage(successMsg);
         setToastType('success');
         setShowToast(true);

     }, 500);
  };

  const handleFavorite = () => {
      if (!user) {
          onCheckout();
          return;
      }
      toggleFavorite(resource.id);
      if (!isFavorite) {
          setToastMessage("Adicionado aos favoritos!");
          setToastType('success');
          setShowToast(true);
      }
  }

  const fileSize = "25 MB"; 

  const getDownloadButtonText = () => {
      if (resource.format === 'JPG' || resource.format === 'PNG') {
          return "DOWNLOAD";
      }
      return "BAIXAR ARQUIVO";
  };
  
  // Use primary category
  const primaryCategory = resource.categories && resource.categories.length > 0 ? resource.categories[0] : 'Geral';

  // Check if user needs to upgrade to access this resource
  const showPremiumWarning = resource.premium && (!user || user.plan === 'free');

  return (
    <div className="container mx-auto px-4 max-w-7xl py-8 animate-[fadeIn_0.3s_ease-out]">
      
      {/* SEO Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-8">
        <button 
          onClick={onBack} 
          className="hover:text-white transition-colors flex items-center gap-1"
        >
          <i className="fas fa-home text-xs"></i> Home
        </button>
        <i className="fas fa-chevron-right text-[10px] opacity-50"></i>
        <span className="text-text-muted cursor-default hover:text-white transition-colors">
          {primaryCategory}
        </span>
        <i className="fas fa-chevron-right text-[10px] opacity-50"></i>
        <span className="text-white font-medium truncate max-w-[200px] md:max-w-none cursor-default">
          {resource.title}
        </span>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-12 mb-16">
        
        {/* LEFT COLUMN: Visual & Technical */}
        <div className="flex flex-col gap-6">
          
          {/* Main Image Container */}
          <div className="bg-[#121212] rounded-xl overflow-hidden border border-border shadow-2xl relative group">
             <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
             <img 
               src={resource.watermarkImageUrl || resource.imageUrl} 
               alt={resource.title} 
               className="w-full h-auto object-contain max-h-[700px] relative z-10 mx-auto"
             />
             <div className="absolute bottom-4 right-4 z-20">
                <button className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-lg text-white hover:bg-white hover:text-black transition-colors flex items-center justify-center active:scale-95">
                    <i className="fas fa-expand"></i>
                </button>
             </div>
          </div>

          {/* Technical Info Box */}
          <div className="bg-[rgba(255,255,255,0.03)] p-6 rounded-xl border border-border">
             <h3 className="text-white font-bold mb-4 text-xs uppercase tracking-wider text-opacity-70">Informações Técnicas</h3>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 text-sm">
                <div className="flex flex-col gap-1">
                    <span className="text-text-muted text-xs">Formato</span>
                    <span className="text-white font-medium">{resource.format} (Editável)</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-text-muted text-xs">Dimensões</span>
                    <span className="text-white font-medium">1080 x 1350 px</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-text-muted text-xs">Tamanho</span>
                    <span className="text-white font-medium">{fileSize}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-text-muted text-xs">Resolução</span>
                    <span className="text-white font-medium">300 DPI</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-text-muted text-xs">Licença</span>
                    <span className={`font-bold ${resource.premium ? 'text-yellow-500' : 'text-green-500'}`}>
                        {resource.premium ? 'Uso Premium' : 'Uso Livre'}
                    </span>
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Conversion & Details */}
        <div className="flex flex-col h-fit lg:sticky lg:top-28 space-y-6">
            
            {/* Header & Tags */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-surface border border-border rounded text-[10px] font-bold text-secondary uppercase tracking-wide">
                        {primaryCategory}
                    </span>
                    {resource.premium && (
                        <span className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded text-[10px] font-bold text-yellow-500 uppercase tracking-wide">
                            Premium
                        </span>
                    )}
                </div>
                {/* Responsive Title Size */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4 font-sans">
                    {resource.title}
                </h1>
            </div>

            {/* Premium Warning Box - Only shown if resource is premium AND user is NOT on a paid plan */}
            {showPremiumWarning && (
                <div className="bg-[rgba(245,158,11,0.1)] border border-[#f59e0b]/40 rounded-xl p-5 flex gap-4 items-start animate-[pulse_3s_infinite]">
                    <div className="bg-[#f59e0b]/20 p-2 rounded-lg shrink-0 text-[#f59e0b]">
                        <i className="fas fa-crown text-xl"></i>
                    </div>
                    <div>
                        <h4 className="text-[#f59e0b] font-bold text-sm mb-1">Arquivo exclusivo para assinantes Premium</h4>
                        <p className="text-xs text-[#f59e0b]/80 leading-relaxed">
                            Assine agora para ter acesso ilimitado a este e milhares de outros recursos cristãos de alta qualidade.
                        </p>
                    </div>
                </div>
            )}

            {/* Benefits List */}
            <div className="py-2">
                <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-text-muted">
                        <i className="fas fa-check-circle text-green-500 text-lg"></i>
                        <span className="text-white">Arquivo 100% Editável</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-text-muted">
                        <i className="fas fa-check-circle text-green-500 text-lg"></i>
                        <span className="text-white">Uso Comercial Liberado</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-text-muted">
                        <i className="fas fa-check-circle text-green-500 text-lg"></i>
                        <span className="text-white">Alta Resolução para Impressão</span>
                    </li>
                </ul>
            </div>

            {/* SYMMETRICAL ACTION BUTTONS */}
            <div className="pt-2">
                <div className={`grid ${resource.canvaAvailable ? 'grid-cols-2' : 'grid-cols-1'} gap-[15px]`}>
                    
                    {/* PSD / DOWNLOAD BUTTON (Solid) */}
                    <button 
                        onClick={() => handleAction('download')}
                        className="
                           h-[50px] w-full rounded-lg 
                           bg-[#2563eb] hover:bg-[#1d4ed8] text-white 
                           text-[13px] font-semibold uppercase tracking-wide
                           flex items-center justify-center gap-2
                           shadow-lg shadow-blue-500/20 
                           transition-all transform hover:-translate-y-0.5 active:scale-[0.98]
                        "
                    >
                        <i className="fas fa-file-image text-base"></i>
                        <span>{getDownloadButtonText()}</span>
                    </button>

                    {/* CANVA / EDIT BUTTON (Gradient) */}
                    {resource.canvaAvailable && resource.canvaUrl && (
                        <button 
                            onClick={() => handleAction('canva')}
                            className="
                               h-[50px] w-full rounded-lg 
                               bg-[linear-gradient(45deg,#09a29c,#8142c6)] text-white
                               text-[13px] font-semibold uppercase tracking-wide
                               flex items-center justify-center gap-2
                               shadow-lg shadow-purple-500/20
                               transition-all transform hover:-translate-y-0.5 active:scale-[0.98] hover:brightness-110
                            "
                        >
                             <i className="fas fa-pen-nib text-base text-white"></i>
                             <span>EDITAR NO CANVA</span>
                        </button>
                    )}
                </div>
                
                <div className="flex items-center justify-between mt-4">
                    <button 
                        onClick={handleFavorite}
                        className={`flex items-center gap-2 font-medium text-xs px-3 py-2 rounded hover:bg-white/5 transition-colors active:scale-95 ${isFavorite ? 'text-red-500' : 'text-text-muted hover:text-white'}`}
                    >
                        <i className={`${isFavorite ? 'fas' : 'far'} fa-heart text-sm`}></i> 
                        {isFavorite ? 'Salvo' : 'Salvar'}
                    </button>
                    <p className="text-[10px] text-text-muted flex items-center gap-1 opacity-60">
                        <i className="fas fa-shield-alt"></i> Download seguro.
                    </p>
                </div>
            </div>

            {/* Author Card - Minimalist */}
            <div className="mt-6 flex items-center justify-between p-4 bg-surface rounded-xl border border-border hover:border-secondary/30 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-border group-hover:border-secondary/50 transition-colors">
                         <img src={`https://ui-avatars.com/api/?name=${resource.author}&background=576063&color=fff`} alt={resource.author} />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm group-hover:text-white transition-colors">{resource.author}</h4>
                        <p className="text-text-muted text-[10px]">Designer Oficial</p>
                    </div>
                </div>
                <button className="text-xs font-bold text-secondary hover:text-white px-4 py-1.5 rounded-full border border-secondary hover:bg-secondary transition-all active:scale-95">
                    Seguir
                </button>
            </div>

        </div>
      </div>

      {/* Modals */}
      <DownloadProgressModal 
        isOpen={isDownloadModalOpen}
        progress={downloadProgress}
        status={downloadStatus}
      />

      <Toast 
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />
    </div>
  );
};
