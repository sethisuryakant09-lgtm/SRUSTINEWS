import React from 'react';
import { Flame, Radio } from 'lucide-react';

export default function Ticker({ breakingStories = [], onSelectArticle }) {
  if (!breakingStories || breakingStories.length === 0) return null;

  return (
    <div className="bg-[#0D1B2E] border-y border-blue-900/50 flex items-stretch overflow-hidden select-none h-11">
      {/* Ticker Badge */}
      <div className="bg-amber-500 text-slate-950 font-extrabold uppercase text-xs tracking-wider px-4 flex items-center gap-1.5 shrink-0 z-10 shadow-lg shadow-amber-500/20">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-900"></span>
        </span>
        <Flame className="w-3.5 h-3.5 fill-current" />
        <span className="hidden sm:inline">Breaking News</span>
        <span className="sm:hidden">Live</span>
      </div>

      {/* Marquee Track */}
      <div className="relative flex-1 overflow-hidden flex items-center">
        <div className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused] cursor-pointer">
          {/* Duplicate twice for seamless infinite scroll */}
          {[...breakingStories, ...breakingStories].map((story, idx) => (
            <div
              key={`${story.id}-${idx}`}
              onClick={() => onSelectArticle(story.slug)}
              className="inline-flex items-center gap-3 px-6 text-xs text-slate-200 hover:text-amber-400 transition-colors border-r border-blue-900/40"
            >
              <span className="font-semibold text-blue-400 uppercase text-[10px] tracking-wide px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-800/40">
                {story.category?.name || 'World'}
              </span>
              <span className="font-medium hover:underline">{story.title}</span>
              <span className="text-slate-500 text-[11px] font-mono">
                {new Date(story.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-blue-500 font-bold ml-2">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
