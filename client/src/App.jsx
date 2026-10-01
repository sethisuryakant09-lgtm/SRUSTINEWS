import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ArticleDetail from './pages/ArticleDetail';
import AdminDashboard from './pages/AdminDashboard';
import { Search, X, ArrowRight } from 'lucide-react';
import { getArticles } from './services/api';

export default function App() {
  // Check if initial URL is /admin or #admin
  const getInitialView = () => {
    if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
      return 'admin';
    }
    return 'home';
  };

  const [currentView, setCurrentView] = useState(getInitialView); // 'home' | 'article' | 'admin'
  const [activeArticleSlug, setActiveArticleSlug] = useState(null);
  const [savedArticles, setSavedArticles] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentView('admin');
      } else if (window.location.hash.startsWith('#article/')) {
        const slug = window.location.hash.replace('#article/', '');
        setActiveArticleSlug(slug);
        setCurrentView('article');
      } else if (!window.location.hash || window.location.hash === '#home') {
        setCurrentView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Load saved articles from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dc_saved_articles');
      if (stored) {
        setSavedArticles(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  // Keyboard shortcut '/' to open search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && !isSearchOpen && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Live search debounced
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await getArticles({ search: searchQuery, limit: 6 });
        setSearchResults(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleToggleSave = (article) => {
    setSavedArticles((prev) => {
      const exists = prev.some((a) => a.id === article.id);
      let updated;
      if (exists) {
        updated = prev.filter((a) => a.id !== article.id);
      } else {
        updated = [...prev, article];
      }
      try {
        localStorage.setItem('dc_saved_articles', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleSelectArticle = (slug) => {
    setActiveArticleSlug(slug);
    setCurrentView('article');
    window.location.hash = `#article/${slug}`;
    setIsSearchOpen(false);
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    if (view === 'home') {
      setActiveArticleSlug(null);
      window.location.hash = '';
    } else if (view === 'admin') {
      window.location.hash = 'admin';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A1628] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* If currentView is 'admin', render dedicated standalone Admin Panel */}
      {currentView === 'admin' ? (
        <AdminDashboard
          onBack={() => handleNavigate('home')}
          onSelectArticle={handleSelectArticle}
        />
      ) : (
        <>
          {/* Public Newspaper Masthead & Top Navigation */}
          <Header
            onOpenSearch={() => setIsSearchOpen(true)}
            onNavigate={handleNavigate}
            currentView={currentView}
            savedCount={savedArticles.length}
          />

          {/* Public Newspaper Pages */}
          <div className="flex-1">
            {currentView === 'home' && (
              <HomePage
                onSelectArticle={handleSelectArticle}
                savedArticles={savedArticles}
                onToggleSave={handleToggleSave}
              />
            )}

            {currentView === 'article' && (
              <ArticleDetail
                slug={activeArticleSlug}
                onBack={() => handleNavigate('home')}
                onSelectArticle={handleSelectArticle}
                isSaved={savedArticles.some((a) => a.slug === activeArticleSlug)}
                onToggleSave={handleToggleSave}
              />
            )}
          </div>

          {/* Global Public Newspaper Footer */}
          <Footer
            onSelectCategory={(category) => {
              handleNavigate('home');
            }}
            onNavigate={handleNavigate}
          />
        </>
      )}

      {/* Global Quick Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0F1E36] border border-blue-800/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-slide-up">
            <div className="p-4 border-b border-blue-900/60 flex items-center gap-3">
              <Search className="w-5 h-5 text-blue-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search headline, category, topic..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-lg hover:bg-blue-900/50 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-96 overflow-y-auto p-2 divide-y divide-blue-950/80">
              {isSearching ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Searching global database...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectArticle(item.slug)}
                    className="p-3 hover:bg-blue-950/60 rounded-xl cursor-pointer flex items-center justify-between gap-3 group transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="font-bold uppercase text-blue-400">
                          {item.category?.name || 'World'}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{item.readTime || 3} min read</span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-slate-200 group-hover:text-blue-300 transition-colors line-clamp-1">
                        {item.title}
                      </h4>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))
              ) : searchQuery ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No dispatches matching "<span className="text-white">{searchQuery}</span>"
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  Search across verified global news feeds, AI summaries, and archived topics.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
