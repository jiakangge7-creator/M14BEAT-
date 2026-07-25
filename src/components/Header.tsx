import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Monitor, Settings, Download, LayoutGrid, Clock, Check } from 'lucide-react';
import { ThemeMode, SiteConfig } from '../types';
import { DynamicIcon } from './DynamicIcon';

interface HeaderProps {
  config: SiteConfig;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onOpenAdmin: () => void;
  isLoggedIn: boolean;
  activeTab: 'links' | 'files';
  onTabChange: (tab: 'links' | 'files') => void;
  fileCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  currentTheme,
  onThemeChange,
  onOpenAdmin,
  isLoggedIn,
  activeTab,
  onTabChange,
  fileCount,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('你好');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState<boolean>(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      let g = '你好';
      if (hours >= 5 && hours < 12) g = '早上好';
      else if (hours >= 12 && hours < 18) g = '下午好';
      else g = '晚上好';
      setGreeting(g);

      setCurrentTime(
        now.toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );

      setCurrentDate(
        now.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'short',
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            onClick={onOpenAdmin}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl p-0.5 flex items-center justify-center bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 shadow-md shadow-indigo-500/25 shrink-0 cursor-pointer hover:scale-105 transition-transform overflow-hidden"
            title="M14BEAT 官方Logo"
          >
            <img
              src="/logo.svg"
              alt="M14BEAT Logo"
              className="w-full h-full object-cover rounded-[10px]"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                {config.title || 'M14BEAT导航'}
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">
              {config.subtitle}
            </p>
          </div>
        </div>

        {/* Center Clock Widget - Hidden on small mobile */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 text-xs font-medium text-slate-600 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span>{greeting}！</span>
          <span className="font-mono text-slate-800 dark:text-slate-200">{currentTime}</span>
          <span className="text-slate-400 dark:text-slate-500">|</span>
          <span className="text-slate-500 dark:text-slate-400">{currentDate}</span>
        </div>

        {/* Right Actions: Navigation View Switcher, Theme Switcher, Admin Button */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Main Nav Tabs: Links vs Files */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs sm:text-sm font-medium border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => onTabChange('links')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'links'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>网址导航</span>
            </button>
            <button
              onClick={() => onTabChange('files')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'files'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>文件下载</span>
              {fileCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300">
                  {fileCount}
                </span>
              )}
            </button>
          </div>

          {/* Theme Dropdown Toggle */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setIsThemeMenuOpen((prev) => !prev)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 flex items-center justify-center"
              title="切换主题模式 (点击展开菜单)"
            >
              {currentTheme === 'light' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : currentTheme === 'dark' ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Monitor className="w-4 h-4 text-slate-500" />
              )}
            </button>
            
            {/* Theme popover menu */}
            {isThemeMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-700/90 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    onThemeChange('light');
                    setIsThemeMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
                    currentTheme === 'light'
                      ? 'text-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 dark:text-indigo-300'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sun className="w-3.5 h-3.5 text-amber-500" /> 浅色模式
                  </span>
                  {currentTheme === 'light' && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                </button>
                <button
                  onClick={() => {
                    onThemeChange('dark');
                    setIsThemeMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
                    currentTheme === 'dark'
                      ? 'text-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 dark:text-indigo-300'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Moon className="w-3.5 h-3.5 text-indigo-400" /> 深色模式
                  </span>
                  {currentTheme === 'dark' && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                </button>
                <button
                  onClick={() => {
                    onThemeChange('system');
                    setIsThemeMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
                    currentTheme === 'system'
                      ? 'text-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 dark:text-indigo-300'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Monitor className="w-3.5 h-3.5 text-slate-500" /> 跟随系统
                  </span>
                  {currentTheme === 'system' && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
