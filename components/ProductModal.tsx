
import React, { useState, useEffect } from 'react';
import { DesignResource } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { DownloadProgressModal } from './DownloadProgressModal';
import { Toast } from './Toast';

interface ProductModalProps {
  resource: DesignResource | null;
  onClose: () => void;
  onCheckout: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ resource, onClose, onCheckout }) => {
  const { user, registerDownload, toggleFavorite } = useAuth();
  
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState('');
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  useEffect(() => {
    if (resource) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [resource]);

  if (!resource) return null;

  const isFavorite = user?.favorites?.includes(resource.id);
  const showPremiumWarning = resource.premium && (!user || user.plan === 'free');
  const primaryCategory = resource.categories && resource.categories.length > 0 ? resource.categories[0] : 'Geral';
  
  const fileSize = resource.fileSize || "25 MB"; 
  const resolution = resource.resolution || "300 DPI";
  const dimensions = resource.dimensions || "1080x1350px";

  const getDownloadButtonText = () => {
      if (resource.format === 'JPG' || resource.format === 'PNG') return "DOWNLOAD";
      return "BAIXAR ARQUIVO";
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
  };

  const startDownloadSimulation = (successMsg: string) => {
    setIsDownloadModalOpen(true);
    setDownloadProgress(0);
    setDownloadStatus("Verificando cota diária...");

    setTimeout(() => {
        setDownloadProgress(30);
        setDownloadStatus("Autorizando download...");
    }, 800);

    setTimeout(() => {
        setDownloadProgress(70);
        setDownloadStatus("Preparando arquivos...");
    }, 1500);

    setTimeout(() => {
        setDownloadProgress(100);
        setDownloadStatus("Iniciando...");
        completeDownload(successMsg);
    }, 2500);
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
             const content = `Download Kadosh Design\nArquivo: ${resource.title}\nID: ${resource.id}`;
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

  const handleAction = async (type: 'download' | 'canva') => {
    if (!user) {
        onClose();
        onCheckout();
        return;
    }

    if (resource.premium && user.plan === 'free') {
        setToastMessage("Este recurso é exclusivo para assinantes VIP.");
        setToastType('info');
        setShowToast(true);
        setTimeout(() => {
            onClose();
            onCheckout();
        }, 1500); 
        return;
    }

    // Await the async result
    const result = await registerDownload(resource.id);

    if (!result.success) {
        setToastMessage(result.message);
        setToastType('error');
        setShowToast(true);
        return;
    }

    // Handle Canva separate flow
    if (type === 'canva') {
        if (resource.canvaUrl) {
            window.open(resource.canvaUrl, '_blank');
            if (result.message) {
                 setToastMessage(result.message);
                 setToastType('success');
                 setShowToast(true);
            }
        } else {
             setToastMessage("Link do Canva indisponível.");
             setToastType('error');
             setShowToast(true);
        }
        return;
    }

    // Handle Standard Download
    if (type === 'download') {
        startDownloadSimulation(result.message);
    }
  };

  return (
    <>
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-surface md:rounded-2xl shadow-2xl flex flex-col lg:flex-row overflow-hidden animate-[scaleIn_0.2s_ease-out] border border-border w-full md:w-auto max-w-full md:max-w-[95vw] h-[95vh] md:h-auto md:max-h-[90vh] mt-auto md:mt-0 rounded-t-2xl">
        <div className="absolute top-4 right-4 z-50">
          <button onClick={onClose} className="w-10 h-10 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors backdrop-blur-md shadow-lg">
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>
        <div className="bg-[#121212] relative flex items-center justify-center shrink-0 h-[30vh] lg:h-auto lg:min-h-[500px]">
            <img src={resource.watermarkImageUrl || resource.imageUrl} alt={resource.title} className="block w-full h-full object-contain lg:max-w-[65vw] lg:max-h-[90vh]" />
            {resource.premium && (
                <div className="absolute top-4 left-4 z-20 bg-yellow-500/10 backdrop-blur-md border border-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <i className="fas fa-crown"></i> Premium
                </div>
            )}
        </div>
        <div className="flex-1 lg:flex-none w-full lg:w-[400px] xl:w-[450px] flex flex-col bg-surface overflow-y-auto custom-scrollbar border-l border-border shrink-0">
             <div className="p-5 md:p-6 lg:p-8 pb-8 md:pb-10">
                 <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-1 bg-background border border-border rounded text-[10px] font-bold text-secondary uppercase tracking-wide">{primaryCategory}</span>
                    <span className="text-text-muted text-xs">•</span>
                    <span className="text-text-muted text-xs">{resource.format}</span>
                 </div>
                 <h2 className="text-xl md:text-2xl font-extrabold text-white mb-2 leading-tight font-sans">{resource.title}</h2>
                 <div className="flex items-center gap-2 text-text-muted text-sm mb-6">
                    <span>Por</span> <strong className="text-white">{resource.author}</strong>
                 </div>
                 {showPremiumWarning && (
                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 flex gap-3 items-start mb-6">
                        <i className="fas fa-lock text-yellow-500 mt-1"></i>
                        <div>
                            <h4 className="text-yellow-500 font-bold text-sm">Arquivo Exclusivo</h4>
                            <p className="text-xs text-text-muted mt-1">Assine um plano para desbloquear.</p>
                        </div>
                    </div>
                 )}
                 <div className="grid grid-cols-2 gap-3 mb-6">
                     <div className="bg-background p-3 rounded-lg border border-border"><span className="text-[10px] text-text-muted uppercase font-bold block mb-1">Resolução</span><span className="text-white text-sm font-medium">{resolution}</span></div>
                     <div className="bg-background p-3 rounded-lg border border-border"><span className="text-[10px] text-text-muted uppercase font-bold block mb-1">Tamanho</span><span className="text-white text-sm font-medium">{fileSize}</span></div>
                     <div className="bg-background p-3 rounded-lg border border-border col-span-2"><span className="text-[10px] text-text-muted uppercase font-bold block mb-1">Dimensões</span><span className="text-white text-sm font-medium">{dimensions}</span></div>
                 </div>
                 <div className="space-y-3 mt-auto mb-6">
                    <button onClick={() => handleAction('download')} className="w-full h-12 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 text-sm uppercase tracking-wide">
                        <i className="fas fa-cloud-download-alt text-lg"></i> {getDownloadButtonText()}
                    </button>
                    {resource.canvaAvailable && (
                        <button onClick={() => handleAction('canva')} className="w-full h-12 bg-gradient-to-r from-teal-500 to-purple-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 text-sm uppercase tracking-wide">
                             <i className="fas fa-pen-nib"></i> Editar no Canva
                        </button>
                    )}
                    <button onClick={handleFavorite} className={`w-full h-10 bg-transparent border border-border hover:border-secondary rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-medium active:scale-[0.98] ${isFavorite ? 'text-red-500 border-red-500/30 bg-red-500/5' : 'text-text-muted hover:text-white'}`}>
                        <i className={`${isFavorite ? 'fas' : 'far'} fa-heart`}></i> {isFavorite ? 'Salvo' : 'Favoritar'}
                    </button>
                 </div>
                 <div>
                    <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-1.5">
                        {resource.tags.map(tag => (
                            <span key={tag} className="px-2.5 py-1 bg-background border border-border rounded-full text-[10px] text-text-muted">#{tag}</span>
                        ))}
                    </div>
                 </div>
             </div>
        </div>
      </div>
    </div>
    <DownloadProgressModal isOpen={isDownloadModalOpen} progress={downloadProgress} status={downloadStatus} />
    <Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} type={toastType} />
    </>
  );
};
