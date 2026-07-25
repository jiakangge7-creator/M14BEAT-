import React from 'react';
import { Category } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { Layers } from 'lucide-react';

interface CategoryNavProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  categoryLinkCounts: Record<string, number>;
  totalLinksCount: number;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  categoryLinkCounts,
  totalLinksCount,
}) => {
  return (
    <div className="w-full my-4 overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-2 min-w-max px-4 max-w-7xl mx-auto">
        
        {/* All Categories Option */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            activeCategoryId === 'all'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
              : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>全部集合</span>
          <span
            className={`px-1.5 py-0.2 text-[10px] rounded-full ${
              activeCategoryId === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}
          >
            {totalLinksCount}
          </span>
        </button>

        {/* Pinned / Favorites Shortcut */}
        <button
          onClick={() => onSelectCategory('pinned')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            activeCategoryId === 'pinned'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 font-semibold'
              : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:bg-amber-50 dark:hover:bg-amber-950/30'
          }`}
        >
          <span className="text-amber-400">★</span>
          <span>置顶推荐</span>
        </button>

        {/* Dynamic Category List */}
        {categories.map((cat) => {
          const count = categoryLinkCounts[cat.id] || 0;
          const isActive = activeCategoryId === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                  : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <DynamicIcon name={cat.icon} className="w-4 h-4" size={16} />
              <span>{cat.name}</span>
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
