import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CategoryNav } from './components/CategoryNav';
import { LinkCard } from './components/LinkCard';
import { FileSection } from './components/FileSection';
import { AdminModal } from './components/AdminModal';
import { AppDatabase, LinkItem, Category, FileItem, ThemeMode } from './types';
import { fetchSiteData, recordLinkClick, verifyAdminSession, saveLink, deleteLink, deleteFileItem } from './utils/api';
import { getStoredTheme, applyTheme } from './utils/theme';
import { useDeviceDetect } from './utils/useDeviceDetect';
import { DynamicIcon } from './components/DynamicIcon';
import { Megaphone, Compass, Settings } from 'lucide-react';

export default function App() {
  const device = useDeviceDetect();
  const [siteData, setSiteData] = useState<Omit<AppDatabase, 'adminPasswordHash'> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // UI Navigation States
  const [activeTab, setActiveTab] = useState<'links' | 'files'>('links');
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLocalOnly, setIsLocalOnly] = useState<boolean>(true);

  // Theme & Auth
  const [themeMode, setThemeMode] = useState<ThemeMode>(getStoredTheme());
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // Initialize data & auth on mount
  const loadData = async () => {
    try {
      const data = await fetchSiteData();
      setSiteData(data);
    } catch (err: any) {
      setError('无法连接后端 API 服务或数据加载失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    verifyAdminSession().then((isValid) => setIsAdminLoggedIn(isValid));
  }, []);

  // Global Admin Keyboard Shortcut (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Theme effect
  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    applyTheme(mode);
  };

  useEffect(() => {
    applyTheme(themeMode);
  }, [themeMode]);

  // Click on link
  const handleLinkClick = (link: LinkItem) => {
    recordLinkClick(link.id);
    setSiteData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        links: prev.links.map((l) => (l.id === link.id ? { ...l, clicks: (l.clicks || 0) + 1 } : l)),
      };
    });
  };

  // Quick Pin Toggle
  const handleTogglePin = async (link: LinkItem) => {
    try {
      await saveLink({ ...link, isPinned: !link.isPinned });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Quick Delete Link
  const handleDeleteLink = async (id: string) => {
    if (!confirm('确定要删除该网址吗？')) return;
    try {
      await deleteLink(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // File Download Handler
  const handleDownloadFile = (file: FileItem) => {
    window.open(`/api/files/download/${file.id}`, '_blank');
  };

  // Delete File Handler
  const handleDeleteFile = async (id: string) => {
    if (!confirm('确定要删除该文件吗？')) return;
    try {
      await deleteFileItem(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate links counts per category
  const categoryLinkCounts = useMemo(() => {
    if (!siteData) return {};
    const counts: Record<string, number> = {};
    siteData.links.forEach((l) => {
      counts[l.categoryId] = (counts[l.categoryId] || 0) + 1;
    });
    return counts;
  }, [siteData]);

  // Filter links by category and search term
  const filteredLinks = useMemo(() => {
    if (!siteData) return [];
    return siteData.links.filter((link) => {
      // Category filter
      if (activeCategoryId === 'pinned' && !link.isPinned) return false;
      if (activeCategoryId !== 'all' && activeCategoryId !== 'pinned' && link.categoryId !== activeCategoryId) {
        return false;
      }

      // Search term filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = link.title.toLowerCase().includes(q);
        const matchesDesc = link.description.toLowerCase().includes(q);
        const matchesUrl = link.url.toLowerCase().includes(q);
        const matchesTags = link.tags && link.tags.some((t) => t.toLowerCase().includes(q));

        return matchesTitle || matchesDesc || matchesUrl || matchesTags;
      }

      return true;
    });
  }, [siteData, activeCategoryId, searchTerm]);

  // Group filtered links by category for display when viewing 'all'
  const groupedLinks = useMemo(() => {
    if (!siteData) return [];

    if (activeCategoryId !== 'all') {
      const activeCat = siteData.categories.find((c) => c.id === activeCategoryId) || {
        id: activeCategoryId,
        name: activeCategoryId === 'pinned' ? '置顶推荐' : '匹配分类',
        icon: 'Sparkles',
        order: 0,
      };
      return [{ category: activeCat, links: filteredLinks }];
    }

    // Grouping for 'all'
    const result: { category: Category; links: LinkItem[] }[] = [];
    siteData.categories.forEach((cat) => {
      const linksInCat = filteredLinks.filter((l) => l.categoryId === cat.id);
      if (linksInCat.length > 0) {
        result.push({ category: cat, links: linksInCat });
      }
    });

    // Catch any orphaned links without a matching category
    const knownCatIds = new Set(siteData.categories.map((c) => c.id));
    const orphanedLinks = filteredLinks.filter((l) => !knownCatIds.has(l.categoryId));
    if (orphanedLinks.length > 0) {
      result.push({
        category: { id: 'uncategorized', name: '未分类导航', icon: 'Folder', order: 999 },
        links: orphanedLinks,
      });
    }

    return result;
  }, [siteData, activeCategoryId, filteredLinks]);

  // Render Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center animate-bounce shadow-xl shadow-indigo-600/30 mb-4">
          <Compass className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 animate-pulse">
          正在载入 M14BEAT 导航...
        </p>
      </div>
    );
  }

  // Render Error State
  if (error || !siteData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl p-6 text-center border border-slate-200 dark:border-slate-700 shadow-xl">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">连接出错</h2>
          <p className="text-xs text-slate-500 mb-4">{error || '发生未知错误'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
          >
            刷新重试
          </button>
        </div>
      </div>
    );
  }

  const { config, categories, searchEngines, files } = siteData;

  // Grid classes automatically adapted to detected device type
  const gridClass =
    device.deviceType === 'mobile'
      ? 'grid grid-cols-1 gap-3'
      : device.deviceType === 'tablet'
      ? 'grid grid-cols-2 md:grid-cols-3 gap-4'
      : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col selection:bg-indigo-500 selection:text-white"
      style={
        config.customBackgroundUrl
          ? {
              backgroundImage: `url(${config.customBackgroundUrl})`,
              backgroundSize: 'cover',
              backgroundAttachment: 'fixed',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {/* Background Dim overlay if custom wallpaper is used */}
      {config.customBackgroundUrl && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] pointer-events-none z-0" />
      )}

      <div className="relative z-10 flex-1 flex flex-col">
        
        {/* Top Announcement Banner if defined */}
        {config.announcement && (
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white text-xs font-medium py-2 px-4 text-center flex items-center justify-center gap-2 shadow-sm">
            <Megaphone className="w-3.5 h-3.5 animate-bounce shrink-0" />
            <span className="truncate">{config.announcement}</span>
          </div>
        )}

        {/* Global Navigation Header */}
        <Header
          config={config}
          currentTheme={themeMode}
          onThemeChange={handleThemeChange}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
          isLoggedIn={isAdminLoggedIn}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          fileCount={files.length}
        />

        {/* Main Content View Switch */}
        {activeTab === 'links' ? (
          <main className="flex-1 pb-16">
            
            {/* Multi-Engine & Local Search Bar */}
            <SearchBar
              engines={searchEngines}
              defaultEngineId={config.defaultSearchEngineId}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              isLocalOnly={isLocalOnly}
              onToggleLocalOnly={setIsLocalOnly}
            />

            {/* Category Pill Tabs */}
            <CategoryNav
              categories={categories}
              activeCategoryId={activeCategoryId}
              onSelectCategory={setActiveCategoryId}
              categoryLinkCounts={categoryLinkCounts}
              totalLinksCount={siteData.links.length}
            />

            {/* Content Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 mt-4">
              {siteData.links.length === 0 ? (
                /* Empty state when default links are cleared for owner configuration */
                <div className="text-center py-16 px-4 bg-white/70 dark:bg-slate-800/70 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 shadow-sm max-w-2xl mx-auto my-8">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <Compass className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {config.title || 'M14BEAT导航'} 已就绪
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed mb-6">
                    系统已成功为您启动，初始数据已清空。您可以直接点击下方按钮登录后台面板，配置属于您的分类与导航网址。
                  </p>
                  <button
                    onClick={() => setIsAdminModalOpen(true)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all inline-flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>登录后台开始配置</span>
                  </button>
                </div>
              ) : groupedLinks.length === 0 ? (
                <div className="text-center py-16 bg-white/60 dark:bg-slate-800/60 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                  <Compass className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
                    未找到匹配的网址导航
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    未搜索到匹配项，建议尝试更改搜索关键字
                  </p>
                </div>
              ) : (
                groupedLinks.map(({ category, links }) => (
                  <section key={category.id} className="space-y-3">
                    
                    {/* Category Title Header */}
                    <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <DynamicIcon
                          name={category.icon}
                          className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
                          size={20}
                        />
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                          {category.name}
                        </h2>
                        <span className="text-xs text-slate-400 font-normal">
                          ({links.length})
                        </span>
                      </div>

                      {category.description && (
                        <span className="text-xs text-slate-400 hidden sm:inline">
                          {category.description}
                        </span>
                      )}
                    </div>

                    {/* Auto Device Grid Layout */}
                    <div className={gridClass}>
                      {links.map((link) => (
                        <LinkCard
                          key={link.id}
                          link={link}
                          onClick={handleLinkClick}
                          isAdmin={isAdminLoggedIn}
                          onEdit={() => setIsAdminModalOpen(true)}
                          onDelete={handleDeleteLink}
                          onTogglePin={handleTogglePin}
                        />
                      ))}
                    </div>
                  </section>
                ))
              )}
            </div>
          </main>
        ) : (
          /* Download Center View */
          <main className="flex-1 pb-16">
            <FileSection
              files={files}
              isAdmin={isAdminLoggedIn}
              onDownloadFile={handleDownloadFile}
              onAddFileClick={() => setIsAdminModalOpen(true)}
              onDeleteFile={handleDeleteFile}
            />
          </main>
        )}

        {/* Global Footer */}
        <footer className="py-6 border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-center text-xs text-slate-400 dark:text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>{config.footerText || '© 2026 M14BEAT导航. All rights reserved.'}</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                后台配置
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                返回顶部 ↑
              </button>
            </div>
          </div>
        </footer>

        {/* Floating Quick Action Button for Mobile / Touch device */}
        <button
          onClick={() => setIsAdminModalOpen(true)}
          className="fixed bottom-6 right-6 z-30 p-3.5 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-600/50 active:scale-90 hover:bg-indigo-700 transition-all sm:hidden flex items-center justify-center border-2 border-white/20"
          title="进入配置后台"
        >
          <Settings className="w-5 h-5 animate-spin-slow" />
        </button>

        {/* Admin Backend Config Dashboard Modal */}
        <AdminModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          isLoggedIn={isAdminLoggedIn}
          onLoginSuccess={() => setIsAdminLoggedIn(true)}
          siteData={siteData}
          onDataRefresh={loadData}
        />

      </div>
    </div>
  );
}
