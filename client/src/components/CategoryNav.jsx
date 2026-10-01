import React from 'react';
import { Layers } from 'lucide-react';

export default function CategoryNav({ categories = [], selectedCategory = 'all', onSelectCategory }) {
  const allCategory = {
    id: 'all',
    name: 'All Dispatches',
    slug: 'all',
    articleCount: categories.reduce((acc, cat) => acc + (cat.articleCount || 0), 0)
  };

  const navItems = [allCategory, ...categories];

  return (
    <nav className="sticky top-[105px] z-30 bg-[#0A1628]/95 backdrop-blur-md border-b border-blue-900/60 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center gap-1 overflow-x-auto py-2.5 no-scrollbar">
          {navItems.map((cat) => {
            const isActive = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id || cat.slug}
                onClick={() => onSelectCategory(cat.slug)}
                className={`group relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-blue-950/60'
                }`}
              >
                <span>{cat.name}</span>
                {cat.articleCount !== undefined && cat.articleCount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono transition-colors ${
                      isActive
                        ? 'bg-blue-700/80 text-blue-100'
                        : 'bg-blue-950/80 text-blue-300 group-hover:bg-blue-900/80'
                    }`}
                  >
                    {cat.articleCount}
                  </span>
                )}

                {/* Animated Bottom Line Indicator on Hover & Active */}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
