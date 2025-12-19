
import React, { useState } from 'react';

interface StarRatingProps {
  rating: number; // Current rating (0-5)
  editable?: boolean;
  onChange?: (newRating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  count?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({ 
    rating, 
    editable = false, 
    onChange, 
    size = 'md',
    count = false
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const starSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-xl' : 'text-sm';
  const displayRating = editable && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => editable && onChange && onChange(star)}
          onMouseEnter={() => editable && setHoverRating(star)}
          onMouseLeave={() => editable && setHoverRating(0)}
          disabled={!editable}
          className={`focus:outline-none transition-transform ${editable ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
        >
          <i 
            className={`
              fas fa-star ${starSize} transition-colors
              ${star <= displayRating ? 'text-yellow-400' : 'text-white/20'}
            `}
          ></i>
        </button>
      ))}
      {count && <span className="text-xs text-text-muted ml-1 font-medium">({rating.toFixed(1)})</span>}
    </div>
  );
};
