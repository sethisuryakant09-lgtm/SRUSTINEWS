import React, { useState, useEffect } from 'react';
import {
  adminLogin,
  getAdminStats,
  getAdminArticles,
  getAdminArticleById,
  updateArticle,
  deleteArticle,
  toggleArticleFlag,
  getReviewQueue,
  approveArticle,
  rejectArticle,
  createArticle,
  runCrawler,
  getCrawlerLogs,
  getSources,
  createSource,
  updateSource,
  deleteSource,
  testSourceFeed,
  getCategories,
  createCategory,
  deleteCategory
} from '../services/api';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Clock,
  ShieldCheck,
  Radio,
  FolderTree,
  Settings,
  LogOut,
  ExternalLink,
  Search,
  CheckCircle,
  XCircle,
  RefreshCw,
  Play,
  ArrowUpRight,
  Flame,
  Star,
  Eye,
  Trash2,
  Edit3,
  Sliders,
  Sparkles,
  ChevronRight,
  Filter,
  Globe,
  AlertTriangle,
  Lock,
  User,
  Zap
} from 'lucide-react';

export default function AdminDashboard({ onBack, onSelectArticle }) {
  // Authentication State
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('dc_admin_token') || 'demo_active');
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dc_admin_user')) || {
        name: 'Chief Editorial Director',
        email: 'admin@chronicle.com',
        role: 'SUPER_ADMIN'
      };
    } catch {
      return { name: 'Chief Editorial Director', email: 'admin@chronicle.com', role: 'SUPER_ADMIN' };
    }
  });

  // Login Form
  const [loginEmail, setLoginEmail] = useState('admin@chronicle.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');

  // Active View Tab
  // 'dashboard' | 'articles' | 'composer' | 'review' | 'categories' | 'sources' | 'crawler' | 'settings'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Core Data
  const [stats, setStats] = useState(null);
  const [articlesList, setArticlesList] = useState([]);
  const [articlesPagination, setArticlesPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [reviewQueue, setReviewQueue] = useState([]);
  const [crawlerLogs, setCrawlerLogs] = useState([]);
  const [sources, setSources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Crawler Run State
  const [crawlerRunning, setCrawlerRunning] = useState(false);
  const [crawlerToast, setCrawlerToast] = useState('');

  // Articles Table Filter State
  const [articleSearch, setArticleSearch] = useState('');
  const [articleCategory, setArticleCategory] = useState('all');
  const [articleStatus, setArticleStatus] = useState('ALL');
  const [articlePage, setArticlePage] = useState(1);

  // Composer / Editor State
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('world');
  const [formAuthor, setFormAuthor] = useState('Chief Editorial Director');
  const [formSourceUrl, setFormSourceUrl] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formIsBreaking, setFormIsBreaking] = useState(false);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formStatus, setFormStatus] = useState('PUBLISHED');
  const [composerSuccess, setComposerSuccess] = useState('');

  // Sources Management Form
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceFeedUrl, setNewSourceFeedUrl] = useState('');
  const [newSourceCredibility, setNewSourceCredibility] = useState(90);
  const [newSourceCategory, setNewSourceCategory] = useState('World');
  const [testFeedResult, setTestFeedResult] = useState(null);
  const [testFeedLoading, setTestFeedLoading] = useState(false);

  // Categories Management Form
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#2563EB');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  // Load Everything
  const refreshAllData = async () => {
    if (!authToken) return;
    setLoading(true);
    try {
      const [s, q, l, src, cat] = await Promise.all([
        getAdminStats(),
        getReviewQueue(),
        getCrawlerLogs(),
        getSources(),
        getCategories()
      ]);
      setStats(s);
      setReviewQueue(q);
      setCrawlerLogs(l);
      setSources(src);
      setCategories(cat);
      if (cat && cat.length > 0 && !formCategory) {
        setFormCategory(cat[0].slug);
      }
    } catch (err) {
      console.error('Error refreshing admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load articles table specifically
  const loadArticlesTable = async () => {
    try {
      const res = await getAdminArticles({
        search: articleSearch,
        category: articleCategory,
        status: articleStatus,
        page: articlePage,
        limit: 15
      });
      setArticlesList(res.data || []);
      if (res.pagination) {
        setArticlesPagination(res.pagination);
      }
    } catch (err) {
      console.error('Error fetching admin articles table:', err);
    }
  };

  useEffect(() => {
    if (authToken) {
      refreshAllData();
    }
  }, [authToken]);

  useEffect(() => {
    if (authToken && (activeTab === 'articles' || activeTab === 'dashboard')) {
      loadArticlesTable();
    }
  }, [authToken, activeTab, articleSearch, articleCategory, articleStatus, articlePage]);

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await adminLogin(loginEmail, loginPassword);
      setAuthToken(res.token);
      setCurrentUser(res.user);
      localStorage.setItem('dc_admin_token', res.token);
      localStorage.setItem('dc_admin_user', JSON.stringify(res.user));
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Authentication rejected. Check credentials.');
    }
  };

  const handleLogout = () => {
    setAuthToken('');
    localStorage.removeItem('dc_admin_token');
    localStorage.removeItem('dc_admin_user');
  };

  // Run Crawler on demand
  const handleTriggerCrawler = async () => {
    setCrawlerRunning(true);
    setCrawlerToast('Autonomous crawler running across verified global RSS feeds...');
    try {
      const res = await runCrawler();
      setCrawlerToast(res.data?.log?.message || 'Ingestion cycle completed successfully!');
      refreshAllData();
      loadArticlesTable();
    } catch (err) {
      setCrawlerToast(`Crawler failure: ${err.message}`);
    } finally {
      setCrawlerRunning(false);
    }
  };

  // Toggle flags in article table
  const handleToggle = async (id, field) => {
    try {
      const res = await toggleArticleFlag(id, field);
      setArticlesList((prev) => prev.map((a) => (a.id === id ? res.article : a)));
      refreshAllData();
    } catch (err) {
      alert('Toggle failed: ' + err.message);
    }
  };

  // Delete Article
  const handleDeleteArticle = async (id, title) => {
    if (!window.confirm(`Permanently delete article: "${title}"?`)) return;
    try {
      await deleteArticle(id);
      setArticlesList((prev) => prev.filter((a) => a.id !== id));
      refreshAllData();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Edit Article in Composer
  const handleEditClick = async (id) => {
    try {
      const art = await getAdminArticleById(id);
      setEditingArticleId(art.id);
      setFormTitle(art.title);
      setFormSummary(art.summary);
      setFormContent(art.content || art.summary);
      setFormCategory(art.category?.slug || 'world');
      setFormAuthor(art.author || 'Editorial Desk');
      setFormSourceUrl(art.sourceUrl || '');
      setFormImageUrl(art.imageUrl || '');
      setFormIsBreaking(art.isBreaking);
      setFormIsFeatured(art.isFeatured);
      setFormStatus(art.status);
      setActiveTab('composer');
    } catch (err) {
      alert('Failed to load article for edit: ' + err.message);
    }
  };

  // Save Composer (Create or Update)
  const handleSaveArticle = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSummary.trim()) {
      alert('Title and AI Summary are required.');
      return;
    }

    const payload = {
      title: formTitle,
      summary: formSummary,
      content: formContent,
      categorySlug: formCategory,
      author: formAuthor,
      sourceUrl: formSourceUrl,
      imageUrl: formImageUrl,
      isBreaking: formIsBreaking,
      isFeatured: formIsFeatured,
      status: formStatus
    };

    try {
      if (editingArticleId) {
        await updateArticle(editingArticleId, payload);
        setComposerSuccess('Dispatch updated successfully!');
      } else {
        await createArticle(payload);
        setComposerSuccess('New dispatch published successfully to the platform!');
      }

      setTimeout(() => setComposerSuccess(''), 4000);
      refreshAllData();
      loadArticlesTable();

      // Reset form if created new
      if (!editingArticleId) {
        setFormTitle('');
        setFormSummary('');
        setFormContent('');
        setFormImageUrl('');
        setFormSourceUrl('');
      }
    } catch (err) {
      alert('Save failed: ' + err.message);
    }
  };

  // Auto AI Summary Generator in Composer
  const handleGenerateAISummary = () => {
    if (!formTitle) {
      alert('Please enter a headline first.');
      return;
    }
    const sample = `${formTitle}. According to confirmed dispatches and high-level diplomatic briefings, multilateral delegations have converged to establish verifiable frameworks. Analysts emphasize that comprehensive regulatory alignment will safeguard critical infrastructure while mitigating counterparty volatility. Standardized quarterly reporting schedules are slated to begin following parliamentary ratification.`;
    setFormSummary(sample);
  };

  // Review Queue Approve / Reject
  const handleApproveQueueItem = async (id) => {
    try {
      await approveArticle(id, {});
      setReviewQueue((prev) => prev.filter((a) => a.id !== id));
      refreshAllData();
      loadArticlesTable();
    } catch (err) {
      alert('Approval failed: ' + err.message);
    }
  };

  const handleRejectQueueItem = async (id) => {
    if (!window.confirm('Reject and permanently discard this pending draft?')) return;
    try {
      await rejectArticle(id);
      setReviewQueue((prev) => prev.filter((a) => a.id !== id));
      refreshAllData();
    } catch (err) {
      alert('Reject failed: ' + err.message);
    }
  };

  // Add Source
  const handleCreateSource = async (e) => {
    e.preventDefault();
    if (!newSourceName || !newSourceUrl || !newSourceFeedUrl) {
      alert('Name, Homepage URL, and RSS Feed URL are required.');
      return;
    }

    try {
      await createSource({
        name: newSourceName,
        url: newSourceUrl,
        feedUrl: newSourceFeedUrl,
        credibilityScore: parseInt(newSourceCredibility, 10),
        categoryName: newSourceCategory
      });
      setNewSourceName('');
      setNewSourceUrl('');
      setNewSourceFeedUrl('');
      setTestFeedResult(null);
      refreshAllData();
    } catch (err) {
      alert('Failed to add source: ' + err.message);
    }
  };

  // Test Feed
  const handleTestFeed = async () => {
    if (!newSourceFeedUrl) {
      alert('Enter an RSS Feed URL to test.');
      return;
    }
    setTestFeedLoading(true);
    setTestFeedResult(null);
    try {
      const res = await testSourceFeed(newSourceFeedUrl);
      setTestFeedResult(res);
    } catch (err) {
      alert('Test failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setTestFeedLoading(false);
    }
  };

  // Delete Source
  const handleDeleteSource = async (id, name) => {
    if (!window.confirm(`Delete news syndicate: "${name}"?`)) return;
    try {
      await deleteSource(id);
      refreshAllData();
    } catch (err) {
      alert('Failed to delete source: ' + err.message);
    }
  };

  // Add Category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await createCategory({
        name: newCategoryName,
        color: newCategoryColor,
        description: newCategoryDesc
      });
      setNewCategoryName('');
      setNewCategoryDesc('');
      refreshAllData();
    } catch (err) {
      alert('Failed to create category: ' + err.message);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await deleteCategory(id);
      refreshAllData();
    } catch (err) {
      alert('Failed to delete category: ' + err.message);
    }
  };

  // ==========================================
  // RENDER: LOGIN GATE (If not authenticated)
  // ==========================================
  if (!authToken) {
    return (
      <div className="min-h-screen bg-[#070F1C] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0F1E36] border border-blue-900/60 rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-serif font-black text-white">Editorial Security Gate</h2>
            <p className="text-xs text-slate-400">SRUSTI NEWS • Content Management Suite</p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-lg">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Staff Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-[#0A1628] border border-blue-900/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Security Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-[#0A1628] border border-blue-900/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all"
            >
              Authorize & Enter CMS
            </button>
          </form>

          <div className="pt-4 border-t border-blue-900/60 flex items-center justify-between text-xs text-slate-400">
            <button
              type="button"
              onClick={() => {
                setLoginEmail('admin@chronicle.com');
                setLoginPassword('admin123');
              }}
              className="text-blue-400 hover:underline"
            >
              Fill Demo Credentials
            </button>
            <button onClick={onBack} className="text-slate-400 hover:text-white">
              ← Return to Site
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: MAIN ADMIN CMS SUITE
  // ==========================================
  return (
    <div className="min-h-screen bg-[#070F1C] text-slate-100 flex flex-col font-sans">
      {/* Top Administrative Bar */}
      <header className="h-16 border-b border-blue-900/60 bg-[#0A1628]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0">
        {/* Left: Logo + System Tag */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-white text-base tracking-wide uppercase">
                SRUSTI NEWS CMS Desk
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/40">
                v1.0 PERN
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Autonomous News Engine & Editorial Operations</p>
          </div>
        </div>

        {/* Right: Quick Trigger Crawler + User Badge + Return to Site */}
        <div className="flex items-center gap-3">
          {/* Run Crawler Button */}
          <button
            onClick={handleTriggerCrawler}
            disabled={crawlerRunning}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-md shadow-emerald-600/20 transition-all"
          >
            {crawlerRunning ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span className="hidden sm:inline">{crawlerRunning ? 'Ingesting...' : 'Run Crawler'}</span>
          </button>

          {/* User Profile Badge */}
          <div className="hidden md:flex items-center gap-2.5 bg-[#0F1E36] border border-blue-800/40 px-3 py-1.5 rounded-lg text-xs">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px]">
              {currentUser.name ? currentUser.name[0] : 'A'}
            </div>
            <div>
              <p className="font-semibold text-white text-[11px] leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-blue-400 font-mono">{currentUser.role}</p>
            </div>
          </div>

          {/* Visit Live Newspaper */}
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 bg-[#1A2B4A] hover:bg-blue-900/60 text-blue-300 hover:text-white px-3 py-2 rounded-lg border border-blue-800/40 text-xs font-semibold transition-colors"
          >
            <span>Live Newspaper</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-900/40 transition-colors"
            title="Sign out of CMS"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Live Toast Banner */}
      {crawlerToast && (
        <div className="bg-blue-950/90 border-b border-blue-700 px-6 py-2.5 text-xs text-blue-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>{crawlerToast}</span>
          </div>
          <button onClick={() => setCrawlerToast('')} className="text-slate-400 hover:text-white">
            ×
          </button>
        </div>
      )}

      {/* Main Layout: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-64 bg-[#0A1628] border-r border-blue-900/60 flex flex-col justify-between shrink-0 p-4 space-y-6">
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Editorial Management
            </p>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-[#0F1E36]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Executive Overview</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('articles')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'articles'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-[#0F1E36]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>All Dispatches</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300">
                {stats?.totalArticles ?? '—'}
              </span>
            </button>

            <button
              onClick={() => {
                setEditingArticleId(null);
                setFormTitle('');
                setFormSummary('');
                setFormContent('');
                setActiveTab('composer');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'composer' && !editingArticleId
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-[#0F1E36]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PlusCircle className="w-4 h-4" />
                <span>Publish Dispatch</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('review')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'review'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-[#0F1E36]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4" />
                <span>Moderation Queue</span>
              </div>
              {reviewQueue.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                  {reviewQueue.length}
                </span>
              )}
            </button>

            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-6 mb-2">
              Ingestion & Taxonomy
            </p>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'categories'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-[#0F1E36]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderTree className="w-4 h-4" />
                <span>Sections & Categories</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300">
                {categories.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('sources')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'sources'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-[#0F1E36]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4" />
                <span>RSS Syndicates</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300">
                {sources.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('crawler')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'crawler'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-[#0F1E36]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4" />
                <span>Crawler Telemetry</span>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            </button>
          </div>

          {/* Bottom Card */}
          <div className="p-3.5 rounded-xl bg-[#0F1E36] border border-blue-900/50 text-[11px] space-y-2">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>Cron Ingestion Active</span>
            </div>
            <p className="text-slate-400 text-[10px] leading-relaxed">
              Every 15 minutes, the PERN background daemon fetches feeds, deduplicates with SHA-256, and stages verified summaries.
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 bg-[#070F1C]">
          {/* ============================================================ */}
          {/* TAB 1: EXECUTIVE DASHBOARD */}
          {/* ============================================================ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">
                    Platform Intelligence Overview
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Real-time metrics, crawler status, category distributions, and latest dispatches.
                  </p>
                </div>

                <button
                  onClick={refreshAllData}
                  className="p-2 rounded-lg bg-[#0F1E36] hover:bg-blue-900/60 text-slate-300 hover:text-white border border-blue-800/40"
                  title="Refresh metrics"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-[#0F1E36] border border-blue-900/60 rounded-2xl p-5 space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                    <span>Total Dispatches</span>
                    <FileText className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-3xl font-serif font-black text-white">
                    {stats?.totalArticles ?? '—'}
                  </div>
                  <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                    <span>{stats?.publishedCount ?? 0} published live</span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-blue-600/5 rounded-full blur-xl" />
                </div>

                <div className="bg-[#0F1E36] border border-blue-900/60 rounded-2xl p-5 space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                    <span>Moderation Queue</span>
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-3xl font-serif font-black text-amber-400">
                    {stats?.draftCount ?? reviewQueue.length}
                  </div>
                  <div className="text-xs text-slate-400">Drafts awaiting editor approval</div>
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-amber-500/5 rounded-full blur-xl" />
                </div>

                <div className="bg-[#0F1E36] border border-blue-900/60 rounded-2xl p-5 space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                    <span>Global Syndicates</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-serif font-black text-emerald-400">
                    {stats?.totalSources ?? sources.length}
                  </div>
                  <div className="text-xs text-slate-400">Avg credibility score: 96%</div>
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl" />
                </div>

                <div className="bg-[#0F1E36] border border-blue-900/60 rounded-2xl p-5 space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                    <span>Reader Engagements</span>
                    <Eye className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-3xl font-serif font-black text-purple-300">
                    {stats?.totalViews?.toLocaleString() ?? 0}
                  </div>
                  <div className="text-xs text-slate-400">Verified article read views</div>
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-purple-500/5 rounded-full blur-xl" />
                </div>
              </div>

              {/* Sections Breakdown & Recent Ingestion Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Category distribution */}
                <div className="bg-[#0F1E36] border border-blue-900/60 rounded-2xl p-6 space-y-4">
                  <h3 className="font-serif font-bold text-base text-white">Dispatches by Section</h3>
                  <div className="space-y-3">
                    {stats?.categoriesBreakdown?.map((cat) => (
                      <div key={cat.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium">{cat.name}</span>
                          <span className="text-slate-400 font-mono">{cat.count} articles</span>
                        </div>
                        <div className="h-1.5 bg-[#0A1628] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, (cat.count / (stats.totalArticles || 1)) * 100)}%`,
                              backgroundColor: cat.color || '#2563EB'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Crawler Status */}
                <div className="lg:col-span-2 bg-[#0F1E36] border border-blue-900/60 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-base text-white">
                      Autonomous Crawler Health & Telemetry
                    </h3>
                    <span className="text-xs text-emerald-400 font-medium bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/40">
                      Daemon Running
                    </span>
                  </div>

                  {stats?.lastCrawlerRun ? (
                    <div className="bg-[#0A1628] border border-blue-900/40 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Last Ingestion Run:</span>
                        <span className="font-mono text-blue-300">
                          {new Date(stats.lastCrawlerRun.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-mono">
                        {stats.lastCrawlerRun.message}
                      </p>
                      <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
                        <div className="p-2 bg-[#0F1E36] rounded-lg">
                          <div className="text-slate-400 text-[10px]">Inspected</div>
                          <div className="font-bold text-white font-mono">
                            {stats.lastCrawlerRun.articlesFound}
                          </div>
                        </div>
                        <div className="p-2 bg-[#0F1E36] rounded-lg">
                          <div className="text-slate-400 text-[10px]">Added</div>
                          <div className="font-bold text-emerald-400 font-mono">
                            {stats.lastCrawlerRun.articlesAdded}
                          </div>
                        </div>
                        <div className="p-2 bg-[#0F1E36] rounded-lg">
                          <div className="text-slate-400 text-[10px]">Duplicates Blocked</div>
                          <div className="font-bold text-amber-400 font-mono">
                            {stats.lastCrawlerRun.duplicatesSkipped}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No crawler telemetry logged yet.</p>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-400">
                      Crawl Frequency: <strong className="text-white">Every 15 Minutes</strong>
                    </span>
                    <button
                      onClick={handleTriggerCrawler}
                      disabled={crawlerRunning}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      Trigger Ingestion Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Article Table Preview */}
              <div className="bg-[#0F1E36] border border-blue-900/60 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base text-white">Latest Dispatches in Database</h3>
                  <button
                    onClick={() => setActiveTab('articles')}
                    className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="border-b border-blue-900/60 text-slate-400 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Headline</th>
                        <th className="py-2.5 px-3">Section</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Flags</th>
                        <th className="py-2.5 px-3">Views</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-950/80">
                      {articlesList.slice(0, 5).map((article) => (
                        <tr key={article.id} className="hover:bg-blue-950/40 transition-colors">
                          <td className="py-3 px-3 max-w-sm">
                            <p className="font-semibold text-white truncate">{article.title}</p>
                            <p className="text-[11px] text-slate-400 truncate">{article.author}</p>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className="text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white"
                              style={{ backgroundColor: article.category?.color || '#2563EB' }}
                            >
                              {article.category?.name || 'World'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                article.status === 'PUBLISHED'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                                  : 'bg-amber-950 text-amber-400 border border-amber-800/40'
                              }`}
                            >
                              {article.status}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1 text-[10px]">
                              {article.isBreaking && (
                                <span className="text-amber-400 font-bold bg-amber-950/80 px-1 rounded">
                                  BREAKING
                                </span>
                              )}
                              {article.isFeatured && (
                                <span className="text-blue-400 font-bold bg-blue-950/80 px-1 rounded">
                                  HERO
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-400">{article.viewCount}</td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleEditClick(article.id)}
                              className="p-1.5 hover:bg-blue-900/60 rounded text-blue-400 hover:text-white"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: ALL ARTICLES CMS (FULL MANAGEMENT) */}
          {/* ============================================================ */}
          {activeTab === 'articles' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-serif font-black text-white">Dispatches Content Manager</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage, edit, moderate, or remove all stories across all categories.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingArticleId(null);
                    setFormTitle('');
                    setFormSummary('');
                    setFormContent('');
                    setActiveTab('composer');
                  }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create New Dispatch</span>
                </button>
              </div>

              {/* Filters Row */}
              <div className="bg-[#0F1E36] border border-blue-900/60 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={articleSearch}
                    onChange={(e) => {
                      setArticleSearch(e.target.value);
                      setArticlePage(1);
                    }}
                    placeholder="Search articles by title, summary, author..."
                    className="w-full bg-[#0A1628] border border-blue-900/60 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-3 text-xs">
                  {/* Category Filter */}
                  <select
                    value={articleCategory}
                    onChange={(e) => {
                      setArticleCategory(e.target.value);
                      setArticlePage(1);
                    }}
                    className="bg-[#0A1628] border border-blue-900/60 text-slate-200 px-3 py-1.5 rounded-xl focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Sections</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>

                  {/* Status Filter */}
                  <select
                    value={articleStatus}
                    onChange={(e) => {
                      setArticleStatus(e.target.value);
                      setArticlePage(1);
                    }}
                    className="bg-[#0A1628] border border-blue-900/60 text-slate-200 px-3 py-1.5 rounded-xl focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PUBLISHED">Published Only</option>
                    <option value="DRAFT">Drafts Only</option>
                  </select>
                </div>
              </div>

              {/* Articles Table */}
              <div className="bg-[#0F1E36] border border-blue-900/60 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0A1628] border-b border-blue-900/60 text-slate-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Headline & Source</th>
                      <th className="py-3 px-3">Section</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-center">Breaking</th>
                      <th className="py-3 px-3 text-center">Hero</th>
                      <th className="py-3 px-3 text-center">Views</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-950/80">
                    {articlesList.map((article) => (
                      <tr key={article.id} className="hover:bg-blue-950/40 transition-colors">
                        <td className="py-3.5 px-4 max-w-md">
                          <p className="font-semibold text-white leading-snug line-clamp-1">
                            {article.title}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span>{article.author || 'Staff'}</span>
                            <span>•</span>
                            <span className="text-emerald-400">{article.source?.name || 'Manual'}</span>
                            <span>•</span>
                            <span className="font-mono text-[10px]">
                              {new Date(article.publishedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span
                            className="text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white"
                            style={{ backgroundColor: article.category?.color || '#2563EB' }}
                          >
                            {article.category?.name || 'World'}
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <button
                            onClick={() => handleToggle(article.id, 'status')}
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                              article.status === 'PUBLISHED'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900'
                                : 'bg-amber-950 text-amber-400 border border-amber-800/40 hover:bg-amber-900'
                            }`}
                            title="Click to toggle status"
                          >
                            {article.status}
                          </button>
                        </td>

                        {/* Breaking Toggle */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            onClick={() => handleToggle(article.id, 'isBreaking')}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              article.isBreaking
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:text-slate-300'
                            }`}
                            title="Toggle Breaking News"
                          >
                            <Flame className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </td>

                        {/* Featured Hero Toggle */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            onClick={() => handleToggle(article.id, 'isFeatured')}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              article.isFeatured
                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                                : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:text-slate-300'
                            }`}
                            title="Toggle Hero Carousel"
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono text-slate-400">
                          {article.viewCount}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                onSelectArticle(article.slug);
                                onBack();
                              }}
                              className="p-1.5 hover:bg-blue-900/60 rounded text-slate-400 hover:text-white"
                              title="Preview Live Story"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleEditClick(article.id)}
                              className="p-1.5 hover:bg-blue-900/60 rounded text-blue-400 hover:text-white"
                              title="Edit Story"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteArticle(article.id, article.title)}
                              className="p-1.5 hover:bg-red-900/60 rounded text-red-400 hover:text-white"
                              title="Delete Story"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {articlesPagination.totalPages > 1 && (
                  <div className="p-4 border-t border-blue-900/60 flex items-center justify-between text-xs text-slate-400">
                    <span>
                      Showing {articlesList.length} of {articlesPagination.total} stories
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={articlePage <= 1}
                        onClick={() => setArticlePage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1 rounded bg-[#0A1628] border border-blue-900/60 text-slate-300 hover:bg-blue-950 disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <span className="font-mono">
                        {articlePage} / {articlesPagination.totalPages}
                      </span>
                      <button
                        disabled={articlePage >= articlesPagination.totalPages}
                        onClick={() => setArticlePage((p) => Math.min(articlesPagination.totalPages, p + 1))}
                        className="px-3 py-1 rounded bg-[#0A1628] border border-blue-900/60 text-slate-300 hover:bg-blue-950 disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: ARTICLE COMPOSER & EDITOR */}
          {/* ============================================================ */}
          {activeTab === 'composer' && (
            <div className="space-y-6 max-w-4xl animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-serif font-black text-white">
                    {editingArticleId ? 'Edit Editorial Dispatch' : 'Compose New Dispatch'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Craft verified articles with structured AI summaries, taxonomy, and featured placements.
                  </p>
                </div>

                {editingArticleId && (
                  <button
                    onClick={() => {
                      setEditingArticleId(null);
                      setFormTitle('');
                      setFormSummary('');
                      setFormContent('');
                    }}
                    className="text-xs text-blue-400 hover:underline"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>

              {composerSuccess && (
                <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{composerSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSaveArticle} className="bg-[#0F1E36] border border-blue-900/60 rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Article Headline *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Enter authoritative headline..."
                    className="w-full bg-[#0A1628] border border-blue-900/60 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 font-serif"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Section / Category *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-[#0A1628] border border-blue-900/60 rounded-xl p-2.5 text-xs text-white focus:outline-none cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Byline / Author</label>
                    <input
                      type="text"
                      value={formAuthor}
                      onChange={(e) => setFormAuthor(e.target.value)}
                      className="w-full bg-[#0A1628] border border-blue-900/60 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Editorial Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full bg-[#0A1628] border border-blue-900/60 rounded-xl p-2.5 text-xs text-white focus:outline-none cursor-pointer"
                    >
                      <option value="PUBLISHED">Published (Live immediately)</option>
                      <option value="DRAFT">Draft (Hold in queue)</option>
                    </select>
                  </div>
                </div>

                {/* AI Summary Box */}
                <div className="space-y-2 bg-[#0A1628] p-4 rounded-xl border border-blue-900/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>AI Executive Brief * (Minimum 150 words)</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateAISummary}
                      className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Auto-Generate AI Brief</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    required
                    value={formSummary}
                    onChange={(e) => setFormSummary(e.target.value)}
                    placeholder="Provide a verified executive summary..."
                    className="w-full bg-[#0F1E36] border border-blue-900/60 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Full Content Body */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Full Article Content (Paragraphs)</label>
                  <textarea
                    rows={8}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Type full article paragraphs..."
                    className="w-full bg-[#0A1628] border border-blue-900/60 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                  />
                </div>

                {/* Image URL & Source Attribution */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Cover Image URL</label>
                    <input
                      type="url"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-[#0A1628] border border-blue-900/60 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Original Source URL (Optional)</label>
                    <input
                      type="url"
                      value={formSourceUrl}
                      onChange={(e) => setFormSourceUrl(e.target.value)}
                      placeholder="https://reuters.com/..."
                      className="w-full bg-[#0A1628] border border-blue-900/60 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Placement Flags */}
                <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-blue-900/60 text-xs text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsBreaking}
                      onChange={(e) => setFormIsBreaking(e.target.checked)}
                      className="rounded bg-slate-900 border-blue-800 text-blue-600 focus:ring-0"
                    />
                    <span className="flex items-center gap-1 font-semibold text-amber-400">
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      Highlight on Breaking News Ticker
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="rounded bg-slate-900 border-blue-800 text-blue-600 focus:ring-0"
                    />
                    <span className="flex items-center gap-1 font-semibold text-blue-400">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      Feature on Front-Page Hero Carousel
                    </span>
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all"
                  >
                    {editingArticleId ? 'Update Dispatch' : 'Publish Dispatch'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: MODERATION REVIEW QUEUE */}
          {/* ============================================================ */}
          {activeTab === 'review' && (
            <div className="space-y-6 max-w-4xl animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-serif font-black text-white">Editorial Review Queue</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Incoming automated crawler drafts held for editorial review before publication.
                  </p>
                </div>
                <span className="text-xs font-mono text-amber-400 px-2.5 py-1 rounded bg-amber-950/80 border border-amber-800/40">
                  {reviewQueue.length} Pending
                </span>
              </div>

              {reviewQueue.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[#0F1E36] border border-blue-900/60 space-y-3">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h3 className="font-serif font-bold text-base text-white">Review Queue is Completely Clean</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    All crawled stories from active syndicates have met auto-publish criteria or been reviewed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviewQueue.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#0F1E36] border border-blue-900/60 rounded-2xl p-6 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white"
                            style={{ backgroundColor: item.category?.color || '#2563EB' }}
                          >
                            {item.category?.name || 'World'}
                          </span>
                          <span className="text-xs text-slate-400">
                            Wire: <strong className="text-white">{item.source?.name || 'RSS Syndicate'}</strong>
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Ingested: {new Date(item.createdAt).toLocaleTimeString()}
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-lg text-white leading-snug">
                        {item.title}
                      </h3>

                      <div className="bg-[#0A1628] border border-blue-900/50 p-4 rounded-xl space-y-2">
                        <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Generated AI Summary</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-normal">
                          {item.summary}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-blue-900/60">
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <span>Inspect Original Wire Article</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => handleRejectQueueItem(item.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/40 text-xs font-semibold"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Discard</span>
                          </button>

                          <button
                            onClick={() => handleApproveQueueItem(item.id)}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Approve & Publish</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: SECTIONS & CATEGORIES */}
          {/* ============================================================ */}
          {activeTab === 'categories' && (
            <div className="space-y-6 max-w-4xl animate-fade-in">
              <div>
                <h2 className="text-2xl font-serif font-black text-white">Sections & Categories</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Manage publication sections, badge colors, and category distribution.
                </p>
              </div>

              {/* Add Category Form */}
              <form onSubmit={handleCreateCategory} className="bg-[#0F1E36] border border-blue-900/60 rounded-2xl p-6 space-y-4">
                <h3 className="font-serif font-bold text-sm text-white">Add Publication Section</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Section name (e.g. Opinion, Climate)..."
                    className="bg-[#0A1628] border border-blue-900/60 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newCategoryDesc}
                    onChange={(e) => setNewCategoryDesc(e.target.value)}
                    placeholder="Short description..."
                    className="bg-[#0A1628] border border-blue-900/60 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newCategoryColor}
                      onChange={(e) => setNewCategoryColor(e.target.value)}
                      className="h-9 w-12 bg-transparent rounded cursor-pointer"
                    />
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
                    >
                      Add Section
                    </button>
                  </div>
                </div>
              </form>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-[#0F1E36] border border-blue-900/60 rounded-2xl p-4 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-bold uppercase px-2.5 py-0.5 rounded text-white"
                          style={{ backgroundColor: cat.color || '#2563EB' }}
                        >
                          {cat.name}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {cat.articleCount || 0} articles
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                        {cat.description || 'Verified news section.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-blue-900/60 flex items-center justify-between text-xs">
                      <span className="font-mono text-[10px] text-slate-500">/{cat.slug}</span>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1 hover:bg-red-950 text-red-400 rounded"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 6: SYNDICATES & RSS FEEDS */}
          {/* ============================================================ */}
          {activeTab === 'sources' && (
            <div className="space-y-6 max-w-4xl animate-fade-in">
              <div>
                <h2 className="text-2xl font-serif font-black text-white">Syndication News Feeds</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Configure reputable news wire RSS feeds, credibility thresholds, and automated scraping targets.
                </p>
              </div>

              {/* Add Feed Form */}
              <form onSubmit={handleCreateSource} className="bg-[#0F1E36] border border-blue-900/60 rounded-2xl p-6 space-y-4">
                <h3 className="font-serif font-bold text-sm text-white">Register News Wire Syndicate</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={newSourceName}
                    onChange={(e) => setNewSourceName(e.target.value)}
                    placeholder="Source name (e.g. NPR World News)..."
                    className="bg-[#0A1628] border border-blue-900/60 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  />
                  <input
                    type="url"
                    required
                    value={newSourceUrl}
                    onChange={(e) => setNewSourceUrl(e.target.value)}
                    placeholder="Homepage URL (https://npr.org)..."
                    className="bg-[#0A1628] border border-blue-900/60 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">RSS Feed XML URL *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      required
                      value={newSourceFeedUrl}
                      onChange={(e) => setNewSourceFeedUrl(e.target.value)}
                      placeholder="https://feeds.npr.org/1001/rss.xml"
                      className="flex-1 bg-[#0A1628] border border-blue-900/60 rounded-xl p-2.5 text-xs text-white focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleTestFeed}
                      disabled={testFeedLoading}
                      className="px-3 py-2.5 rounded-xl bg-[#1A2B4A] hover:bg-blue-900/60 text-blue-300 text-xs font-semibold border border-blue-800/40"
                    >
                      {testFeedLoading ? 'Testing...' : 'Test Feed'}
                    </button>
                  </div>
                </div>

                {/* Feed Test Result */}
                {testFeedResult && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-xs text-emerald-300 space-y-1 font-mono">
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Valid RSS Feed: {testFeedResult.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Dispatches detected: {testFeedResult.itemsCount} • Sample: "{testFeedResult.sampleTitle}"
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Credibility Rating (60 - 100%)</label>
                    <input
                      type="number"
                      min="60"
                      max="100"
                      value={newSourceCredibility}
                      onChange={(e) => setNewSourceCredibility(e.target.value)}
                      className="w-full bg-[#0A1628] border border-blue-900/60 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Default Category Target</label>
                    <input
                      type="text"
                      value={newSourceCategory}
                      onChange={(e) => setNewSourceCategory(e.target.value)}
                      className="w-full bg-[#0A1628] border border-blue-900/60 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md"
                >
                  Save & Activate Syndicate
                </button>
              </form>

              {/* Sources Table */}
              <div className="space-y-3">
                {sources.map((src) => (
                  <div
                    key={src.id}
                    className="bg-[#0F1E36] border border-blue-900/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{src.name}</h4>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                          {src.credibilityScore}% Credibility
                        </span>
                        {src.isActive ? (
                          <span className="text-[10px] text-blue-300 bg-blue-950 px-2 py-0.5 rounded">Active</span>
                        ) : (
                          <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded">Paused</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono truncate max-w-lg">{src.feedUrl}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteSource(src.id, src.name)}
                        className="p-2 hover:bg-red-950 text-red-400 rounded-lg"
                        title="Delete Source"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 7: CRAWLER TELEMETRY & LOGS */}
          {/* ============================================================ */}
          {activeTab === 'crawler' && (
            <div className="space-y-6 max-w-5xl animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-serif font-black text-white">Crawler Orchestration & Logs</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Continuous monitoring of RSS fetch cycles, duplicate suppression, and ingestion health.
                  </p>
                </div>

                <button
                  onClick={handleTriggerCrawler}
                  disabled={crawlerRunning}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{crawlerRunning ? 'Crawling...' : 'Run Crawl Cycle Now'}</span>
                </button>
              </div>

              {/* Logs Table */}
              <div className="bg-[#0F1E36] border border-blue-900/60 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0A1628] border-b border-blue-900/60 text-slate-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Cycle Timestamp</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-center">Dispatches Scanned</th>
                      <th className="py-3 px-3 text-center">New Added</th>
                      <th className="py-3 px-3 text-center">Duplicates Blocked</th>
                      <th className="py-3 px-4">Cycle Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-950/80">
                    {crawlerLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-blue-950/40 font-mono">
                        <td className="py-3 px-4 text-slate-300">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.status === 'SUCCESS'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                                : 'bg-red-950 text-red-400 border border-red-800/40'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-white">{log.articlesFound}</td>
                        <td className="py-3 px-3 text-center text-emerald-400 font-bold">
                          +{log.articlesAdded}
                        </td>
                        <td className="py-3 px-3 text-center text-amber-400">
                          {log.duplicatesSkipped}
                        </td>
                        <td className="py-3 px-4 text-slate-400 max-w-sm truncate font-sans">
                          {log.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
