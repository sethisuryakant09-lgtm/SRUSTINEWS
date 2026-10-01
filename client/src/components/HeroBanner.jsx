import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, ShieldCheck, ArrowUpRight, Sparkles } from 'lucide-react';

export default function HeroBanner({ featuredStories = [], onSelectArticle }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!featuredStories || featuredStories.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % featuredStories.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [featuredStories, isPaused]);

  if (!featuredStories || featuredStories.length === 0) return null;

  const current = featuredStories[activeIndex] || featuredStories[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + featuredStories.length) % featuredStories.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % featuredStories.length);
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-[#0A1628] border-b border-blue-900/40"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Featured Background Images with Crossfade & Ken Burns effect */}
      <div className="relative h-[480px] sm:h-[540px] md:h-[580px] w-full overflow-hidden">
        {featuredStories.map((story, idx) => (
          <div
            key={story.id || idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === activeIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'
            }`}
          >
            <img
              src={story.imageUrl || 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80'}
              alt={story.title}
              className="w-full h-full object-cover hero-ken-burns filter brightness-90 contrast-105"
            />
          </div>
        ))}

        {/* PRD Specified Deep Navy Gradient Overlay: #0A1628 -> Transparent */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/70 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628] via-[#0A1628]/60 to-transparent z-10" />

        {/* Hero Content Container */}
        <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-8 flex flex-col justify-end pb-12">
          <div className="max-w-3xl space-y-4">
            {/* Meta Tags Row */}
            <div className="flex flex-wrap items-center gap-2.5">
              {current.isBreaking && (
                <span className="bg-amber-500 text-slate-950 font-black text-[11px] uppercase tracking-wider px-2.5 py-1 rounded shadow-md flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-black animate-ping" />
                  Breaking Dispatch
                </span>
              )}

              <span
                className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-blue-600 text-white shadow-sm"
                style={{ backgroundColor: current.category?.color || '#2563EB' }}
              >
                {current.category?.name || 'World'}
              </span>

              <div className="flex items-center gap-1.5 text-xs text-blue-200 bg-blue-950/70 px-2.5 py-1 rounded border border-blue-800/40">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>{current.readTime || 4} min read</span>
              </div>

              {current.source && (
                <div className="flex items-center gap-1 text-xs text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/40">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified: {current.source.name}</span>
                </div>
              )}
            </div>

            {/* Headline */}
            <h2
              onClick={() => onSelectArticle(current.slug)}
              className="text-2xl sm:text-4xl md:text-5xl font-serif font-black text-white leading-tight tracking-tight hover:text-blue-200 transition-colors cursor-pointer"
            >
              {current.title}
            </h2>

            {/* AI Summary Highlight Box */}
            <div className="bg-[#102038]/80 backdrop-blur-md p-3.5 sm:p-4 rounded-xl border border-blue-700/40 text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
              <div className="flex items-center gap-1.5 text-blue-400 font-semibold text-xs mb-1.5 uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Editorial Synthesis</span>
              </div>
              <p className="line-clamp-2 sm:line-clamp-3">{current.summary}</p>
            </div>

            {/* Author & Read Action Button */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="text-xs text-slate-400">
                <span className="font-medium text-slate-200">{current.author || 'Senior Correspondent'}</span>
                <span className="mx-2 text-slate-600">•</span>
                <span>{new Date(current.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>

              <button
                onClick={() => onSelectArticle(current.slug)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5"
              >
                <span>Read Full Article</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Slide Indicators & Arrows */}
        <div className="absolute right-4 sm:right-8 bottom-6 z-20 flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#0A1628]/80 backdrop-blur-md p-1.5 rounded-full border border-blue-900/60">
            {featuredStories.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === activeIndex ? 'w-6 bg-blue-400' : 'w-2 bg-slate-600 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1 bg-[#0A1628]/80 backdrop-blur-md p-1 rounded-lg border border-blue-900/60">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded hover:bg-blue-900/60 text-slate-300 hover:text-white transition-colors"
              aria-label="Previous story"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded hover:bg-blue-900/60 text-slate-300 hover:text-white transition-colors"
              aria-label="Next story"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
