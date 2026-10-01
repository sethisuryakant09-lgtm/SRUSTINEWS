import React from 'react';
import { Flame, Eye, TrendingUp, Sparkles } from 'lucide-react';

export default function TrendingSidebar({ trendingArticles = [], onSelectArticle }) {
  if (!trendingArticles || trendingArticles.length === 0) return null;

  return (
    <aside className="bg-[#0F1E36] rounded-xl border border-blue-900/50 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-blue-900/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Flame className="w-4 h-4 fill-current" />
          </div>
          <h3 className="font-serif font-bold text-lg text-white">Trending Dispatches</h3>
        </div>
        <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900/50">
          <TrendingUp className="w-3 h-3" />
          Live
        </span>
      </div>

      {/* List */}
      <div className="divide-y divide-blue-950/80">
        {trendingArticles.map((article, index) => {
          const number = String(index + 1).padStart(2, '0');
          return (
            <div
              key={article.id || index}
              onClick={() => onSelectArticle(article.slug)}
              className="group py-3.5 first:pt-1 last:pb-1 flex items-start gap-3.5 cursor-pointer transition-all hover:translate-x-1"
            >
              {/* Number Index */}
              <span className="font-serif font-black text-2xl sm:text-3xl text-blue-500/40 group-hover:text-amber-400 transition-colors shrink-0 select-none">
                {number}
              </span>

              {/* Content */}
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="font-bold uppercase text-blue-400">
                    {article.category?.name || 'World'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Eye className="w-3 h-3 text-slate-400" />
                    <span>{article.viewCount?.toLocaleString() || 120} views</span>
                  </span>
                </div>

                <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-200 group-hover:text-blue-300 transition-colors leading-snug line-clamp-2">
                  {article.title}
                </h4>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
