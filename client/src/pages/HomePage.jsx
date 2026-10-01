import React, { useState, useEffect } from 'react';
import HeroBanner from '../components/HeroBanner';
import Ticker from '../components/Ticker';
import CategoryNav from '../components/CategoryNav';
import FilterBar from '../components/FilterBar';
import ArticleCard from '../components/ArticleCard';
import TrendingSidebar from '../components/TrendingSidebar';
import { getArticles, getBreakingArticles, getFeaturedArticles, getTrendingArticles, getCategories, getSources } from '../services/api';
import { RefreshCw, Newspaper, AlertCircle } from 'lucide-react';

export default function HomePage({ onSelectArticle, savedArticles = [], onToggleSave }) {
  const [articles, setArticles] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [breaking, setBreaking] = useState([]);
  const [trending, setTrending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [maxReadTime, setMaxReadTime] = useState('');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch initial hero, breaking, and categories
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [featData, breakData, trendData, catData, srcData] = await Promise.all([
          getFeaturedArticles().catch(() => []),
          getBreakingArticles().catch(() => []),
          getTrendingArticles().catch(() => []),
          getCategories().catch(() => []),
          getSources().catch(() => [])
        ]);
        setFeatured(featData);
        setBreaking(breakData);
        setTrending(trendData);
        setCategories(catData);
        setSources(srcData);
      } catch (err) {
        console.error('Error fetching initial page data:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch articles feed when filters change
  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getArticles({
          category: selectedCategory,
          search,
          source: selectedSource,
          maxReadTime: maxReadTime || undefined,
          sort,
          page,
          limit: 12
        });
        setArticles(res.data || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
        }
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Failed to load articles. Please check the backend connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [selectedCategory, search, selectedSource, maxReadTime, sort, page]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearch('');
    setSelectedSource('');
    setMaxReadTime('');
    setSort('latest');
    setPage(1);
  };

  const isArticleSaved = (id) => savedArticles.some((item) => item.id === id);

  return (
    <div className="min-h-screen">
      {/* Hero Banner (Only when on front page without active search) */}
      {!search && selectedCategory === 'all' && featured.length > 0 && (
        <HeroBanner featuredStories={featured} onSelectArticle={onSelectArticle} />
      )}

      {/* Breaking News Ticker */}
      <Ticker breakingStories={breaking} onSelectArticle={onSelectArticle} />

      {/* Sticky Category Navigation */}
      <CategoryNav
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(slug) => {
          setSelectedCategory(slug);
          setPage(1);
        }}
      />

      {/* Main Grid Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Filter & Live Search Bar */}
        <FilterBar
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          sources={sources}
          selectedSource={selectedSource}
          onSourceChange={(val) => {
            setSelectedSource(val);
            setPage(1);
          }}
          sort={sort}
          onSortChange={(val) => {
            setSort(val);
            setPage(1);
          }}
          maxReadTime={maxReadTime}
          onMaxReadTimeChange={(val) => {
            setMaxReadTime(val);
            setPage(1);
          }}
          onReset={handleResetFilters}
        />

        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-blue-900/60 pb-3 mb-6">
          <div className="flex items-center gap-2.5">
            <Newspaper className="w-5 h-5 text-blue-400" />
            <h2 className="font-serif font-black text-xl sm:text-2xl text-white tracking-tight uppercase">
              {selectedCategory === 'all' ? 'Latest Global Dispatches' : `${selectedCategory} Edition`}
            </h2>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            {articles.length} stories displayed
          </span>
        </div>

        {/* Content Layout: Main Grid (8 cols) + Trending Sidebar (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Articles Feed */}
          <div className="lg:col-span-8">
            {loading ? (
              /* Skeleton Loader */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-[#0F1E36] rounded-xl border border-blue-900/40 p-4 space-y-3 animate-pulse">
                    <div className="h-44 bg-blue-950/80 rounded-lg w-full" />
                    <div className="h-3 bg-blue-900/60 rounded w-1/3" />
                    <div className="h-5 bg-blue-900/80 rounded w-4/5" />
                    <div className="h-3 bg-blue-900/50 rounded w-full" />
                    <div className="h-3 bg-blue-900/50 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-8 rounded-xl bg-red-950/30 border border-red-800/40 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                <p className="text-sm text-red-300">{error}</p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold text-white"
                >
                  Reload Dispatches
                </button>
              </div>
            ) : articles.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-[#0F1E36] border border-blue-900/40 space-y-3">
                <p className="text-slate-300 font-serif text-lg">No matching dispatches found.</p>
                <p className="text-xs text-slate-400">Try adjusting your search terms or filter selections.</p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold text-white mt-2"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onSelectArticle={onSelectArticle}
                    isSaved={isArticleSaved(article.id)}
                    onToggleSave={onToggleSave}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3.5 py-1.5 rounded-lg border border-blue-900/60 text-xs font-medium text-slate-300 hover:bg-blue-950/60 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-xs text-slate-400 font-mono">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3.5 py-1.5 rounded-lg border border-blue-900/60 text-xs font-medium text-slate-300 hover:bg-blue-950/60 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Trending Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <TrendingSidebar trendingArticles={trending} onSelectArticle={onSelectArticle} />

            {/* Verified Syndication Callout */}
            <div className="bg-[#0A1628] rounded-xl border border-blue-800/40 p-5 space-y-3">
              <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider">
                Autonomous Verification
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                SRUSTI NEWS crawls global news wires every 15 minutes, filtering entries with SHA-256 duplicate guards and credibility evaluations.
              </p>
              <div className="pt-1 flex items-center justify-between text-[11px] text-blue-400 font-medium">
                <span>Next ingestion cycle:</span>
                <span className="font-mono text-emerald-400">Scheduled</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
