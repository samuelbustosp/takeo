'use client';

import React from 'react';
import { Category } from '@/types';
import { Flame, UtensilsCrossed, Sandwich, CupSoda, IceCream, Utensils } from 'lucide-react';

interface Props {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Flame,
  UtensilsCrossed,
  Sandwich,
  CupSoda,
  IceCream,
  Utensils,
};

export function CategoryTabs({ categories, selectedCategory, onSelectCategory }: Props) {
  return (
    <div className="w-full overflow-x-auto py-2 scrollbar-none no-scrollbar flex items-center gap-2">
      <button
        onClick={() => onSelectCategory(null)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
          selectedCategory === null
            ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
            : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-orange-500/50 hover:text-orange-600'
        }`}
      >
        <span>Todos</span>
      </button>

      {categories.map((cat) => {
        const IconComponent = (cat.icon && ICON_MAP[cat.icon]) || Utensils;
        const isSelected = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              isSelected
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-orange-500/50 hover:text-orange-600'
            }`}
          >
            <IconComponent className="w-4 h-4" />
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}
