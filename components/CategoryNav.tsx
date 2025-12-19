
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface CategoryNavProps {
  activeCategory: string;
  onSelectCategory: (categoryName: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({ activeCategory, onSelectCategory }) => {
  const { categories } = useAuth();

  return (
    <nav 
      className="hidden md:block w-full bg-background/95 backdrop-blur-sm shadow-sm sticky top-20 md:top-24 z-40 category-nav"
    >
      <div className="max-w-[1400px] mx-auto px-6 h-full">
        <ul className="flex items-center gap-10 md:gap-14 h-full overflow-x-auto no-scrollbar justify-start md:justify-center">
          {categories.map((category) => {
            const isActive = activeCategory === category.name;
            return (
              <li 
                key={category.id}
                onClick={() => onSelectCategory(category.name)}
                className={`
                  relative h-full flex flex-col justify-center items-center cursor-pointer select-none whitespace-nowrap
                  text-[13px] tracking-wide
                  ${isActive ? 'text-white font-medium' : 'text-text-muted font-normal hover:text-white/80'}
                  hover-divine-glow
                `}
              >
                <span>{category.name}</span>
                
                {/* Delicate Dot Active Indicator */}
                <span 
                  className={`
                    absolute bottom-2 w-1 h-1 bg-secondary rounded-full 
                    shadow-[0_0_8px_rgba(191,197,199,0.8)]
                    ${isActive ? 'opacity-100' : 'opacity-0'}
                  `}
                ></span>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
