import React, { useState, useEffect } from 'react';
import ReadingProgress from '../components/ReadingProgress';
import SocialShareModal from '../components/SocialShareModal';
import { getArticleBySlug } from '../services/api';
import { ArrowLeft, Clock, ShieldCheck, Share2, Bookmark, ExternalLink, Sparkles, ZoomIn, ZoomOut, Type } from 'lucide-react';

export default function ArticleDetail({ slug, onBack, onSelectArticle, isSaved, onToggleSave }) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState(1); // 0 = small, 1 = normal, 2 = large

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getArticleBySlug(slug);
        setArticle(data);
      } catch (err) {
        console.error('Error fetching article detail:', err);
        setError('Article could not be loaded or may have been archived.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16 space-y-6 animate-pulse">
        <div className="h-6 bg-blue-900/40 rounded w-28" />
        <div className="h-12 bg-blue-900/60 rounded w-4/5" />
        <div className="h-4 bg-blue-900/30 rounded w-1/3" />
        <div className="h-96 bg-blue-950/80 rounded-2xl w-full" />
        <div className="space-y-3 pt-6">
          <div className="h-4 bg-blue-900/40 rounded w-full" />
          <div className="h-4 bg-blue-900/40 rounded w-5/6" />
          <div className="h-4 bg-blue-900/40 rounded w-4/5" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif text-white">Dispatch Unavailable</h2>
        <p className="text-sm text-slate-400">{error || 'Article not found.'}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Front Page</span>
        </button>
      </div>
    );
  }

  const fontSizeClasses = [
    'text-sm leading-relaxed',
    'text-base leading-relaxed',
    'text-lg leading-loose'
  ];

  return (
    <article className="min-h-screen bg-[#0A1628] text-slate-100 pb-20">
      {/* Top Fixed Reading Progress Indicator */}
      <ReadingProgress />

      {/* Social Share Modal Dialog */}
      <SocialShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        article={article}
      />

      {/* Subheader / Navigation Bar */}
      <div className="border-b border-blue-900/50 bg-[#0A1628]/80 backdrop-blur-md sticky top-[57px] z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400" />
            <span>Back to Front Page</span>
          </button>

          {/* Action Bar (Font Size Controls & Share) */}
          <div className="flex items-center gap-2">
            {/* Font Size Resizer */}
            <div className="flex items-center gap-1 bg-[#1A2B4A] border border-blue-800/40 rounded-lg px-2 py-1 text-xs">
              <Type className="w-3 h-3 text-slate-400" />
              <button
                onClick={() => setFontSizeLevel(0)}
                className={`px-1 rounded text-[11px] font-bold ${fontSizeLevel === 0 ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
                title="Smaller text"
              >
                A-
              </button>
              <button
                onClick={() => setFontSizeLevel(1)}
                className={`px-1 rounded text-xs font-bold ${fontSizeLevel === 1 ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
                title="Normal text"
              >
                A
              </button>
              <button
                onClick={() => setFontSizeLevel(2)}
                className={`px-1 rounded text-sm font-bold ${fontSizeLevel === 2 ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
                title="Larger text"
              >
                A+
              </button>
            </div>

            {/* Bookmark button */}
            {onToggleSave && (
              <button
                onClick={() => onToggleSave(article)}
                className={`p-2 rounded-lg border border-blue-800/40 transition-colors ${
                  isSaved
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-[#1A2B4A] text-slate-300 hover:text-white'
                }`}
                aria-label="Save story"
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}

            {/* Share button */}
            <button
              onClick={() => setShareOpen(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Article Content Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12 space-y-6">
        {/* Category & Metadata */}
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded text-white shadow-sm"
            style={{ backgroundColor: article.category?.color || '#2563EB' }}
          >
            {article.category?.name || 'World'}
          </span>

          <div className="flex items-center gap-1.5 text-xs text-blue-300 bg-blue-950/80 px-2.5 py-1 rounded border border-blue-800/40">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{article.readTime || 4} min read</span>
          </div>

          {article.source && (
            <div className="flex items-center gap-1 text-xs text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/40">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Source: {article.source.name}</span>
            </div>
          )}
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl font-serif font-black text-white leading-tight tracking-tight">
          {article.title}
        </h1>

        {/* Byline & Publish Date */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-blue-900/60 text-xs text-slate-400">
          <div>
            <span className="font-semibold text-slate-200">{article.author || 'Editorial Staff'}</span>
            <span className="mx-2 text-slate-600">•</span>
            <span>
              {new Date(article.publishedAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <span>Views: {article.viewCount?.toLocaleString() || 1}</span>
          </div>
        </div>

        {/* Featured Image */}
        {article.imageUrl && (
          <div className="rounded-2xl overflow-hidden border border-blue-900/50 shadow-2xl bg-slate-900">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-auto max-h-[500px] object-cover"
            />
            <div className="p-3 bg-[#0F1E36] text-[11px] text-slate-400 flex items-center justify-between">
              <span>Verified Wire Telemetry & Satellite Photography</span>
              <span>SRUSTI NEWS Archive</span>
            </div>
          </div>
        )}

        {/* AI Editorial Summary Box (PRD requirement: minimum 150-word verified brief) */}
        <div className="bg-gradient-to-br from-[#102038] to-[#0A1628] rounded-2xl border-2 border-blue-600/50 p-6 sm:p-7 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Executive Brief & Verified Context</span>
          </div>
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-sans font-normal">
            {article.summary}
          </p>
        </div>

        {/* Full Article Body */}
        <div className={`space-y-6 pt-4 text-slate-300 ${fontSizeClasses[fontSizeLevel]}`}>
          {article.content ? (
            article.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            ))
          ) : (
            <p>{article.summary}</p>
          )}
        </div>

        {/* Source Attribution Box */}
        <div className="mt-12 p-6 rounded-xl bg-[#0F1E36] border border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Original Verified Source</span>
            </div>
            <p className="text-xs text-slate-300">
              Reported by <strong className="text-white">{article.source?.name || 'Syndicated Wire'}</strong>. Content indexed under autonomous editorial guidelines.
            </p>
          </div>

          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#1A2B4A] hover:bg-blue-900/60 text-blue-300 hover:text-white px-4 py-2 rounded-lg text-xs font-semibold border border-blue-800/40 transition-colors shrink-0"
          >
            <span>Visit Source</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Related Articles Section */}
        {article.related && article.related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-blue-900/60 space-y-6">
            <h3 className="font-serif font-bold text-xl text-white">Related Dispatches in {article.category?.name}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {article.related.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectArticle(rel.slug)}
                  className="group bg-[#0F1E36] p-4 rounded-xl border border-blue-900/50 hover:border-blue-500/60 transition-all cursor-pointer space-y-2 hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-bold uppercase text-blue-400">{rel.category?.name || 'World'}</span>
                    <span>{rel.readTime || 3} min</span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-white group-hover:text-blue-300 transition-colors line-clamp-2">
                    {rel.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{rel.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
