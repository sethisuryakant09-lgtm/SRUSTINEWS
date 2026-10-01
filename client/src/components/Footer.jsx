import React from 'react';
import { ShieldCheck, Cpu, Radio, Sparkles, Globe, ArrowUp } from 'lucide-react';

export default function Footer({ onSelectCategory, onNavigate }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#070F1C] border-t border-blue-900/60 text-slate-400 text-xs mt-16">
      {/* Top Banner */}
      <div className="border-b border-blue-900/40 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2.5 rounded-xl bg-blue-950/80 border border-blue-800/50 text-blue-400">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-white text-base">SRUSTI NEWS</h4>
              <p className="text-slate-400 text-xs">Continuous Autonomous Journalism & Verified Syndicate Feeds</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-800/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Ingestion Crawler Active (15m Interval)</span>
            </div>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 bg-[#102038] hover:bg-blue-900/60 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-blue-800/40 transition-colors"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Col 1 */}
        <div className="space-y-3">
          <h5 className="font-serif font-bold text-slate-200 text-sm tracking-wider uppercase">Editorial Charter</h5>
          <p className="text-slate-400 leading-relaxed text-xs">
            SRUSTI NEWS operates in accordance with strict international journalistic integrity guidelines. Every dispatch is deduplicated via cryptographic hash, checked against source credibility thresholds, and accompanied by transparent AI summaries.
          </p>
        </div>

        {/* Col 2 */}
        <div className="space-y-3">
          <h5 className="font-serif font-bold text-slate-200 text-sm tracking-wider uppercase">Editorial Sections</h5>
          <ul className="space-y-1.5 text-xs">
            {['World', 'Tech', 'Business', 'Science', 'Health', 'Sports', 'Culture'].map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory(cat.toLowerCase());
                    scrollToTop();
                  }}
                  className="hover:text-blue-400 transition-colors"
                >
                  {cat} Dispatches
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 */}
        <div className="space-y-3">
          <h5 className="font-serif font-bold text-slate-200 text-sm tracking-wider uppercase">Syndication Sources</h5>
          <ul className="space-y-1.5 text-xs text-slate-400">
            <li>Associated Press Wire (Score: 98%)</li>
            <li>Reuters International (Score: 97%)</li>
            <li>BBC World News Network (Score: 95%)</li>
            <li>TechCrunch Silicon Wire (Score: 92%)</li>
            <li>Nature Scientific Review (Score: 99%)</li>
          </ul>
        </div>

        {/* Col 4 */}
        <div className="space-y-3">
          <h5 className="font-serif font-bold text-slate-200 text-sm tracking-wider uppercase">Editorial Access</h5>
          <p className="text-xs text-slate-400">
            Access the real-time content management suite, review queue, and crawler telemetry.
          </p>
          <button
            onClick={() => {
              if (onNavigate) onNavigate('admin');
              scrollToTop();
            }}
            className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs text-center transition-colors shadow-md shadow-blue-600/30"
          >
            Open Editorial CMS
          </button>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-blue-900/40 py-5 px-4 sm:px-8 text-center text-[11px] text-slate-400">
        <p>© 2026 SRUSTI NEWS. Published with React.js, TailwindCSS & Express PERN Architecture. All rights reserved.</p>
      </div>
    </footer>
  );
}
