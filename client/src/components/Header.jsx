import React, { useState, useEffect } from 'react';
import { CloudSun, Search, ShieldCheck, Settings, Bookmark, Clock, Flame, Menu, X } from 'lucide-react';

export default function Header({ onOpenSearch, onNavigate, currentView, savedCount = 0 }) {
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      );
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    };
    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="border-b border-blue-900/60 bg-[#0A1628]/95 backdrop-blur-md sticky top-0 z-40">
      {/* Top Utility Bar */}
      <div className="border-b border-blue-900/30 text-xs py-1.5 px-4 sm:px-8 text-slate-300 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-blue-300">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{currentDate}</span>
            <span className="text-slate-500 font-mono">({currentTime})</span>
          </span>
          <span className="hidden sm:inline-block text-slate-600">|</span>
          <span className="hidden sm:flex items-center gap-1.5 text-slate-300">
            <CloudSun className="w-3.5 h-3.5 text-amber-400" />
            <span>Global Edition • 22°C Clear</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-semibold tracking-wider uppercase">100% Verified Feeds</span>
          </div>

          <button
            onClick={() => onNavigate(currentView === 'admin' ? 'home' : 'admin')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors text-xs font-medium ${
              currentView === 'admin'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/50'
                : 'bg-blue-950/80 text-blue-300 hover:bg-blue-900/60 border border-blue-800/40'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{currentView === 'admin' ? 'Front Page' : 'Editorial CMS'}</span>
          </button>
        </div>
      </div>

      {/* Main Masthead Banner */}
      <div className="px-4 sm:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Side: Edition Details */}
        <div className="hidden lg:block w-1/4 text-xs text-slate-400">
          <p className="font-serif italic text-blue-300 text-sm">"Veritas et Lux in Mundo"</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Autonomous Ingestion & AI Synthesis</p>
        </div>

        {/* Center: The Grand Masthead */}
        <div className="text-center cursor-pointer group" onClick={() => onNavigate('home')}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-blue-400"></div>
            <span className="text-[10px] tracking-[0.3em] uppercase text-blue-400 font-bold">EST. 2026</span>
            <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-blue-400"></div>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight text-white group-hover:text-blue-200 transition-colors uppercase">
            SRUSTI NEWS
          </h1>
          <p className="text-[11px] sm:text-xs tracking-[0.25em] uppercase text-blue-300/80 font-medium mt-1">
            Modern Newspaper & Verified Real-Time Global Dispatch
          </p>
        </div>

        {/* Right Side: Quick Action Trigger */}
        <div className="w-full md:w-auto lg:w-1/4 flex items-center justify-end gap-3">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 bg-[#1A2B4A]/80 hover:bg-[#1A2B4A] text-slate-300 hover:text-white px-3.5 py-2 rounded-lg border border-blue-800/40 transition-all text-xs w-full sm:w-auto justify-center sm:justify-start shadow-sm"
          >
            <Search className="w-3.5 h-3.5 text-blue-400" />
            <span>Search articles...</span>
            <kbd className="hidden sm:inline-block ml-3 px-1.5 py-0.5 bg-blue-950/60 rounded text-[10px] text-slate-400 border border-blue-900/50">
              /
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
}
