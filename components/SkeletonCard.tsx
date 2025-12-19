
import React from 'react';

export const SkeletonCard: React.FC = () => {
  // Random height to simulate masonry layout during loading
  const randomHeight = Math.floor(Math.random() * (400 - 200 + 1) + 200);

  return (
    <div className="bg-surface rounded-lg overflow-hidden border border-border mb-6 break-inside-avoid">
      {/* Image Skeleton - Full Card Area */}
      <div 
        className="w-full skeleton" 
        style={{ height: `${randomHeight}px` }}
      ></div>
    </div>
  );
};
