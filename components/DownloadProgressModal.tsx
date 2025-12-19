
import React from 'react';

interface DownloadProgressModalProps {
  isOpen: boolean;
  progress: number;
  status: string;
}

export const DownloadProgressModal: React.FC<DownloadProgressModalProps> = ({ isOpen, progress, status }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]"></div>
      <div className="relative w-full max-w-md bg-[#181A1B] rounded-xl border border-white/10 p-8 shadow-2xl flex flex-col items-center text-center animate-[scaleIn_0.3s_ease-out]">
        
        {/* Icon Animation */}
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping opacity-20"></div>
            <i className="fas fa-cloud-download-alt text-3xl text-primary animate-bounce"></i>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">Preparando seu arquivo...</h3>
        <p className="text-text-muted text-sm mb-8 h-5">{status}</p>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-surface rounded-full overflow-hidden mb-2 border border-white/5 relative">
            <div 
                className="h-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-300 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
            >
                <div className="absolute inset-0 bg-white/20 animate-[shimmer_1s_infinite_linear]" style={{ backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)', backgroundSize: '200% 100%' }}></div>
            </div>
        </div>
        
        <div className="w-full flex justify-between text-[10px] text-text-muted uppercase font-bold tracking-wider">
            <span>0%</span>
            <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
};
