import React from 'react';
import { Clock, ShieldCheck, Bookmark, ArrowUpRight, Sparkles } from 'lucide-react';

export default function ArticleCard({ article, onSelectArticle, isSaved, onToggleSave }) {
  if (!article) return null;

  return (
    <article
      onClick={() => onSelectArticle(article.slug)}
      className="group relative bg-[#0F1E36] rounded-xl overflow-hidden border border-blue-900/50 hover:border-blue-500/60 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-600/20 flex flex-col cursor-pointer"
    >
      {/* Article Thumbnail */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
        <img
          src={article.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter brightness-95 group-hover:brightness-100"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1E36] via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-md text-white backdrop-blur-sm"
            style={{ backgroundColor: article.category?.color || '#2563EB' }}
          >
            {article.category?.name || 'World'}
          </span>

          <div className="flex items-center gap-1.5">
            {article.isBreaking && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded shadow flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                Live
              </span>
            )}

            {onToggleSave && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(article);
                }}
                className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${
                  isSaved
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-[#0A1628]/70 text-slate-300 hover:text-white hover:bg-blue-900/80'
                }`}
                aria-label="Bookmark article"
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Metadata Row */}
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              <Clock className="w-3 h-3 text-blue-400" />
              <span>{article.readTime || 3} min read</span>
            </span>

            {article.source && (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <ShieldCheck className="w-3 h-3" />
                <span>{article.source.name}</span>
              </span>
            )}
          </div>

          {/* Headline */}
          <h3 className="font-serif font-bold text-base sm:text-lg text-white group-hover:text-blue-300 transition-colors leading-snug line-clamp-2">
            {article.title}
          </h3>

          {/* AI Summary Excerpt */}
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
            {article.summary}
          </p>
        </div>

        {/* Footer info & CTA */}
        <div className="pt-3 border-t border-blue-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="truncate max-w-[170px]">
            <span className="text-slate-300 font-medium">{article.author || 'Staff Reporter'}</span>
          </div>

          <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 text-xs font-semibold">
            <span>Read</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
