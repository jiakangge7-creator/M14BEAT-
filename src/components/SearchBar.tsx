import React, { useState, useRef, useEffect } from 'react';
import { Search, Globe, ChevronDown, X, Sparkles, Filter } from 'lucide-react';
import { SearchEngine } from '../types';
import { DynamicIcon } from './DynamicIcon';

interface SearchBarProps {
  engines: SearchEngine[];
  defaultEngineId: string;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  isLocalOnly: boolean;
  onToggleLocalOnly: (local: boolean) => void;
  hotTags?: string[];
  onSelectTag?: (tag: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  engines,
  defaultEngineId,
  searchTerm,
  onSearchTermChange,
  isLocalOnly,
  onToggleLocalOnly,
  hotTags = ['开发', 'AI', '视频', '工具', '文档', '设计'],
  onSelectTag,
}) => {
  const [selectedEngineId, setSelectedEngineId] = useState<string>(defaultEngineId || 'bing');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedEngine = engines.find((e) => e.id === selectedEngineId) || engines[0] || {
    id: 'bing',
    name: '必应 Bing',
    url: 'https://cn.bing.com/search?q=%s',
    icon: 'Search',
    placeholder: '全网搜索...',
  };

  // Keyboard shortcut '/' or 'Cmd+K' / 'Ctrl+K'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    if (isLocalOnly) {
      // Already filtering locally
      return;
    }

    // Open target web search engine
    const queryUrl = selectedEngine.url.replace('%s', encodeURIComponent(searchTerm.trim()));
    window.open(queryUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-4 sm:my-8 px-4">
      <form
        onSubmit={handleSearchSubmit}
        className="relative flex items-center bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-indigo-500/5 dark:shadow-none border border-slate-200/90 dark:border-slate-700/80 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all duration-200"
      >
        {/* Search Engine Select Menu */}
        <div className="relative shrink-0 border-r border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-l-2xl transition-colors"
          >
            <DynamicIcon name={selectedEngine.icon} className="w-4 h-4 text-indigo-500" size={18} />
            <span className="hidden xs:inline">{selectedEngine.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Engine Dropdown list */}
          {isDropdownOpen && (
            <div className="absolute left-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                选择搜索引擎
              </div>
              {engines.map((engine) => (
                <button
                  key={engine.id}
                  type="button"
                  onClick={() => {
                    setSelectedEngineId(engine.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${
                    selectedEngineId === engine.id
                      ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <DynamicIcon name={engine.icon} className="w-4 h-4" size={16} />
                  <span>{engine.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input Field */}
        <div className="relative flex-1 flex items-center px-3">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder={
              isLocalOnly
                ? '在站内即时筛选网址或文件 (输入标题、标签、描述)...'
                : selectedEngine.placeholder || '输入内容进行全网搜索，或回车直达...'
            }
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none py-3"
          />

          {/* Clear input button */}
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchTermChange('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Local Filter Mode Toggle & Submit */}
        <div className="flex items-center gap-1.5 pr-2 shrink-0">
          <button
            type="button"
            onClick={() => onToggleLocalOnly(!isLocalOnly)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              isLocalOnly
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="点击切换：站内即时检索 / 搜索引擎全网查找"
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isLocalOnly ? '站内即搜' : '全网搜索'}</span>
          </button>

          <button
            type="submit"
            className="p-2.5 sm:px-4 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all shrink-0"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">搜索</span>
          </button>
        </div>
      </form>

      {/* Hot Tags / Filter Pills */}
      {hotTags && hotTags.length > 0 && (
        <div className="flex items-center justify-center flex-wrap gap-1.5 mt-3 px-2 text-xs">
          <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-amber-500" /> 热门视角:
          </span>
          {hotTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                onSearchTermChange(tag);
                if (onSelectTag) onSelectTag(tag);
              }}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                searchTerm === tag
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-indigo-50 dark:hover:bg-slate-700'
              }`}
            >
              #{tag}
            </button>
          ))}
          {searchTerm && (
            <button
              onClick={() => onSearchTermChange('')}
              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 underline ml-1"
            >
              重置筛选
            </button>
          )}
        </div>
      )}
    </div>
  );
};
