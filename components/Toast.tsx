
import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: 'success' | 'error' | 'info';
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose, type = 'success' }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
      switch(type) {
          case 'success': return 'fa-check-circle';
          case 'error': return 'fa-exclamation-circle';
          case 'info': return 'fa-info-circle';
          default: return 'fa-check-circle';
      }
  }

  const getColors = () => {
      switch(type) {
          case 'success': return 'bg-[#181A1B] border-green-500/30 text-white';
          case 'error': return 'bg-[#181A1B] border-red-500/30 text-white';
          case 'info': return 'bg-[#181A1B] border-blue-500/30 text-white';
          default: return 'bg-[#181A1B] border-green-500/30 text-white';
      }
  }

  const getIconColor = () => {
      switch(type) {
          case 'success': return 'text-green-500';
          case 'error': return 'text-red-500';
          case 'info': return 'text-blue-500';
          default: return 'text-green-500';
      }
  }

  return (
    <div className={`fixed bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-auto z-[150] flex items-center gap-4 px-6 py-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border animate-[slideUp_0.4s_cubic-bezier(0.16,1,0.3,1)] backdrop-blur-xl ${getColors()}`}>
      <div className={`shrink-0 text-xl ${getIconColor()}`}>
        <i className={`fas ${getIcon()}`}></i>
      </div>
      <div className="flex-1">
          <p className="text-sm font-medium leading-tight">{message}</p>
      </div>
      <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
          <i className="fas fa-times"></i>
      </button>
    </div>
  );
};
