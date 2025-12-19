
import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Notification } from '../types';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { notifications, markAllNotificationsAsRead } = useAuth();

  useEffect(() => {
      if (isOpen) {
          // Optional: Mark as read immediately or after a delay. 
          // For UX, maybe better to let user manually click "Mark all read" or mark on open.
          // Let's mark on open for simplicity in this demo.
          const timer = setTimeout(() => {
              markAllNotificationsAsRead();
          }, 1000);
          return () => clearTimeout(timer);
      }
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = (type: Notification['type']) => {
      switch(type) {
          case 'success': return 'fa-check-circle text-green-500';
          case 'warning': return 'fa-exclamation-triangle text-yellow-500';
          case 'alert': return 'fa-bell text-red-500';
          case 'info': default: return 'fa-info-circle text-blue-500';
      }
  };

  return (
    <div className="absolute right-0 top-full mt-3 w-80 bg-[#202324] border border-white/5 rounded-xl shadow-2xl py-2 animate-[fadeIn_0.1s_ease-out] backdrop-blur-xl z-50">
        <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center">
            <span className="text-white text-sm font-bold">Notificações</span>
            <span className="text-[10px] text-text-muted bg-white/5 px-2 py-0.5 rounded-full">{notifications.length}</span>
        </div>

        <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
                notifications.map((note) => (
                    <div key={note.id} className={`px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 relative ${!note.read ? 'bg-white/[0.02]' : ''}`}>
                        {!note.read && (
                            <div className="absolute left-1.5 top-5 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        )}
                        <div className="flex gap-3">
                            <div className="mt-0.5 shrink-0">
                                <i className={`fas ${getIcon(note.type)} text-sm`}></i>
                            </div>
                            <div>
                                <h4 className={`text-sm ${!note.read ? 'font-bold text-white' : 'font-medium text-text-main'}`}>{note.title}</h4>
                                <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{note.message}</p>
                                <span className="text-[10px] text-text-muted/60 mt-1 block">{note.date}</span>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="p-6 text-center text-text-muted text-sm">
                    <i className="far fa-bell-slash text-xl mb-2 opacity-50"></i>
                    <p>Nenhuma notificação.</p>
                </div>
            )}
        </div>
        
        <div className="px-4 py-2 border-t border-white/5 text-center">
            <button 
                onClick={onClose}
                className="text-xs text-secondary hover:text-white transition-colors"
            >
                Fechar
            </button>
        </div>
    </div>
  );
};
