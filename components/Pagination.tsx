
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination-container flex justify-center items-center gap-4 mt-12 mb-8 animate-[fadeIn_0.5s_ease-out]">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 border
          ${currentPage === 1 
            ? 'bg-white/5 border-transparent text-text-muted/40 cursor-not-allowed' 
            : 'bg-surface border-white/10 text-white hover:bg-white/10 hover:border-white/30 active:scale-95 shadow-lg'}
        `}
      >
        <i className="fas fa-chevron-left text-xs"></i>
        <span>Anterior</span>
      </button>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 border
          ${currentPage === totalPages 
            ? 'bg-white/5 border-transparent text-text-muted/40 cursor-not-allowed' 
            : 'bg-surface border-white/10 text-white hover:bg-white/10 hover:border-white/30 active:scale-95 shadow-lg'}
        `}
      >
        <span>Próxima</span>
        <i className="fas fa-chevron-right text-xs"></i>
      </button>
    </div>
  );
};
